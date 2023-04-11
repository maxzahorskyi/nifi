import React, { ButtonHTMLAttributes, DetailedHTMLProps, useState } from 'react';
import classes from './index.module.scss';
import cn from 'classnames';
import { Switch } from 'antd';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const ThemeSwitcher = ({ className, classNameWrap, setTheme }: Props) => {
  const [isChecked, setIsChecked] = useState<boolean>(
    typeof window !== 'undefined' && Boolean(Number(localStorage.getItem('Theme'))),
  );
  const { width, maxMobileWidth } = useWindowDimensions();

  return (
    <div className={cn(classNameWrap, classes.switch)}>
      <Switch
        checked={isChecked}
        className={cn(className)}
        size={width > maxMobileWidth ? 'default' : 'small'}
        onChange={(checked) => {
          Number(localStorage.getItem('Theme'))
            ? localStorage.setItem('Theme', '0')
            : localStorage.setItem('Theme', '1');
          setIsChecked(checked);
          setTheme(isChecked);
        }}
      />
    </div>
  );
};

interface Props
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  className?: any;
  classNameWrap?: any;
  setTheme?: any;
}

export default ThemeSwitcher;
