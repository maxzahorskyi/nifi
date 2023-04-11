import React, { CSSProperties } from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../styles/form.module.scss';
import FormInput from '../../../../components/FormInput';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import Button, { ButtonType } from '../../../../components/Button';
import Fees from '../../../../components/Fees';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import EverIcon from '../../../../components/EverIcon';

const MakeBidForm = ({ className, loading, onSubmit }: Props) => {
  return (
    <div className={classes.formWrap}>
      <Properties
        className={cn(classes.form, className)}
        items={[
          {
            label: 'bid price',
            value: (
              <div className={classes.priceBid}>
                <EverIcon />
                <FormInput
                  placeholder="Enter bid price"
                  name="bidPrice"
                  bordered={false}
                  wrapClassName={cn(classes.formControlWrap, classes.price)}
                  className={classes.formControl}
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  disabled={loading.bid}
                />
              </div>
            ),
          },
        ]}
        renderItemLabel={(item) => (
          <span className={classes.form__textWithIcon}>
            <ArrowRightIcon className={classes.arrow} /> {item.label}:
          </span>
        )}
        renderItemValue={(item) => item.value}
        labelProps={{
          className: classes.form__label,
        }}
        valueProps={{
          className: classes.form__value,
        }}
      />

      <Button
        styleType={ButtonType.Primary}
        type="submit"
        key="createAuction"
        loading={loading.submitBid}
        className={classes.submitBid}
        disabled={loading.bid}
        onClick={onSubmit}>
        Submit your bid
      </Button>
    </div>
  );
};

export default MakeBidForm;

interface Props {
  className?: string;
  onSubmit: any;
  loading: Partial<Loading>;
  style?: CSSProperties;
}

interface Loading {
  bid: boolean;
  submitBid: boolean;
}
