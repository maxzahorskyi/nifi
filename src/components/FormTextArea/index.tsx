import React from 'react';
import { Form, Input } from 'antd';
import { useField } from 'formik';
import { TextAreaProps } from 'antd/lib/input';
import classes from './index.module.scss';
import cn from 'classnames';

const FormTextArea = ({
  name,
  renderValue = (value) => value,
  className,
  wrapClassName,
  ...props
}: Props) => {
  const [field, meta] = useField(name);

  return (
    <Form.Item
      help={meta.touched && meta.error}
      validateStatus={meta.touched && meta.error ? 'error' : ''}
      className={cn(wrapClassName)}>
      <Input.TextArea
        {...props}
        className={cn(className, classes.textarea, 'rounded', 'background-grey')}
        value={field.value || field.value === '' ? renderValue(field.value) : props.value}
        onChange={field.onChange(name)}
        onBlur={field.onBlur(name)}
      />
    </Form.Item>
  );
};

interface Props extends TextAreaProps {
  name: string;
  renderValue?: (value: any) => string | number;
  wrapClassName?: string;
}

export default FormTextArea;
