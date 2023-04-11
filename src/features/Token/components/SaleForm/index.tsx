import React, { CSSProperties } from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../styles/form.module.scss';
import FormInput from '../../../../components/FormInput';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import Button, { ButtonType } from '../../../../components/Button';
import FormDateTimePicker from '../../../../components/FormDateTimePicker';
import EverIcon from '../../../../components/EverIcon';

const SaleForm = ({
  className,
  style,
  submitForm,
  loading,
  proceedEndTime,
  proceedPrice,
}: Props) => {
  return (
    <div className={classes.formWrap} style={style}>
      <Properties
        className={cn(classes.form, className)}
        items={[
          {
            label: 'closing time:',
            value: (
              <FormDateTimePicker
                proceedTime={proceedEndTime}
                disabled={loading}
                name="endTime"
                required
                min={new Date()}
              />
            ),
          },
          {
            label: 'sale price:',
            value: (
              <div className={classes.saleFormIcon}>
                <span className={classes.saleFormIcon_tonWrap}>
                  <EverIcon />
                </span>
                <FormInput
                  placeholder="0,00"
                  proceedPrice={proceedPrice}
                  name="price"
                  bordered={false}
                  wrapClassName={classes.formControlWrap}
                  className={classes.formControl}
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>
            ),
          },
        ]}
        renderItemLabel={(item) => (
          <span className={classes.form__textWithIcon}>
            <ArrowRightIcon /> {item.label}
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
        styleType={ButtonType.Secondary}
        onClick={submitForm}
        className={classes.createAsk}
        loading={loading}>
        Create offer
      </Button>
    </div>
  );
};

export default SaleForm;

interface Props {
  proceedEndTime: number | undefined;
  proceedPrice: number | undefined;
  className?: string;
  style?: CSSProperties;
  submitForm?: any;
  loading?: boolean;
}
