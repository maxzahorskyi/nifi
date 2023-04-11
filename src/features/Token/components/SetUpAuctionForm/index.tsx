import React, { CSSProperties } from 'react';
import classes from '../../styles/form.module.scss';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import Properties from '../../../../components/Properties';
import FormInput from '../../../../components/FormInput';
import FormDateTimePicker from '../../../../components/FormDateTimePicker';
import Button, { ButtonType } from '../../../../components/Button';
import cn from 'classnames';
import { useField } from 'formik';
import EverIcon from '../../../../components/EverIcon';

const SetUpAuctionForm = ({
  loading,
  onSubmit,
  proceedEndTime,
  proceedStartTime,
  proceedStartBid,
  proceedStepBid,
}: Props) => {
  const [{ value }] = useField<number>('startTime');
  return (
    <div className={classes.formWrap}>
      <Properties
        className={classes.form}
        items={[
          {
            label: 'start time',
            value: (
              <FormDateTimePicker
                proceedTime={proceedStartTime}
                disabled={loading.createAuction}
                name="startTime"
                required
                min={new Date()}
              />
            ),
          },
          {
            label: 'closing time',
            value: (
              <FormDateTimePicker
                disabled={loading.createAuction}
                proceedTime={proceedEndTime}
                name="endTime"
                required
                min={new Date(value)}
              />
            ),
          },
          {
            label: 'minimal bid',
            value: (
              <div className={classes.saleFormIcon}>
                <EverIcon />{' '}
                <FormInput
                  name="startBid"
                  proceedPrice={proceedStartBid}
                  placeholder="0,00"
                  bordered={false}
                  wrapClassName={cn(classes.formControlWrap, classes.price)}
                  className={classes.formControl}
                  type="number"
                  required
                  disabled={loading.createAuction}
                />
              </div>
            ),
          },
          {
            label: 'auction step',
            value: (
              <div className={classes.saleFormIcon}>
                <EverIcon />
                <FormInput
                  name="stepBid"
                  proceedPrice={proceedStepBid}
                  placeholder="0,00"
                  bordered={false}
                  wrapClassName={cn(classes.formControlWrap, classes.price)}
                  className={classes.formControl}
                  type="number"
                  required
                  disabled={loading.createAuction}
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
        key="createAuction"
        loading={loading.createAuction}
        disabled={loading.auction}
        className={classes.createAction}
        onClick={onSubmit}>
        Create auction
      </Button>
    </div>
  );
};

export default SetUpAuctionForm;

interface Props {
  proceedEndTime: number | undefined;
  proceedStartTime: number | undefined;
  proceedStartBid: number | undefined;
  proceedStepBid: number | undefined;
  loading: Partial<Loading>;
  onSubmit: any;
  style?: CSSProperties;
}

interface Loading {
  createAuction: boolean;
  auction: boolean;
}
