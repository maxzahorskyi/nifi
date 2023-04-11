import React, { useEffect } from 'react';
import { message } from 'antd';
import { EndorseUtil } from '../../features/Token/utils/EndorseUtil';
import { useMutation } from 'react-query';
import TokenService from '../../features/Token/TokenService';
import useAuthContext from '../../hooks/useAuthContext';
import useTonClientBridge from '../../hooks/useTonClientBridge';
import { Formik } from 'formik';
import classes from '../../features/Token/styles/form.module.scss';
import Properties from '../Properties';
import FormInput from '../FormInput';
import ArrowRightIcon from '../../../public/icons/arrowRight.svg';
import { CommissionTypes } from '../../types/CommissionTypes';
import Button, { ButtonType } from '../Button';
import { useToken } from '../../hooks/tokens';
import TonSurfModal from '../TonSurfModal';
import { TonSurfModalTypes } from '../../utils/TonSurfUtil';
import ModalForm from '../Modal';
import EverSurf from '../../config/ton/EverSurf';

const initialState = {
  foreverID: '',
};

const AddToForeverModal = ({
  isOpen,
  closeModal,
  tokenAddress,
  tokenID,
  iTokenSuperTypes,
}: Props) => {
  const { walletAddress } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const endorseMutation = useMutation(TokenService.requestEndorse);
  const [tokenId, setTokenId] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isTonSurfModal, setTonSurfModal] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<Record<keyof typeof initialState, any> | undefined>();
  const [foreverAddress, setForeverAddress] = React.useState<string | undefined>();
  const [tonSurfInput, setTonSurfInput] = React.useState<Record<any, any> | undefined>();
  const [findParams, setFindParams] = React.useState<Record<any, any> | undefined>();

  const [token, setToken] = React.useState<string | undefined>();

  const [empty, setEmpty] = React.useState<boolean>(false);
  const [disableClear, setDisableClear] = React.useState<boolean>(false);
  const [validate, setValidate] = React.useState<boolean>(false);

  const EndorseTools = new EndorseUtil(walletAddress, endorseMutation, tonClientBridge);

  useToken({
    skipQuery: !tokenId && !findParams,
    variables: {
      query: findParams || {
        tokenID: tokenId,
      },
    },
    pollInterval: tokenId || findParams ? 1000 : undefined,
    onSuccess: (data) => {
      if (findParams) {
        setLoading(false);
        closeModal('forever');
        setFindParams(undefined);
        return;
      }
      setForeverAddress(data?.deployed?.address);
      setTokenId(undefined);
    },
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    (async () => {
      if (!values || !tokenAddress || !tokenID) {
        return;
      }
      await EndorseTools.addToForever({
        stampAddress: tokenAddress,
        foreverAddress: foreverAddress || '',
        foreverID: values.foreverID,
        stampID: tokenID,
        onSuccess: () => {
          if (!(tonClientBridge instanceof EverSurf)) {
            setFindParams({
              deployed: {
                foreverID: values.foreverID,
              },
              tokenID,
            });
          }
        },
        setTonSurf: (v) => {
          setTonSurfInput(v);
          setTonSurfModal(true);
        },
      });
    })();
  }, [foreverAddress]);

  const saveTokenInState = (e: any) => {
    const value = e.target.value || '';
    if (value.length >= 66 && value.substring(0, 2) === '0:') {
      setToken(value);
    } else {
      message.warning('Incorrect 4ever ID format', 1);
    }
  };

  const clearInput = () => {
    if (!disableClear) {
      if (token) {
        setEmpty(true);
        setTimeout(() => setEmpty(false));
        setToken(undefined);
        message.success('Input is cleared', 1);
      } else {
        message.warning('Field is empty', 1);
      }
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      message.success('Token is successfully copied', 1);
    } else {
      message.warning('Field is empty', 1);
    }
  };

  return (
    <>
      {!isTonSurfModal && (
        <Formik
          initialValues={initialState}
          onSubmit={async (values, formikHelpers) => {
            setValues(values);
            setTokenId(values.foreverID);
            setLoading(true);
          }}>
          {({ submitForm, values }) => (
            <ModalForm
              commissionsIds={[CommissionTypes.StampAdd]}
              title="Add to 4ever"
              visible={isOpen}
              feesClassName={classes.feesForever}
              onCancel={() => closeModal()}>
              <div className={classes.addForever}>
                <Properties
                  className={classes.addForeverPr}
                  items={[
                    {
                      label: 'enter 4ever ID:',
                      value: (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <FormInput
                            placeholder="0:de34...c8a0__32"
                            name="foreverID"
                            bordered={false}
                            wrapClassName={classes.formControlWrap}
                            className={classes.formControl}
                            required
                            minLength={66}
                            onChange={saveTokenInState}
                            setValidate={setValidate}
                            empty={empty}
                          />
                          <div className={classes.delete} onClick={clearInput}>
                            <img src="/icons/closeSmall.svg" alt="" />
                          </div>
                          <div className={classes.copy} onClick={copyToClipboard}>
                            <img src="/icons/copyIconFrontal.svg" alt="" />
                          </div>
                        </div>
                      ),
                    },
                  ]}
                  renderItemLabel={(item) => (
                    <span className={classes.form__textWithIcon}>
                      <ArrowRightIcon /> {item.label}
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
                  styleType={ButtonType.Secondary}
                  className={classes.mobileSend}
                  onClick={() => {
                    if (validate) {
                      setDisableClear(true);
                      submitForm();
                    } else {
                      message.error('4ever ID is empty or incorrect', 3);
                    }
                  }}
                  loading={loading}
                  style={{ marginLeft: 'auto' }}>
                  Send token
                </Button>
              </div>
            </ModalForm>
          )}
        </Formik>
      )}
      {isTonSurfModal && (
        <TonSurfModal
          type={TonSurfModalTypes.addToForever}
          isOpen={isTonSurfModal}
          onCancel={closeModal}
          onSuccess={() => {
            message.success('Successfully added to 4ever', 3);
            setLoading(false);
            closeModal('forever');
          }}
          input={tonSurfInput}
        />
      )}
    </>
  );
};

type Props = {
  isOpen: boolean;
  closeModal: (v?: 'forever') => void;
  tokenAddress?: string;
  tokenID?: string;
  iTokenSuperTypes?: { raw: string | undefined; deployed: string | undefined };
};

export default AddToForeverModal;
