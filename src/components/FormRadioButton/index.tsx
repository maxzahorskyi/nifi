import React from 'react';
import { Form, InputProps, Radio } from 'antd';
import { useField } from 'formik';
import classes from './index.module.scss';
import cn from 'classnames';

const FormRadioButton = ({
  name,
  renderValue = (value) => value,
  className,
  wrapClassName,
  valueTextAlign,
  setChanged,
  values,
}: Props) => {
  const [field, meta] = useField(name);
  return (
    <Form.Item
      help={meta.touched && meta.error}
      validateStatus={meta.touched && meta.error ? 'error' : ''}
      className={wrapClassName}>
      <Radio.Group
        className={cn(className, classes.input)}
        style={{ textAlign: valueTextAlign }}
        value={renderValue(field.value)}
        onChange={(e: any) => {
          field.onChange(name)(e);
          setChanged(true);
        }}>
        {values.map((item: any) => {
          return <Radio value={item}>{item}</Radio>;
        })}
      </Radio.Group>
    </Form.Item>
  );
};

interface Props extends InputProps {
  name: string;
  values: string[] | number[];
  renderValue?: (value: any) => string | number;
  wrapClassName?: string;
  setChanged?: any; // TODO: replace any
  valueTextAlign?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
}

export default FormRadioButton;
