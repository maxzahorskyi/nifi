import React from 'react';
import { Form, InputProps, Select } from 'antd';
import { useField } from 'formik';
import classes from './index.module.scss';
import cn from 'classnames';
import { toFormatWalletAddress } from '../../utils/toFormatWalletAddress';

const SelectFormInput = ({
  name,
  renderValue = (value) => value,
  className,
  wrapClassName,
  onChange,
  valueTextAlign,
  setFunction,
  optionClassName,
  values,
  isAddress = true,
}: Props) => {
  const [field, meta] = useField(name);
  return (
    <Form.Item
      help={meta.touched && meta.error}
      validateStatus={meta.touched && meta.error ? 'error' : ''}
      className={wrapClassName}>
      <Select
        className={cn(className, classes.input)}
        style={{ textAlign: valueTextAlign }}
        value={renderValue(field.value)}
        onChange={(e) => {
          field.onChange(name)(e as string);
          setFunction && setFunction(true);
        }}
        onBlur={field.onBlur(name)}>
        {values.map((item: any) => {
          return (
            <Select.Option className={optionClassName} value={item}>
              {isAddress ? toFormatWalletAddress(item, 8) : item}
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

interface Props extends InputProps {
  name: string;
  values: string[] | number[];
  renderValue?: (value: any) => string | number;
  wrapClassName?: string;
  optionClassName?: string;
  setFunction?: any;
  valueTextAlign?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
  isAddress?: boolean;
}

export default SelectFormInput;
