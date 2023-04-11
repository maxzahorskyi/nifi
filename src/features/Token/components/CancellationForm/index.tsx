import React, { CSSProperties } from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../styles/form.module.scss';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import Button, { ButtonType } from '../../../../components/Button';
import Fees from '../../../../components/Fees';
import { CommissionTypes } from '../../../../types/CommissionTypes';

const CancellationForm = ({ style, submitForm, loading }: Props) => {
  return (
    <div className={classes.formWrap} style={style}>
      <Button styleType={ButtonType.Primary} onClick={submitForm} loading={loading}>
        Cancel sale offer
      </Button>
      <Properties
        className={cn(classes.feesModal)}
        items={[
          {
            label: 'fees',
            value: <Fees commissionsIds={[CommissionTypes.AskCancel]} />,
          },
        ]}
        commissionsIds={[CommissionTypes.AskCancel]}
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
    </div>
  );
};

export default CancellationForm;

interface Props {
  className?: string;
  style?: CSSProperties;
  submitForm?: any;
  loading?: boolean;
}
