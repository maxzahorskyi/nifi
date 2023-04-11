import React, { CSSProperties } from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../styles/form.module.scss';
import FormInput from '../../../../components/FormInput';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import Button, { ButtonType } from '../../../../components/Button';
import FormDateTimePicker from '../../../../components/FormDateTimePicker';
import Fees from '../../../../components/Fees';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import EverIcon from '../../../../components/EverIcon';
import getCurrentWallet from '../../../../utils/GetCurrentWallet';

const MakeOfferForm = ({ className, loading, onSubmit }: Props) => {
  return (
    <div className={classes.formWrap}>
      <Properties
        className={cn(classes.form, className)}
        items={[
          {
            label: 'bid price',
            value: (
              <div className={classes.saleFormIcon}>
                {getCurrentWallet({ size: 24, line: 27 })}
                <FormInput
                  placeholder="0,00"
                  name="offerPrice"
                  bordered={false}
                  wrapClassName={cn(classes.formControlWrap, classes.price)}
                  className={classes.formControl}
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  disabled={loading.submitOffer}
                />
              </div>
            ),
          },
          {
            label: 'end time',
            value: (
              <FormDateTimePicker
                disabled={loading.submitOffer}
                name="endTime"
                required
                min={new Date()}
              />
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
        onClick={onSubmit}
        className={classes.makeBid}
        key="createAuction"
        loading={loading.submitOffer}
        disabled={loading.offer}>
        Create bid
      </Button>
    </div>
  );
};

export default MakeOfferForm;

interface Props {
  className?: string;
  loading: Partial<Loading>;
  onSubmit: any;
  style?: CSSProperties;
}

interface Loading {
  offer: boolean;
  submitOffer: boolean;
}
