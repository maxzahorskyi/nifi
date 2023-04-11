import React from 'react';
import classes from './index.module.scss';
import Category from '../../../../../components/Category';
import Button, { ButtonType } from '../../../../../components/Button';
import { useTranslation } from 'react-i18next';

const PaymentSettings = (propsL: Props) => {
  const { t } = useTranslation();

  return (
    <Category title={t('PaymentSettings.Title')}>
      <div className={classes.categoryContent}>
        <div>
          <span className={classes.link}>{t('PaymentSettings.LearnMore')}</span>
          <span>{t('PaymentSettings.About')}</span>
        </div>

        <div className={classes.item}>
          <span className={classes.item__label}>{t('PaymentSettings.PayPal')}:</span>
          <div className={classes.item__button}>
            <Button styleType={ButtonType.Secondary}>{t('PaymentSettings.ConnectPayPal')}</Button>
          </div>
          <span>{t('PaymentSettings.Hint')}</span>
        </div>

        <div className={classes.item}>
          <span className={classes.item__label}>{t('PaymentSettings.DigitalWallet')}:</span>
          <div className={classes.item__button}>
            <Button styleType={ButtonType.Secondary}>{t('PaymentSettings.ConnectCoinbase')}</Button>
          </div>
        </div>
      </div>
    </Category>
  );
};

export default PaymentSettings;

interface Props {}
