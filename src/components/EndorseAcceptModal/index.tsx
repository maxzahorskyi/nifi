import React, { useEffect } from 'react';
import { message, Modal, Radio } from 'antd';
import { EndorseUtil } from '../../features/Token/utils/EndorseUtil';
import { useMutation } from 'react-query';
import TokenService from '../../features/Token/TokenService';
import useAuthContext from '../../hooks/useAuthContext';
import useTonClientBridge from '../../hooks/useTonClientBridge';
import { Formik } from 'formik';
import classes from '../../features/Token/styles/form.module.scss';
import Properties from '../Properties';
import ArrowRightIcon from '../../../public/icons/arrowRight.svg';
import Fees from '../Fees';
import { CommissionTypes } from '../../types/CommissionTypes';
import Button, { ButtonType } from '../Button';
import { useToken } from '../../hooks/tokens';
import { useEndorsements } from '../../hooks/endorsements';
import { EndorseStatus } from '../../types/Endorse';
import { GQLEndorsement, GQLEndorsementRaw } from '../../types/graphql.schema';
import SelectFormInput from '../SelectFormInput';
import { cornersMap } from '../../types/Tokens/Abis';
import TonSurfModal from '../TonSurfModal';
import { TonSurfModalTypes } from '../../utils/TonSurfUtil';
import EverSurf from '../../config/ton/EverSurf';
import ModalForm from '../Modal';
import FormRadioButton from '../FormRadioButton';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import EverIcon from '../EverIcon';
import BinanceIcon from '../../../public/icons/binanceSign.svg';
import TonUtil from '../../utils/TonUtil';
import { ITokenInfoDto } from '../../types/Tokens/TokenInfo';
import { BigNumber, Contract, ethers } from 'ethers';
import AbiFinder from '../../abis/abi-finder';
import FormDateTimePicker from '../FormDateTimePicker';

const initialState = {
  token: '',
  corner: '',
};

export enum EndorsementType {
  'endorsement1' = 'Permanent',
  'endorsement2' = 'Temporary',
  'endorsement3' = 'Cross',
}

const EndorseAcceptModal = ({
  isOpen,
  closeModal,
  sealAddress,
  tokenID,
  blockchain,
  isAccept = false,
}: Props) => {
  const { walletAddress } = useAuthContext();
  const { width, maxMobileWidth } = useWindowDimensions();
  const tonClientBridge = useTonClientBridge();
  const endorseMutation = useMutation(TokenService.requestEndorse);
  const [tokenId, setTokenId] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<Record<keyof typeof initialState, any> | undefined>();
  const [tokenAddress, setTokenAddress] = React.useState<string | undefined>();
  const [endorsements, setEndorsements] = React.useState<GQLEndorsement[] | undefined>();
  const [currentEndorsement, setCurrentEndorsement] = React.useState<GQLEndorsement | undefined>();
  const EndorseTools = new EndorseUtil(walletAddress, endorseMutation, tonClientBridge);
  const [tonSurfInput, setTonSurfInput] = React.useState<Record<any, any> | undefined>();
  const [isTonSurfModal, setTonSurfModal] = React.useState<boolean>(false);
  const [findParams, setFindParams] = React.useState<Record<any, any> | undefined>();

  const [selectedTokenId, setSelectedTokenId] = React.useState<string | undefined>();
  const [radioValidate, setRadioValidate] = React.useState<boolean>(false);

  const [isSelectToken, setSelectToken] = React.useState<boolean>(false);
  const [dynamicUpdate, setDynamicUpdate] = React.useState<boolean>(false);
  console.log('currentEndorsement', currentEndorsement);
  useEndorsements({
    skipQuery: !tokenID,
    pollInterval: dynamicUpdate ? 200 : 0,
    variables: {
      query: {
        deployed: {
          sealID: tokenID,
          status: EndorseStatus.Pending,
        },
      },
    },
    onError: (error) => console.log(error),
    onSuccess: (data) => {
      setEndorsements(data);
    },
  });

  useToken({
    skipQuery: !tokenId && !findParams,
    variables: {
      query: findParams || {
        tokenID: tokenId,
      },
    },
    pollInterval: tokenId || findParams ? 1000 : undefined,
    onSuccess: (data) => {
      if (findParams && data?.deployed?.seal) {
        setFindParams(undefined);
        closeModal();
        return;
      }
      if (tonClientBridge instanceof EverSurf) {
        setTonSurfInput({ stampID: tokenId });
      }
      setTokenAddress(data?.deployed?.address);
      setTokenId(undefined);
    },
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    (async () => {
      setDynamicUpdate(true);
      setTimeout(() => setDynamicUpdate(false), 500);
      if (!values || !sealAddress || !tokenID || !currentEndorsement) {
        return;
      }
      if (blockchain === 'binance') {
        const endorsableTokenId = values.token.split('__')[1];
        const endorsableTokenIdForContract = BigNumber.from(endorsableTokenId);
        const sealTokenIdForContract = BigNumber.from(tokenID.split('__')[1]);
        const contract = await AbiFinder.findBNBRoot('seal', blockchain);
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sealTokenContract = await new Contract(sealAddress, contract.abiFile.abi, signer);
        const type = currentEndorsement?.deployed?.type as
          | 'endorsement1'
          | 'endorsement2'
          | 'endorsement3';
        const endorsementAbi = await AbiFinder.findBNBRoot(type, blockchain);
        const endorsementContract = new ethers.Contract(
          endorsementAbi.rootAddress,
          endorsementAbi.abiFile.abi,
          signer,
        );
        await sealTokenContract.approve(endorsementAbi.rootAddress, sealTokenIdForContract);
        const stringForBigNumber = `0010`;
        const sealPossibleCorners = BigNumber.from([+stringForBigNumber]);
        try {
          if (type === 'endorsement1') {
            const endorsementTx = await endorsementContract.endorse(
              tokenAddress,
              endorsableTokenIdForContract,
              sealAddress,
              sealTokenIdForContract,
              sealPossibleCorners,
              {
                gasLimit: 5000000,
              },
            );
            await endorsementTx.wait();
          }
          if (type === 'endorsement2') {
            const endorsementTx = await endorsementContract.endorse(
              tokenAddress,
              endorsableTokenIdForContract,
              sealAddress,
              sealTokenIdForContract,
              {
                gasLimit: 5000000,
              },
            );
            await endorsementTx.wait();
          }
          if (type === 'endorsement3') {
            const endorsementTx = await endorsementContract.endorse(
              tokenAddress,
              endorsableTokenIdForContract,
              sealAddress,
              sealTokenIdForContract,
              {
                gasLimit: 5000000,
              },
            );
            await endorsementTx.wait();
          }
        } catch (err) {
          console.log(err);
        }
        // console.log('endorsmentTx', endorsementTx);
        setLoading(false);
        message.success('Endorsement request is accepted');
        closeModal();
      }
      if (!tokenAddress) return;
      if (blockchain === 'everscale') {
        await EndorseTools.acceptEndorse({
          tokenAddress,
          corner: cornersMap[values.corner as keyof typeof cornersMap] || 0,
          seal: sealAddress,
          onSuccess: async (address) => {
            setLoading(false);
            if (tonClientBridge instanceof EverSurf) {
              setTonSurfModal(true);
            } else {
              setFindParams({
                deployed: {
                  address,
                  seal_exists: true,
                },
              });
            }
          },
          setTonSurf: (values) => {
            setTonSurfInput((prev) => ({
              ...prev,
              ...values,
            }));
          },
        });
      }
    })();
  }, [tokenAddress]);

  const getCorners = (v?: GQLEndorsementRaw) => {
    if (!v) {
      return [];
    }
    setSelectedTokenId(v.tokenID);
    let corners: string[] = [];
    Object.keys(v).forEach((item) => {
      if (v[item as keyof GQLEndorsementRaw] === true) {
        corners?.push(item);
      }
    });
    return corners;
  };

  // @ts-ignore
  return (
    <>
      {!isTonSurfModal && (
        <Formik
          initialValues={initialState}
          onSubmit={async (values, formikHelpers) => {
            setValues(values);
            setTokenId(values.token);
            setLoading(true);
          }}>
          {({ submitForm, values }) => (
            <ModalForm
              title="Endorsement confirmation"
              visible={isOpen}
              onCancel={() => closeModal()}
              commissionsIds={[CommissionTypes.EndorsementAccept]}
              feesClassName={classes.requestEndorseModalFees}>
              <div
                className={classes.requestEndorseModal_button}
                style={
                  isSelectToken
                    ? { minHeight: width <= maxMobileWidth ? 400 : 120 }
                    : { minHeight: width <= maxMobileWidth ? 180 : 120 }
                }>
                <Properties
                  className={classes.requestEndorseModal}
                  items={[
                    {
                      label: 'select token ID:',
                      value: (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <div className={classes.endorseNumber}>{endorsements?.length}</div>
                          {endorsements && (
                            <SelectFormInput
                              name="token"
                              optionClassName={classes.optionClassName}
                              wrapClassName={classes.selectFormInput_wrap}
                              className={classes.selectFormInput}
                              values={
                                endorsements?.map((item) => {
                                  setCurrentEndorsement(item);
                                  return item.deployed?.tokenID || '';
                                }) || []
                              }
                              setFunction={setSelectToken}
                            />
                          )}
                          {selectedTokenId && (
                            <div
                              style={{
                                display: 'flex',
                                marginLeft: 'auto',
                              }}
                              className={classes.linkIcon}
                              onClick={() => {
                                window.open(`/token/stamp1/${selectedTokenId}`, '_blank');
                              }}>
                              <img src="/icons/link.svg" alt="" />
                            </div>
                          )}
                        </div>
                      ),
                    },
                    isSelectToken && {
                      label: 'endorsement type:',
                      value: (
                        <>
                          {/*<EverIcon />{' '}*/}
                          {/*{TonUtil.convertNanoTonToTon(*/}
                          {/*  Number(*/}
                          {/*    endorsements?.find((item) => item.deployed?.tokenID === values.token)*/}
                          {/*      ?.raw?.value,*/}
                          {/*  ),*/}
                          {/*)}*/}
                          {
                            EndorsementType[
                              currentEndorsement?.deployed?.type as
                                | 'endorsement1'
                                | 'endorsement2'
                                | 'endorsement3'
                            ]
                          }
                        </>
                      ),
                      required: true,
                    },
                    isSelectToken && {
                      label: 'price:',
                      value: (
                        <>
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
                          )}{' '}
                          {TonUtil.convertNanoTonToTon(
                            Number(currentEndorsement?.deployed?.value),
                            blockchain as 'binance' | 'everscale',
                          )}
                        </>
                      ),
                      required: true,
                    },
                    isSelectToken &&
                      currentEndorsement?.deployed?.type === 'endorsement1' && {
                        label: 'corner:',
                        value: (
                          <FormRadioButton
                            name="corner"
                            className={classes.endorseAcceptCorners}
                            setChanged={setRadioValidate}
                            values={
                              (endorsements?.find((item) => item.deployed?.tokenID === values.token)
                                ?.raw &&
                                getCorners(
                                  endorsements?.find(
                                    (item) => item.deployed?.tokenID === values.token,
                                  )?.raw,
                                )) ||
                              []
                            }
                          />
                        ),
                      },
                    isSelectToken &&
                      currentEndorsement?.deployed?.type === 'endorsement2' && {
                        label: 'expiration time:',
                        value: (
                          <>
                            <FormDateTimePicker
                              name="expiresAt"
                              disabled
                              proceedTime={currentEndorsement.deployed.expiresAt!}
                            />
                          </>
                        ),
                      },
                  ]}
                  renderItemLabel={(item) => (
                    <span className={classes.form__textWithIcon}>
                      <ArrowRightIcon /> {item.label}
                    </span>
                  )}
                  renderItemValue={(item) => item.value}
                  resolveIsHighlighted={(item) => item.required}
                  resolveBlackColor={(item) => item.required}
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
                    if (selectedTokenId) {
                      submitForm();
                    } else {
                      message.error('All fields are to be filled', 3);
                    }
                  }}
                  loading={loading}>
                  Endorse
                </Button>
              </div>
            </ModalForm>
          )}
        </Formik>
      )}
      {isTonSurfModal && (
        <TonSurfModal
          type={TonSurfModalTypes.acceptEndorse}
          isOpen={isTonSurfModal}
          onCancel={closeModal}
          onSuccess={async () => {
            message.success('Endorsement request is accepted');
            closeModal();
          }}
          input={tonSurfInput}
        />
      )}
    </>
  );
};

type Props = {
  isOpen: boolean;
  closeModal: (v?: undefined) => void;
  sealAddress?: string;
  tokenID?: string;
  blockchain: string;
  isAccept?: boolean;
};

export default EndorseAcceptModal;
