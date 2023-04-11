import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import classes from './index.module.scss';
import View from '../../types/View';
import cn from 'classnames';
import EverIcon from '../EverIcon';
import useCommissions from '../../hooks/useCommissions';
import CommissionUtil from '../../utils/CommissionUtil';
import { useFormatAmount } from '../../hooks/useFormatPrice';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const Properties = <T,>({
  items,
  renderItemLabel,
  renderItemValue,
  resolveHideItemInMobile,
  resolveIsHighlighted,
  resolveBlackColor,
  resolveIsGreyColor,
  labelProps,
  valueProps,
  commissionsIds,
  ...restProps
}: Props<T>) => {
  const commissions = useCommissions();
  const { isDesktopWidth } = useWindowDimensions();
  let suitableCommissions: any;
  let sumFees = 0;
  const fees = (commissionsIds: any) => {
    if (commissionsIds) {
      suitableCommissions = CommissionUtil.getByIds(commissions, commissionsIds);
      suitableCommissions.forEach((item: any) => {
        sumFees += Number(item.value);
      });
    }
    return sumFees;
  };
  fees(commissionsIds);

  return (
    <div {...restProps} className={cn(classes.properties, restProps.className)}>
      {items.map((item: any, index) => {
        if (resolveHideItemInMobile?.(item) && !isDesktopWidth) {
          return;
        }
        return (
          <React.Fragment key={index}>
            <span
              key={index.toString()}
              {...labelProps}
              className={
                item
                  ? cn(classes.label, labelProps?.className, {
                      [classes.label_highlighted!]: resolveIsHighlighted?.(item),
                      [classes.label_black!]: resolveBlackColor?.(item),
                      [classes.label_grey!]: resolveIsGreyColor?.(item),
                    })
                  : classes.dn
              }>
              {renderItemLabel(item)}
              {item?.label === 'fees' && (
                <span className={classes.feesIcon}>
                  <EverIcon /> {useFormatAmount(sumFees)}
                </span>
              )}
            </span>
            <span
              {...valueProps}
              key={`${index}x`}
              className={item ? cn(classes.value, valueProps?.className) : classes.dn}>
              {renderItemValue(item)}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface Props<T> extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  items: T[];
  renderItemLabel: (item: any) => View;
  renderItemValue: (item: any) => View;
  resolveHideItemInMobile?: (item: any) => boolean;
  resolveIsHighlighted?: (item: any) => boolean;
  resolveBlackColor?: (item: any) => boolean;
  resolveIsGreyColor?: (item: any) => boolean;
  labelProps?: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  valueProps?: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  commissionsIds?: any;
}

export default Properties;
