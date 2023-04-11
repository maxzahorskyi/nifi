import React, { useState } from 'react';
import classes from './index.module.scss';
import { GQLToken } from '../../types/graphql.schema';
import Actor from '../../features/Activity/components/Actor';
import ForeverToken from '../ForeverToken';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useTokens } from '../../hooks/tokens';
import { Spin } from 'antd';

const ForeverTokens = ({ foreverID, foreverTitle, setForeverTokensNumber }: Props) => {
  const [tokens, setTokens] = useState<GQLToken[]>();
  const { width, maxMobileWidth } = useWindowDimensions();

  useTokens({
    skipQuery: !foreverID,
    variables: {
      query: {
        deployed: {
          foreverID,
        },
      },
    },
    pollInterval: !foreverID ? 1000 : undefined,
    onSuccess: (data) => {
      setTokens(data);
      setForeverTokensNumber(data.length);
    },
    onError: (e) => console.log(e),
  });

  return tokens ? (
    <div className={classes.wrapper}>
      {width < maxMobileWidth && <div className={classes.foreverTitleRow}>{foreverTitle}</div>}
      <div className={classes.titleRow}>
        <span>Token</span> <span>Creator</span>
      </div>
      {tokens.map((token) => (
        <div className={classes.tokenInfoRow}>
          <ForeverToken token={token} />
          {token?.deployed?.creator && (
            <div className={classes.user}>
              <Actor address={token?.deployed?.creator} />
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className={classes.wrapper}>
      <div className="centered">
        <Spin size="large" tip="Tokens are being loaded" />
      </div>
    </div>
  );
};

interface Props {
  foreverID?: string;
  foreverTitle?: string;
  setForeverTokensNumber?: any;
}

export default ForeverTokens;
