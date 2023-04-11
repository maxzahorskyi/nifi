import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import Image from 'next/image';
import classes from './index.module.scss';
import cn from 'classnames';
import View from '../../types/View';
import { Skeleton } from 'antd';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const UserInfo = <Parameter,>({
  name,
  avatarUrl,
  parameters,
  renderParameter = (parameter) => parameter,
  ...restProps
}: Props<Parameter>) => {
  const { width, maxMobileWidth } = useWindowDimensions();
  return (
    <div {...restProps} className={cn(classes.wrap, restProps.className)}>
      {avatarUrl ? (
        <img
          alt="avatar"
          src={avatarUrl}
          width={width > maxMobileWidth ? 80 : 50}
          height={width > maxMobileWidth ? 80 : 50}
          className={classes.avatar}
        />
      ) : (
        <Skeleton.Avatar size={width > maxMobileWidth ? 80 : 50} />
      )}

      <div className={cn(classes.info, classes.wrap__info)}>
        <span className={cn(classes.name, classes.info__name)}>{name}</span>

        {parameters && (
          <div className={classes.description}>
            {parameters.map((parameter, index) => (
              <span key={index} className={classes.description__item}>
                {renderParameter(parameter)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface Props<Parameter>
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  name: View;
  avatarUrl: string | undefined;
  parameters?: Parameter[];
  renderParameter?: (parameter: Parameter) => View;
}

export default UserInfo;
