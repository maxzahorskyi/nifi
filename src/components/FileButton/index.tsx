import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  HTMLAttributes,
  InputHTMLAttributes,
  useRef,
} from 'react';
import View from '../../types/View';
import TextButton from '../TextButton';

const FileButton = ({ children, wrapProps, buttonProps, fileInputProps }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <span
      {...wrapProps}
      onClick={(e) => {
        wrapProps?.onClick?.(e);
        fileInputRef.current?.click();
      }}>
      <TextButton {...buttonProps} className={buttonProps?.className} type="button">
        {children}
      </TextButton>
      <input
        {...fileInputProps}
        ref={fileInputRef}
        type="file"
        style={{
          display: 'none',
        }}
      />
    </span>
  );
};

interface Props {
  children: View;
  wrapProps?: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  buttonProps?: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  fileInputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}

export default FileButton;
