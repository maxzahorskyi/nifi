import { TonSurfModalTypes } from '../../utils/TonSurfUtil';
import { Loading } from '../../features/Token/pages/TokenPage';

const useTSModalHandle = ({ stage, setActiveModal, tonSurfResult, loading }: Props) => {
  const applyStage = (setResult?: (v: any) => void) => {
    switch (stage) {
      case TonSurfModalTypes.createAuction:
        if (loading.auction) {
          setActiveModal(TonSurfModalTypes.auctionManagement);
          if (setResult) {
            setResult(tonSurfResult);
          }
        }
        break;
      case TonSurfModalTypes.createAsk:
        if (loading.ask) {
          setActiveModal(TonSurfModalTypes.askManagement);
          if (setResult) {
            setResult(tonSurfResult);
          }
        }
        break;
      case TonSurfModalTypes.cancelAsk:
        if (setResult) {
          setResult(!!tonSurfResult);
        }
        break;
      case TonSurfModalTypes.changeAsk:
        if (setResult) {
          setResult({
            askValue: tonSurfResult?.split('_')[0] || '0',
          });
        }
        break;
      case TonSurfModalTypes.bidManagement:
        if (loading.acceptedOffer) {
          setActiveModal(TonSurfModalTypes.acceptBid);
        }
        break;
      case TonSurfModalTypes.makeBidAuction:
        if (tonSurfResult && setResult) {
          setResult(parseInt(tonSurfResult, 10));
        }
        break;
      case undefined:
        break;
      default:
        setActiveModal(undefined);
        if (setResult) {
          setResult(tonSurfResult);
        }
    }
  };
  return { applyStage };
};

type Props = {
  stage: TonSurfModalTypes | undefined;
  setActiveModal: (v: TonSurfModalTypes | undefined) => void;
  tonSurfResult: string | undefined;
  loading: Partial<Loading>;
};

export default useTSModalHandle;
