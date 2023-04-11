import React, { useState } from 'react';
import { GQLDaily, GQLDailySortByInput } from '../../../../types/graphql.schema';
import { useDailies } from '../../../../hooks/daylies';
import { Line, LineConfig } from '@ant-design/plots';
import TonUtil from '../../../../utils/TonUtil';
import classes from './index.module.scss';

const Charts = () => {
  const [dailies, setDailies] = useState<GQLDaily[] | undefined>();
  const [configTokens, setConfigTokens] = useState<LineConfig | undefined>();
  const [configSales, setConfigSales] = useState<LineConfig | undefined>();
  useDailies({
    skipQuery: false,
    variables: {
      sortBy: GQLDailySortByInput.DATE_DESC,
    },
    onSuccess: (data) => {
      setDailies(data?.dailies || undefined);
    },
    onError: (e) => console.log(e),
  });

  React.useEffect(() => {
    if (dailies) {
      const dailiesCreated = dailies.filter((daily) => daily.tokensCreated);
      const dailiesSold = dailies.filter((daily) => daily.tokensSold);

      const configSaleData = [
        ...dailiesSold.map((daily) => ({
          category: 'Sale Average',
          xAxis: {
            type: 'time',
          },
          date: new Date((daily?.date || 0) * 1000).toDateString(),
          value: daily.saleAverage ? TonUtil.convertNanoTonToTon(daily.saleAverage) : 0,
        })),
        ...dailiesSold.map((daily) => ({
          category: 'Sale Max',
          xAxis: {
            type: 'time',
          },
          date: new Date((daily?.date || 0) * 1000).toDateString(),
          value: daily.saleMax ? TonUtil.convertNanoTonToTon(daily.saleMax) : 0,
        })),
        ...dailiesSold.map((daily) => ({
          category: 'Sale Min',
          xAxis: {
            type: 'time',
          },
          date: new Date((daily?.date || 0) * 1000).toDateString(),
          value: daily.saleMin ? TonUtil.convertNanoTonToTon(daily.saleMin) : 0,
        })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const configTokenData = [
        ...dailiesCreated.map((daily) => ({
          category: 'Tokens Created',
          date: new Date((daily?.date || 0) * 1000).getTime(),
          value: daily.tokensCreated,
        })),
        ...dailiesSold.map((daily) => ({
          category: 'Tokens Sold',
          date: new Date((daily?.date || 0) * 1000).getTime(),
          value: daily.tokensSold,
        })),
      ].sort((a, b) => a.date - b.date);

      const minTokenDate = Math.min(...configTokenData.map((item) => item.date)) || 0;
      const maxTokenDate = Math.max(...configTokenData.map((item) => item.date)) || 0;

      setConfigTokens({
        data: configTokenData,
        animation: {
          appear: {
            animation: 'path-in',
            duration: 5000,
          },
        },
        xAxis: {
          type: 'time',
          min: minTokenDate,
          max: maxTokenDate,
        },
        xField: 'date',
        seriesField: 'category',
        yField: 'value',
      });

      setConfigSales({
        data: configSaleData,
        xAxis: {
          type: 'time',
        },
        animation: {
          appear: {
            animation: 'path-in',
            duration: 5000,
          },
        },
        xField: 'date',
        seriesField: 'category',
        yField: 'value',
      });
    }
  }, [dailies]);

  return (
    <div className={classes.chartsWrapper}>
      {configTokens && <Line {...configTokens} className={classes.chart} />}
      {configSales && <Line {...configSales} className={classes.chart} />}
    </div>
  );
};

export default Charts;
