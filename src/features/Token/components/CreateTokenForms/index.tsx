import { Formik } from 'formik';
import Category from '../../../../components/Category';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import { TokenType, TokenTypeBSC } from '../../TokenService';
import Button, { ButtonType } from '../../../../components/Button';
import NoExtratonExceptionModal from '../../../../components/NoExtratonExceptionModal';
import TonSurfModal from '../../../../components/TonSurfModal';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import React, { useState } from 'react';
import useContractsContext from '../../../../hooks/useContractsContext';
import { useTokenTransactionHandler } from '../../../../hooks/tokens';
import { FormMedia } from '../../../../types/Tokens/Token';
import { useSuperSortType } from '../../../../hooks/superType';
import { useTranslation } from 'react-i18next';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { GQLCollection, GQLFormat } from '../../../../types/graphql.schema';
import { ModalType } from '../../../../types/modals/tokenPage';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import StampProperties from '../StampProperties';
import TokenProperties from '../TokenProperties';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import EverSurf from '../../../../config/ton/EverSurf';
import useAuthContext from '../../../../hooks/useAuthContext';
import { useQuery as useGqlQuery } from '@apollo/client/react/hooks/useQuery';
import { getFormats } from '../../../../gql/query/format';
import TokenTypeSelect from '../TokenTypeSelect';
import StampFormatSizeSelect from '../StampFormatSizeSelect';
import TokenCreateMediasPreview from '../TokenCreateMediasPreview';
import { useNetworkError } from '../../../../hooks/useNetworkError';
import FeesWithButton from '../FeesWithButton';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import { message } from 'antd';
import { useRouter } from 'next/router';

enum LoadingStatus {
  NotLoading = 'NotLoading',
  SavingOnBackend = 'SavingOnBackend',
  SavingOnBlockchain = 'SavingOnBlockchain',
}

const loadingMessage: Record<LoadingStatus, string> = {
  [LoadingStatus.NotLoading]: 'Create token',
  [LoadingStatus.SavingOnBackend]: 'Saving token to database...',
  [LoadingStatus.SavingOnBlockchain]: 'Adding token to blockchain...',
};

const CreateTokenForms = ({ collectionArray, setCreatedTokenId, type, setType }: Props) => {
  const router = useRouter();
  const { onNetworkErrorClick } = useNetworkError();
  const { networkError, blockchain } = useAuthContext();
  const { contractTypes, contractTypesByBlockchain } = useContractsContext();

  const tonClientBridge = useTonClientBridge();
  const { width, maxMobileWidth } = useWindowDimensions();
  const { t } = useTranslation();

  const [layerValue, setLayerValue] = useState<number>(1);
  const [formatData, setFormatData] = useState<GQLFormat[] | undefined>(undefined);

  const [isNoExtratonExceptionShown, setIsNoExtratonExceptionShown] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.NotLoading);

  const superType = useSuperSortType({ type, blockchain }) || '';
  const [tonSurfInput, setTonSurfInput] = useState<Record<any, any> | undefined>(undefined);

  const [activeModal, setActiveModal] = useState<ModalType | TonSurfModalTypes | undefined>(
    undefined,
  );

  const initialFormValues = {
    media: [] as FormMedia[] | undefined,
    frame: [] as FormMedia[] | undefined,
    title: '',
    type,
    collectionID: undefined,
    numberOfEditions: 1,
    fee: 0,
    description: '',
    stampId: undefined,
    format: undefined,
  };
  type FormValues = typeof initialFormValues;

  useGqlQuery(getFormats, {
    errorPolicy: 'ignore',
    onCompleted: (data) => {
      setFormatData(data.formats || undefined);
    },
  });

  const showNoExtratonException = () => {
    setIsNoExtratonExceptionShown(true);
  };

  const hideNoExtratonException = () => {
    setIsNoExtratonExceptionShown(false);
  };

  const { createToken } = useTokenTransactionHandler({
    setLoadingByKey: (key) => {
      switch (key) {
        case 'savingToken':
          setLoadingStatus(LoadingStatus.SavingOnBackend);
          break;
        case 'savedOnBack':
          setLoadingStatus(LoadingStatus.SavingOnBlockchain);
          break;
        default:
          setLoadingStatus(LoadingStatus.NotLoading);
          break;
      }
    },
    showNoExtratonException,
    type,
  });

  return (
    <>
      <Formik
        initialValues={initialFormValues}
        onSubmit={(values) => {
          values.title = values.title.trim();

          if (values.media && values.media.length <= 0 && values.type !== TokenType.Forever) {
            message.warning('Please upload media file(s)');
            return;
          }

          return createToken<FormValues>({
            superType,
            blockchain,
            onSuccess: (v) => {
              if (blockchain === 'binance') {
                router.back();
                return;
              }
              if (tonClientBridge instanceof EverSurf) {
                setActiveModal(
                  values.type === TokenType.Art2
                    ? TonSurfModalTypes.createSeries
                    : TonSurfModalTypes.createToken,
                );
                return;
              }
              setCreatedTokenId(v);
            },
            tonSurfSet: setTonSurfInput,
            token: values,
            media: [...(values.media || []), ...(values.frame || [])],
          });
        }}>
        {({ handleSubmit, setFieldValue, values }) => (
          <form onSubmit={handleSubmit}>
            {width <= maxMobileWidth && (
              <>
                <TokenTypeSelect
                  values={values}
                  setType={setType}
                  setFieldValue={setFieldValue}
                  contractTypes={contractTypesByBlockchain}
                />
                <BigDividerMobile paddingBottom={20} paddingTop={40} />
              </>
            )}
            <Category
              title={t(
                width <= maxMobileWidth
                  ? 'TokenCreationPage.MediaFiles'
                  : 'TokenCreationPage.TokenCreation',
              )}
              className={`${classes.wrap} ${
                width <= maxMobileWidth && classes.mobileFormInputWrap
              }`}
              filterMaxMobileWidth
              contentProps={{
                className: classes.content,
              }}>
              {width <= maxMobileWidth && formatData && type === TokenType.Stamp && (
                <StampFormatSizeSelect
                  values={values}
                  formatData={formatData}
                  setFieldValue={setFieldValue}
                />
              )}
              <TokenCreateMediasPreview
                values={values}
                setFieldValue={setFieldValue}
                type={type}
                layerValue={layerValue}
                setLayerValue={setLayerValue}
              />

              {width <= maxMobileWidth && <BigDividerMobile paddingBottom={10} paddingTop={40} />}

              <div className={classes.form}>
                <Category
                  title={width > maxMobileWidth ? undefined : 'Token Data'}
                  contentProps={{ className: classes.form__mobileWrapper }}
                  filterMaxMobileWidth>
                  {type === TokenType.Stamp ? (
                    <StampProperties
                      formatData={formatData}
                      values={values}
                      contractTypes={contractTypes}
                      collectionArray={collectionArray}
                      setFieldValue={setFieldValue}
                      setLayerValue={setLayerValue}
                      setType={setType}
                    />
                  ) : (
                    <TokenProperties
                      values={values}
                      setType={setType}
                      setFieldValue={setFieldValue}
                      contractTypes={contractTypes}
                      collectionArray={collectionArray}
                    />
                  )}

                  <div className={classes.mobileSubmitButtonWrapper}>
                    <FeesWithButton commissionsIds={[CommissionTypes.TokenCreation]}>
                      {!networkError ? (
                        <Button
                          type="submit"
                          className={classes.form__submit}
                          styleType={ButtonType.Primary}
                          loading={loadingStatus !== LoadingStatus.NotLoading}>
                          {loadingMessage[loadingStatus]}
                        </Button>
                      ) : (
                        <Button
                          className={classes.form__submit}
                          styleType={ButtonType.Primary}
                          onClick={onNetworkErrorClick}>
                          {loadingMessage[loadingStatus]}
                        </Button>
                      )}
                    </FeesWithButton>
                  </div>
                </Category>
              </div>
            </Category>
          </form>
        )}
      </Formik>

      <NoExtratonExceptionModal
        isNoExtratonExceptionShown={isNoExtratonExceptionShown}
        hideNoExtratonException={hideNoExtratonException}
      />

      {activeModal && activeModal in TonSurfModalTypes && (
        <TonSurfModal
          type={activeModal as TonSurfModalTypes}
          isOpen={activeModal in TonSurfModalTypes}
          onCancel={() => setActiveModal(undefined)}
          onSuccess={(result) => {
            setCreatedTokenId(result);
            setLoadingStatus(LoadingStatus.SavingOnBlockchain);
            setActiveModal(undefined);
          }}
          input={tonSurfInput}
        />
      )}
    </>
  );
};

type Props = {
  collectionArray: GQLCollection[] | undefined;
  setCreatedTokenId: (v: string | undefined) => void;
  type: TokenType;
  setType: (v: TokenType) => void;
};

export default CreateTokenForms;
