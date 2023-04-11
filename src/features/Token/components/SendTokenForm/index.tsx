import React, { CSSProperties, useState } from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../styles/form.module.scss';
import FormInput from '../../../../components/FormInput';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import Button, { ButtonType } from '../../../../components/Button';
import { message } from 'antd';

const SendTokenForm = ({ className, style, submitForm, loading }: Props) => {
  const [validateWallet, setValidateWallet] = useState<boolean>(false);
  const [wallet, setWallet] = React.useState<string | undefined>();
  const [empty, setEmpty] = React.useState<boolean>(false);

  const saveWalletInState = (e: any) => {
    const value = e.target.value || '';
    if (value.length >= 66 && value.substring(0, 2) === '0:') {
      setWallet(value);
    }
  };

  const clearInput = () => {
    if (wallet) {
      setEmpty(true);
      setTimeout(() => setEmpty(false));
      setWallet(undefined);
      message.success('Input cleared', 1);
    } else {
      message.warning('Field is cleared', 1);
    }
  };

  const validateForm = () => {
    validateWallet ? submitForm() : message.error('Wallet address is empty or incorrect', 3);
  };

  return (
    <div className={classes.formWrap} style={style}>
      <Properties
        className={cn(classes.form, className)}
        items={[
          {
            label: (
              <span className="pinkArrowWithText">
                <ArrowRightIcon /> receiver’s wallet address:
              </span>
            ),
            value: (
              <div className={classes.sealID}>
                <FormInput
                  placeholder="0:1234...7890"
                  name="receiverAddress"
                  bordered={false}
                  wrapClassName={classes.formControlWrap}
                  className={classes.formControl}
                  required
                  minLength={66}
                  onChange={saveWalletInState}
                  setValidate={setValidateWallet}
                  empty={empty}
                />
                <div className={classes.delete} onClick={clearInput}>
                  <img src="/icons/closeSmall.svg" alt="" />
                </div>
              </div>
            ),
          },
        ]}
        renderItemLabel={(item) => item.label}
        renderItemValue={(item) => item.value}
        labelProps={{
          className: classes.form__label,
        }}
        valueProps={{
          className: classes.form__value,
        }}
      />

      <Button
        styleType={ButtonType.Secondary}
        style={{ marginLeft: 'auto' }}
        className={classes.mobileSend}
        onClick={validateForm}
        loading={loading}>
        Send token
      </Button>
    </div>
  );
};

export default SendTokenForm;

interface Props {
  className?: string;
  style?: CSSProperties;
  submitForm?: any;
  loading?: boolean;
}
