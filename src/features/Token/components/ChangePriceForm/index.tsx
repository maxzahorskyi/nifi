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

const ChangePriceForm = ({ className, style, submitForm, loading }: Props) => {
  return (
    <div className={classes.formWrap} style={style}>
      <Properties
        className={cn(classes.form, className)}
        items={[
          {
            label: 'sale price:',
            value: (
              <div className={classes.saleFormIcon}>
                <EverIcon />{' '}
                <FormInput
                  placeholder="0,00"
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
      <Properties
        className={classes.feesModal}
        items={[
          {
            label: 'fees',
            value: <Fees commissionsIds={[CommissionTypes.AskPriceChange]} />,
          },
        ]}
        commissionsIds={[CommissionTypes.AskPriceChange]}
        renderItemLabel={(item) => (
          <span className={classes.form__blackTextWithIcon}>
            <ArrowRightIcon /> {item.label}
          </span>
        )}
        renderItemValue={(item) => item.value}
        labelProps={{
          className: classes.saleFees__label,
        }}
        valueProps={{
          className: classes.saleFees__value,
        }}
      />
      <Button styleType={ButtonType.Primary} onClick={submitForm} loading={loading}>
        Change price
      </Button>
    </div>
  );
};

export default ChangePriceForm;

interface Props {
  className?: string;
  style?: CSSProperties;
  submitForm?: any;
  loading?: boolean;
}
