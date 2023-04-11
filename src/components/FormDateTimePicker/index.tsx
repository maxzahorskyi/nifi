import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import { DatePicker, DatePickerProps } from 'antd';
import { useField } from 'formik';
import DateUtil from '../../utils/DateUtil';
import cn from 'classnames';
import moment from 'moment';

type PickerChangeFn = NonNullable<DatePickerProps['onChange']>;
type PickerValue = Parameters<PickerChangeFn>[0];

const FormDateTimePicker = ({ name, required, min, disabled, proceedTime }: Props) => {
  const [field, meta, helper] = useField(name);

  const [datePickerValue, setDatePickerValue] = useState<PickerValue>();
  const [timePickerValue, setTimePickerValue] = useState<PickerValue>();

  const onDateChange: PickerChangeFn = (value) => {
    if (!value) {
      helper.setValue(0);
      return;
    }
    setDatePickerValue(value);
  };

  const onTimeChange: PickerChangeFn = (value) => {
    if (!value) {
      helper.setValue(0);
      return;
    }
    setTimePickerValue(value);
  };

  useEffect(() => {
    if (!field.value) {
      setDatePickerValue(undefined);
      setTimePickerValue(undefined);
    }
  }, [field.value]);

  useEffect(() => {
    if (!datePickerValue || !timePickerValue) {
      helper.setValue(0);
      return;
    }
    helper.setValue(
      +datePickerValue
        .set({
          hours: timePickerValue.get('hours'),
          minutes: timePickerValue.get('minutes'),
          seconds: timePickerValue.get('seconds'),
        })
        .toDate(),
    );
  }, [datePickerValue, timePickerValue]);

  return (
    <div className={cn(classes.dateTimePicker, 'rounded', 'background-grey')}>
      <div className={classes.inputWrap}>
        <DatePicker
          bordered={false}
          value={proceedTime ? moment(proceedTime * 1000) : datePickerValue}
          onChange={onDateChange}
          format="DD.MM.YY"
          style={{ width: '110px' }}
          suffixIcon={null}
          clearIcon={null}
          placeholder="Date"
          disabled={disabled}
        />
      </div>
      <div className={classes.inputWrap}>
        <DatePicker
          bordered={false}
          value={proceedTime ? moment(proceedTime * 1000) : timePickerValue}
          picker="time"
          onChange={onTimeChange}
          format="HH:mm"
          style={{ width: '67px' }}
          suffixIcon={null}
          clearIcon={null}
          placeholder="Time"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default FormDateTimePicker;

interface Props {
  proceedTime?: number | undefined;
  name: string;
  required?: boolean;
  min?: Date;
  disabled?: boolean;
}
