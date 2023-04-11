import classes from '../../styles/index.module.scss';
import Button, { ButtonType } from '../../../../components/Button';
import { modalName, ModalType } from '../../../../types/modals/tokenPage';
import { Radio } from 'antd';
import EverSurf from '../../../../config/ton/EverSurf';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import React from 'react';
import { TokenSaleInfo, TokenSaleType } from '../../../../types/Tokens/Token';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import { Loading } from '../../pages/TokenPage';
import useAuthContext from '../../../../hooks/useAuthContext';
import { useAskTransactionsHandler } from '../../../../hooks/asks';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import ModalForm from '../../../../components/Modal';
import { useNetworkError } from '../../../../hooks/useNetworkError';
import { setToStorage } from '../AskForms';

const ActionButtonTop = ({ saleInfo, token, loading, handlers, states }: Props) => {
  const { onNetworkErrorClick } = useNetworkError();
  const { walletAddress, networkError } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const {
    setActiveModal,
    setLoadingByKey,
    showNoExtratonException,
    setAskFetching,
    setAskToCancel,
    setOwnerChanged,
    setTonSurfInput,
  } = handlers;

  const { activeModal, isSetUpAuctionFormShown } = states;

  const { acceptAsk } = useAskTransactionsHandler({
    setLoadingByKey,
    showNoExtratonException,
  });
  const isOwnToken = walletAddress === token?.deployed?.owner;
  const canAcceptAsk = !isOwnToken && saleInfo?.saleType === TokenSaleType.Ask;
  const canCreateAuction =
    !!saleInfo?.saleType &&
    isOwnToken &&
    [TokenSaleType.Ask, TokenSaleType.Offer, TokenSaleType.Pending].includes(saleInfo?.saleType) &&
    token?.deployed?.frontStatus !== 'auction';

  const [saleFormValue, setSaleFormValue] = React.useState<string | undefined>(
    TokenSaleType.Auction,
  );

  return (
    <div className={classes.token__btnTop}>
      {canCreateAuction && !isSetUpAuctionFormShown && (
        <>
          {!networkError ? (
            <Button
              style={{
                width: '100%',
                marginTop: 30,
              }}
              styleType={ButtonType.Secondary}
              type="button"
              onClick={() => {
                (token?.ask?.deployed?.status === 'pending' &&
                  token?.deployed?.frontStatus === 'onSale') ||
                (token?.auction?.deployed?.status === 'pending' &&
                  token?.deployed?.frontStatus === 'auction')
                  ? setActiveModal(ModalType.auctionSaleSetupActive)
                  : setActiveModal(ModalType.auctionSaleSetup);
                setToStorage('creationType', 'setup');
              }}
              loading={loading.ask || loading.auction}
              key="setUpAuction">
              Set up auction / sale
            </Button>
          ) : (
            <Button
              style={{
                width: '100%',
                marginTop: 30,
              }}
              styleType={ButtonType.Secondary}
              type="button"
              onClick={onNetworkErrorClick}>
              Set up auction / sale
            </Button>
          )}

          <ModalForm
            title={modalName.auctionSaleSetup}
            visible={activeModal === ModalType.auctionSaleSetup}
            className={`${classes.modalAuctionOrSale} modal`}
            onCancel={() => setActiveModal(undefined)}>
            <Radio.Group
              defaultValue={saleFormValue}
              className={classes.radioButton}
              onChange={(e) => {
                setSaleFormValue(e.target.value);
              }}>
              {saleTypes ? (
                Object.keys(saleTypes).map((item, index) => {
                  return (
                    <Radio value={item} key={index}>
                      {locales[saleTypes[item as keyof typeof saleTypes] || TokenSaleType.Auction]}
                    </Radio>
                  );
                })
              ) : (
                <div />
              )}
            </Radio.Group>
            <Button
              styleType={ButtonType.Primary}
              type="button"
              onClick={() => {
                switch (saleFormValue) {
                  case TokenSaleType.Auction:
                    setActiveModal(ModalType.creatingAuction);
                    break;
                  case TokenSaleType.Ask:
                    setActiveModal(ModalType.saleOfferCreation);
                    break;
                  default:
                    break;
                }
              }}
              loading={loading.createAuction}>
              Select
            </Button>
          </ModalForm>
        </>
      )}

      {canAcceptAsk && (
        <Button
          style={{ width: '100%', marginTop: 30 }}
          styleType={ButtonType.Primary}
          type="button"
          onClick={() =>
            acceptAsk({
              price: parseInt(token?.ask?.deployed?.currentAskValue || '0', 10),
              askAddress: token?.ask?.deployed?.askAddress,
              tokenID: token?.tokenID,
              onSuccess: () => {
                setLoadingByKey('ask', true);
                setLoadingByKey('acceptedAsk', true);
                if (tonClientBridge instanceof EverSurf) {
                  setActiveModal(TonSurfModalTypes.acceptAsk);
                } else {
                  setOwnerChanged(walletAddress);
                  setAskFetching(true);
                  setAskToCancel(true);
                  setActiveModal(undefined);
                }
              },
              tonSurfSet: setTonSurfInput,
            })
          }
          key="acceptAsk"
          loading={loading.acceptAsk}
          disabled={loading.acceptedAsk}>
          Buy now
        </Button>
      )}
    </div>
  );
};

const locales: { [key in TokenSaleType]?: string } = {
  [TokenSaleType.Auction]: 'Setup auction',
  [TokenSaleType.Ask]: 'Setup fixed price sale',
};

const saleTypes: { [key in TokenSaleType]?: keyof typeof TokenSaleType } = {
  [TokenSaleType.Auction]: TokenSaleType.Auction,
  [TokenSaleType.Ask]: TokenSaleType.Ask,
};

interface Props {
  saleInfo?: TokenSaleInfo;
  token?: ITokenInfoDto;
  loading: Partial<Loading>;
  states: {
    isSetUpAuctionFormShown: boolean;
    activeModal: ModalType | TonSurfModalTypes | undefined;
  };
  handlers: {
    setActiveModal: (v: ModalType | TonSurfModalTypes | undefined) => void;
    setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
    showNoExtratonException: () => void;
    setTonSurfInput: (v: Record<any, any>) => void;
    setOwnerChanged: (v: string | undefined) => void;
    setAskFetching: (v: boolean) => void;
    setAskToCancel: (v: boolean) => void;
  };
}

export default ActionButtonTop;
