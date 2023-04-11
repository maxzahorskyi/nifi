import React from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import { Select } from 'antd';
import cn from 'classnames';
import { GQLFormat } from '../../../../types/graphql.schema';
import { SetFieldValue } from '../../../../types/Tokens/Token';

const StampFormatSizeSelect = ({ formatData, values, setFieldValue }: Props) => {
  return (
    <Properties
      className={cn(
        classes.propertiesCreate,
        classes.propertiesCreate_format,
        classes.standardMarginDesktop,
        classes.formatCategory,
      )}
      items={[
        {
          name: 'Format',
          value: (
            <Select
              defaultValue="Free size"
              bordered={false}
              onChange={(value: any) => {
                values.format = value;
              }}
              className={cn(classes.select, classes.formControl)}>
              {formatData?.map(({ formatName, height, width }) => (
                <Select.Option value={`${width} x ${height} px`}>{formatName}</Select.Option>
              ))}
            </Select>
          ),
          required: true,
        },
      ]}
      renderItemLabel={(item) => item.name}
      renderItemValue={(item) => item.value}
      labelProps={{
        className: classes.createLabelWidth,
      }}
      resolveIsHighlighted={(item) => item.required}
    />
  );
};

interface Props {
  values: any;
  formatData: GQLFormat[] | undefined;
  setFieldValue: SetFieldValue;
}

export default StampFormatSizeSelect;
