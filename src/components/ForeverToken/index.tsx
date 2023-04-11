import React, { useEffect } from 'react';
import classes from '../ForeverTokens/index.module.scss';
import { GQLToken } from '../../types/graphql.schema';
import getMediaUrl from '../../utils/getMediaUrl';
import cn from 'classnames';
import { Skeleton } from 'antd';
import Link from 'next/link';
import ActivityUtils from '../../features/Activity/utils/ActivityUtils';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const ForeverToken = ({ token }: Props) => {
  const [link, setLink] = React.useState<string>('');

  const preview = token?.raw?.media?.find(({ role }: any) => role === 'preview')?.hash;

  useEffect(() => {
    setLink(ActivityUtils.resolveTokenLinkByToken({ token }));
  }, []);

  return (
    <Link href={link}>
      <a>
        <div className={cn(classes.token, 'link')}>
          <div className={classes.token__image}>
            {preview ? (
              <img
                src={getMediaUrl(preview, 'image', {
                  width: 68,
                  height: 68,
                  compressionQuality: 70,
                })}
                width={68}
                height={68}
                alt={token?.raw?.media?.[0]?.subtitle}
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <Skeleton.Image style={{ width: '68px', height: '68px' }} />
            )}
          </div>
          <span className={classes.tokenTitle}>{token?.raw?.title}</span>
        </div>
      </a>
    </Link>
  );
};

interface Props {
  token?: GQLToken;
}

export default ForeverToken;
