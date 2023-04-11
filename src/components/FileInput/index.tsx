import React, { DetailedHTMLProps, HTMLAttributes, InputHTMLAttributes, useRef } from 'react';
import Input, { Props as InputProps } from '../Input';
import LinkList from '../LinkList';
import classes from './index.module.scss';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const FileInput = ({
  wrapProps,
  fileInputProps,
  isTokenPageCreate,
  isInputVisible,
  type = 'text',
  ...props
}: Props) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowDimensions();

  const onInputClick = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    const element = event.target as HTMLInputElement;
    element.value = '';
  };

  return (
    <div
      {...wrapProps}
      className={`${cn(classes.inputWrap, wrapProps?.className)}
        
        ${isTokenPageCreate && classes.inputWrapTokenPageCreate}`}>
      <Input
        {...props}
        style={{ display: isInputVisible ? 'block' : 'none' }}
        disabled
        className={classes.inputWrap__input}
      />

      <div>
        {type === 'circle' ? (
          <div className={classes.plusCircleButton} onClick={() => fileInputRef.current?.click()}>
            <img src="/icons/plusWhite.svg" alt="plusIcon" />
          </div>
        ) : (
          <LinkList
            items={[t('FileInput.Browse')]}
            getItemTitle={(i) => i}
            getIsActive={(_) => true}
            handleItemClick={() => {
              fileInputRef.current?.click();
            }}
          />
        )}
        <input
          {...fileInputProps}
          className={classes.fileInput}
          ref={fileInputRef}
          type="file"
          onClick={(e) => onInputClick(e)}
        />
      </div>
    </div>
  );
};

interface Props extends InputProps {
  type?: 'text' | 'circle';
  wrapProps?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  fileInputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  isTokenPageCreate?: boolean;
  isInputVisible?: boolean;
}

export default FileInput;
