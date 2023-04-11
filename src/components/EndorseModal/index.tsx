import React, { useEffect } from 'react';
import { message } from 'antd';
import { EndorseUtil } from '../../features/Token/utils/EndorseUtil';
import { useMutation } from 'react-query';
import TokenService, { Endorsement } from '../../features/Token/TokenService';
import useAuthContext from '../../hooks/useAuthContext';
import useTonClientBridge from '../../hooks/useTonClientBridge';
import { Formik } from 'formik';
import classes from '../../features/Token/styles/form.module.scss';
import Properties from '../Properties';
import FormInput from '../FormInput';
import ArrowRightIcon from '../../../public/icons/arrowRight.svg';
import Fees from '../Fees';
import { CommissionTypes } from '../../types/CommissionTypes';
import Button, { ButtonType } from '../Button';
import { useToken } from '../../hooks/tokens';
import TonSurfModal from '../TonSurfModal';
import { TonSurfModalTypes } from '../../utils/TonSurfUtil';
import ModalForm from '../Modal';
import EverIcon from '../EverIcon';
import { BigNumber, ethers } from 'ethers';
import AbiFinder, { FindBNBAbiResult } from '../../abis/abi-finder';
import TonUtil from '../../utils/TonUtil';
import SelectFormInput from '../SelectFormInput';
import FormDateTimePicker from '../FormDateTimePicker';
import { cornersMap } from '../../types/Tokens/Abis';
import { unixTimestamp } from '../../features/Token/utils/helpers';

const initialState = {
  seal: '',
  value: 0,
  cornerSW: false,
  cornerSE: false,
  cornerNW: false,
  cornerNE: false,
  type: 'Permanent',
  expirationTime: new Date(),
};

const EndorseModal = ({
  isOpen,
  closeModal,
  tokenAddress,
  tokenID,
  iTokenSuperTypes,
  blockchain,
}: Props) => {
  const { walletAddress } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const endorseMutation = useMutation(TokenService.requestEndorse);
  const [tokenId, setTokenId] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isTonSurfModal, setTonSurfModal] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<Record<keyof typeof initialState, any> | undefined>();
  const [sealAddress, setSealAddress] = React.useState<string | undefined>();
  const [tonSurfInput, setTonSurfInput] = React.useState<Record<any, any> | undefined>();

  const [token, setToken] = React.useState<string | undefined>();

  const [empty, setEmpty] = React.useState<boolean>(false);

  const [validateToken, setValidateToken] = React.useState<boolean>(false);
  const [validatePrice, setValidatePrice] = React.useState<boolean>(false);
  const [validateCheck, setValidateCheck] = React.useState<{ [key: string]: boolean }>({
    SW: false,
    NW: false,
    NE: false,
    SE: false,
  });

  const [validate, setValidate] = React.useState<boolean>(false);
  const [disableClear, setDisableClear] = React.useState<boolean>(false);

  const EndorseTools = new EndorseUtil(walletAddress, endorseMutation, tonClientBridge);

  useEffect(() => {
    if (blockchain === 'binance') {
      return setValidate(true);
    }
    if (Object.values(validateCheck).includes(true) && validateToken && validatePrice) {
      return setValidate(true);
    }
    setValidate(false);
  }, [validateToken, validatePrice, validateCheck, blockchain]);
  useToken({
    skipQuery: !tokenId,
    variables: {
      query: {
        tokenID: tokenId,
      },
    },
    pollInterval: tokenId ? 1000 : undefined,
    onSuccess: (data) => {
      setSealAddress(data?.tokenID);
      setTokenId(undefined);
    },
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    (async () => {
      if (blockchain === 'everscale') {
        if (!values || !sealAddress || !tokenAddress || !tokenID) {
          return;
        }
        await EndorseTools.requestEndorse({
          tokenAddress,
          corners: {
            cornerSW: values.cornerSW,
            cornerSE: values.cornerSE,
            cornerNW: values.cornerNW,
            cornerNE: values.cornerNE,
          },
          seal: sealAddress,
          value: values.value,
          tokenID,
          sealID: values.seal,
          onSuccess: () => {
            setLoading(false);
            closeModal('request');
          },
          setTonSurf: (v) => {
            setTonSurfInput(v);
            setTonSurfModal(true);
          },
        });
      }
      if (blockchain === 'binance') {
        if (!values || !sealAddress || !tokenID) {
          return;
        }
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let endorsementAbi: FindBNBAbiResult;
        let customValue: any;
        if (values.type === 'Permanent') {
          endorsementAbi = await AbiFinder.findBNBRoot('endorsement1', blockchain);
          let places: number = 0;
          const corners = {
            cornerSW: values.cornerSW,
            cornerSE: values.cornerSE,
            cornerNW: values.cornerNW,
            cornerNE: values.cornerNE,
          };
          Object.keys(corners).forEach((item) => {
            if (corners[item as keyof typeof corners]) {
              places += cornersMap[item as keyof typeof corners];
            }
          });
          // eslint-disable-next-line no-plusplus
          const newVal = BigNumber.from(places);
          customValue = ethers.utils.arrayify(newVal);
        }
        let expiresAt: number;
        if (values.type === 'Temporary') {
          expiresAt = unixTimestamp(+values.expirationTime);
          endorsementAbi = await AbiFinder.findBNBRoot('endorsement2', blockchain);
          customValue = BigNumber.from(expiresAt);
        }
        if (values.type === 'Cross') {
          endorsementAbi = await AbiFinder.findBNBRoot('endorsement3', blockchain);
          customValue = null;
        }
        const endorsementContract = new ethers.Contract(
          endorsementAbi!.rootAddress,
          endorsementAbi!.abiFile.abi,
          signer,
        );
        const endorsableAddress = tokenID?.split('__')[0];
        const endorsableNftId = tokenID?.split('__')[1];
        const sealAddressForContract = sealAddress?.split('__')[0];
        const sealNftId = sealAddress?.split('__')[1];
        const validValue = TonUtil.convertTonToNanoTon(values.value, blockchain).toString();
        const price = BigNumber.from(validValue);
        const gasLimit = TonUtil.convertTonToNanoTon(0.03, 'binance').toString();
        try {
          console.log('endorsableAddress', endorsableAddress);
          console.log('endorsableNftId', endorsableNftId);
          console.log('sealAddressForContract', sealAddressForContract);
          console.log('sealNftId', sealNftId);
          console.log('customValue', customValue);
          console.log('price', price);
          let endorse: Endorsement;
          if (values.type === 'Permanent') {
            const tx = await endorsementContract.requestEndorse(
              endorsableAddress,
              endorsableNftId,
              sealAddressForContract,
              sealNftId,
              customValue && customValue,
              price,
              {
                gasLimit: 5000000,
                value: (+validValue + +gasLimit).toString(),
              },
            );
            endorse = {
              creator: walletAddress!,
              tokenID: tokenID!,
              value: validValue.toString(),
              sealID: sealAddress,
              cornerNE: values.cornerNE,
              cornerNW: values.cornerNW,
              cornerSE: values.cornerSE,
              cornerSW: values.cornerSW,
              type: endorsementAbi!.longtype.split('.')[1],
              superType: endorsementAbi!.supertype,
            };
          }

          if (values.type === 'Temporary') {
            const tx = await endorsementContract.requestEndorse(
              endorsableAddress,
              endorsableNftId,
              sealAddressForContract,
              sealNftId,
              customValue && customValue,
              price,
              {
                gasLimit: 5000000,
                value: (+validValue + +gasLimit).toString(),
              },
            );
            endorse = {
              creator: walletAddress!,
              tokenID: tokenID!,
              value: validValue.toString(),
              sealID: sealAddress,
              // @ts-ignore
              expiresAt,
              type: endorsementAbi!.longtype.split('.')[1],
              superType: endorsementAbi!.supertype,
            };
          }
          if (values.type === 'Cross') {
            const tx = await endorsementContract.requestEndorse(
              endorsableAddress,
              endorsableNftId,
              sealAddressForContract,
              sealNftId,
              price,
              {
                gasLimit: 5000000,
                value: (+validValue + +gasLimit).toString(),
              },
            );
            endorse = {
              creator: walletAddress!,
              tokenID: tokenID!,
              value: validValue.toString(),
              masterID: sealAddress,
              type: endorsementAbi!.longtype.split('.')[1],
              superType: endorsementAbi!.supertype,
            };
          }
          //@ts-ignore
          await TokenService.requestEndorse(endorse);
          setLoading(false);
          closeModal('request');
        } catch (err) {
          console.log('err', err);
          setLoading(false);
        }
      }
    })();
  }, [sealAddress]);

  const saveTokenInState = (e: any) => {
    const value = e.target.value || '';
    if (blockchain === 'binance') {
      setToken(value);
    } else if (value.length >= 66 && value.substring(0, 2) === '0:') {
      setToken(value);
    } else {
      message.warning('Incorrect seal ID format', 1);
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
      message.success('Token ID is successfully copied', 1);
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
            setTokenId(values.seal);
            setLoading(true);
          }}>
          {({ submitForm, values }) => (
            <ModalForm
              commissionsIds={[CommissionTypes.EndorsementRequest]}
              title="Requesting endorsement"
              visible={isOpen}
              feesClassName={classes.requestEndorseFees}
              onCancel={() => closeModal()}>
              <div className={classes.requestEndorseModal}>
                <Properties
                  className={classes.requestEndorseRows}
                  items={[
                    blockchain === 'binance' && {
                      label: 'endorsement type:',
                      value: (
                        <div className={classes.sealID}>
                          {/*<FormInput*/}
                          {/*  placeholder="Permanent"*/}
                          {/*  key="type"*/}
                          {/*  name="type"*/}
                          {/*  bordered={false}*/}
                          {/*  required*/}
                          {/*  // onChange={saveTokenInState}*/}
                          {/*  value="Permanent"*/}
                          {/*  // setValidate={setValidateToken}*/}
                          {/*  // iTokenSuperTypes={iTokenSuperTypes}*/}
                          {/*  // empty={empty}*/}
                          {/*  disabled*/}
                          {/*/>*/}
                          <SelectFormInput
                            name="type"
                            values={['Permanent', 'Temporary', 'Cross']}
                            isAddress={false}
                            wrapClassName={classes.formControlWrap}
                            className={classes.formControl}
                          />
                        </div>
                      ),
                    },
                    values.type === 'Cross'
                      ? {
                          label: 'enter endorse ID:',
                          value: (
                            <div className={classes.sealID}>
                              <FormInput
                                placeholder="0:14fe...ac90__21"
                                key="seal"
                                name="seal"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formControl}
                                required
                                minLength={blockchain === 'binance' ? 0 : 66}
                                onChange={saveTokenInState}
                                value={token}
                                setValidate={setValidateToken}
                                iTokenSuperTypes={iTokenSuperTypes}
                                empty={empty}
                                isCross
                              />
                              <div className={classes.delete} onClick={clearInput}>
                                <img src="/icons/closeSmall.svg" alt="" />
                              </div>
                              <div className={classes.copy} onClick={copyToClipboard}>
                                <img src="/icons/copyIconFrontal.svg" alt="" />
                              </div>
                            </div>
                          ),
                        }
                      : {
                          label: 'enter seal ID:',
                          value: (
                            <div className={classes.sealID}>
                              <FormInput
                                placeholder="0:14fe...ac90__21"
                                key="seal"
                                name="seal"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formControl}
                                required
                                minLength={blockchain === 'binance' ? 0 : 66}
                                onChange={saveTokenInState}
                                value={token}
                                setValidate={setValidateToken}
                                iTokenSuperTypes={iTokenSuperTypes}
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
                    {
                      label: 'price:',
                      value: (
                        <div className={classes.price}>
                          {blockchain === 'binance' ? (
                            <span
                              style={{
                                fontSize: '24px',
                                fontStyle: 'normal',
                                fontFamily: 'Inter',
                                fontWeight: 300,
                                lineHeight: `${27}px`,
                              }}>
                              Ƀ
                            </span>
                          ) : (
                            <EverIcon />
                          )}
                          <FormInput
                            placeholder="0.00"
                            key="price"
                            name="value"
                            bordered={false}
                            wrapClassName={classes.formControlWrap}
                            className={classes.formControl}
                            type="number"
                            step="0.1"
                            min="0"
                            required
                            onChange={(e) => setValidatePrice(+e.target.value > 0)}
                          />
                        </div>
                      ),
                    },
                    blockchain === 'everscaele'
                      ? {
                          label: 'corners:',
                          value: (
                            <div
                              className={classes.corners}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 10fr',
                              }}>
                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerSW"
                                key="cornerSW"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={blockchain === 'everscaele'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({
                                    ...validateCheck,
                                    SW: !e.target.value,
                                  })
                                }
                              />
                              <span>SW</span>

                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerNW"
                                key="cornerNW"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={blockchain === 'everscaele'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({ ...validateCheck, NW: !e.target.value })
                                }
                              />
                              <span>NW</span>
                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerNE"
                                key="cornerNE"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={blockchain === 'everscaele'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({ ...validateCheck, NE: !e.target.value })
                                }
                              />
                              <span>NE</span>

                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerSE"
                                key="cornerSE"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={blockchain === 'everscaele'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({ ...validateCheck, SE: !e.target.value })
                                }
                              />
                              <span>SE</span>
                            </div>
                          ),
                        }
                      : values.type === 'Permanent'
                      ? {
                          label: 'corners:',
                          value: (
                            <div
                              className={classes.corners}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 10fr',
                              }}>
                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerSW"
                                key="cornerSW"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={values.type === 'Permanent'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({ ...validateCheck, SW: !e.target.value })
                                }
                              />
                              <span>SW</span>

                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerNW"
                                key="cornerNW"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={values.type === 'Permanent'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({ ...validateCheck, NW: !e.target.value })
                                }
                              />
                              <span>NW</span>
                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerNE"
                                key="cornerNE"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={values.type === 'Permanent'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({ ...validateCheck, NE: !e.target.value })
                                }
                              />
                              <span>NE</span>

                              <FormInput
                                placeholder="0:1234...7890"
                                name="cornerSE"
                                key="cornerSE"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formCheckbox}
                                required={values.type === 'Permanent'}
                                minLength={66}
                                type="checkbox"
                                onChange={(e) =>
                                  setValidateCheck({ ...validateCheck, SE: !e.target.value })
                                }
                              />
                              <span>SE</span>
                            </div>
                          ),
                        }
                      : values.type === 'Temporary'
                      ? {
                          label: 'expiration time:',
                          value: (
                            <div
                              className={classes.corners}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 10fr',
                              }}>
                              <FormDateTimePicker name="expirationTime" />
                            </div>
                          ),
                        }
                      : {
                          label: 'media type:',
                          value: (
                            <div className={classes.sealID}>
                              <FormInput
                                placeholder="video"
                                key="mediaType"
                                name="mediaType"
                                bordered={false}
                                wrapClassName={classes.formControlWrap}
                                className={classes.formControl}
                                disabled
                              />
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
                  styleType={ButtonType.Primary}
                  onClick={() => {
                    if (validate) {
                      setDisableClear(true);
                      submitForm();
                    } else {
                      message.error('All fields are to be filled', 3);
                    }
                  }}
                  loading={loading}
                  style={{ marginLeft: 'auto' }}>
                  Make request
                </Button>
              </div>
            </ModalForm>
          )}
        </Formik>
      )}
      {isTonSurfModal && (
        <TonSurfModal
          type={TonSurfModalTypes.requestEndorse}
          isOpen={isTonSurfModal}
          onCancel={closeModal}
          onSuccess={() => {
            message.success('Endorsement request is created');
            closeModal('request');
          }}
          input={tonSurfInput}
        />
      )}
    </>
  );
};

type Props = {
  isOpen: boolean;
  closeModal: (v?: 'request') => void;
  tokenAddress?: string;
  tokenID?: string;
  iTokenSuperTypes?: { raw: string | undefined; deployed: string | undefined };
  blockchain: string;
};

export default EndorseModal;
