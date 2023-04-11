import { TokenType } from '../../features/Token/TokenService';
import LinkList from '../LinkList';
import EndorseCancelModal from '../EndorseCancelModal';
import EndorseAcceptModal from '../EndorseAcceptModal';
import EndorseModal from '../EndorseModal';
import React, { useCallback } from 'react';
import { ITokenInfoDto } from '../../types/Tokens/TokenInfo';
import useAuthContext from '../../hooks/useAuthContext';
import AddToForeverModal from '../AddToForeverModal';
import { useNetworkError } from '../../hooks/useNetworkError';

const PermanentPropertiesModals = ({
  token,
  isEndorseOpen,
  setEndorse,
  blockchain,
  isAccept = false,
  isAcceptOpen,
  setIsAcceptOpen,
}: Props) => {
  const { onNetworkErrorClick } = useNetworkError();
  const { walletAddress, networkError } = useAuthContext();
  const ownToken = token?.deployed?.owner === walletAddress;
  const canSendToken = !token?.endorsement && !token?.ask && !token?.auction;
  const isEndorsementActive = !!token?.endorsement;
  const isEndorsed = isAccept ? true : !!token?.deployed?.seal;
  const localeType = isAccept ? 'ACE' : isEndorsed ? 'EA' : isEndorsementActive ? 'ENA' : 'RQE';

  const renderModal = () => {
    if (
      isEndorseOpen &&
      setEndorse &&
      isEndorsementActive &&
      token?.deployed?.type === TokenType.Stamp
    ) {
      return (
        <EndorseCancelModal
          isOpen={isEndorseOpen}
          closeModal={(result) => setEndorse(false, result)}
          tokenAddress={token?.deployed?.address}
          stampID={token?.tokenID}
        />
      );
    }
    if (isEndorseOpen && setEndorse && isEndorsed && token?.deployed?.type === TokenType.Stamp) {
      return (
        <AddToForeverModal
          isOpen={isEndorseOpen}
          iTokenSuperTypes={{
            raw: token.raw?.superType,
            deployed: token.deployed?.superType,
          }}
          closeModal={(result) => setEndorse(false, result)}
          tokenAddress={token?.deployed?.address}
          tokenID={token?.tokenID}
        />
      );
    }
    if (isAccept) {
      return (
        <EndorseAcceptModal
          isOpen={isAcceptOpen!}
          closeModal={(result) => setIsAcceptOpen!(false)}
          sealAddress={token?.deployed?.address}
          tokenID={token?.tokenID}
          blockchain={blockchain!}
          isAccept={isAccept}
        />
      );
    }
    if (isEndorseOpen && setEndorse && canSendToken && token?.deployed?.type === TokenType.Seal) {
      return (
        <EndorseAcceptModal
          isOpen={isAcceptOpen!}
          closeModal={(result) => setIsAcceptOpen!(false)}
          sealAddress={token?.deployed?.address}
          tokenID={token?.tokenID}
          blockchain={blockchain!}
        />
      );
    }
    if (
      isEndorseOpen &&
      setEndorse &&
      canSendToken &&
      !isEndorsed &&
      token?.deployed?.type === TokenType.Stamp
    ) {
      return (
        <EndorseModal
          isOpen={isEndorseOpen}
          iTokenSuperTypes={{
            raw: token.raw?.superType,
            deployed: token.deployed?.superType,
          }}
          closeModal={(result) => setEndorse(false, result)}
          tokenAddress={token?.deployed?.address}
          tokenID={token?.tokenID}
          blockchain={blockchain!}
        />
      );
    }
    return <></>;
  };

  const renderLinkList = () => {
    if (isAccept) {
      return (
        <LinkList
          items={[
            <span onClick={!networkError ? () => setIsAcceptOpen!(true) : onNetworkErrorClick}>
              {locales?.[token!.deployed!.type as TokenType]?.[localeType]}
            </span>,
          ]}
          getItemTitle={(item) => item}
          getIsActive={() => true}
        />
      );
    }
    if (
      token?.deployed?.type &&
      [TokenType.Stamp, TokenType.Seal].includes(token?.deployed?.type as TokenType) &&
      setEndorse
    ) {
      return (
        <LinkList
          items={[
            <span onClick={!networkError ? () => setEndorse!(true) : onNetworkErrorClick}>
              {locales?.[token!.deployed!.type as TokenType]?.[localeType]}
            </span>,
          ]}
          getItemTitle={(item) => item}
          getIsActive={() => true}
        />
      );
    }
    return <></>;
  };

  return ownToken ? (
    <>
      {renderLinkList()}
      {renderModal()}
    </>
  ) : (
    <div />
  );
};

const locales: { [key in TokenType]?: { [key in string]: string } } = {
  [TokenType.Stamp]: {
    RQE: 'Get endorsed',
    ACE: 'Accept endorsement requests',
    ENA: 'Cancel endorsement request',
    EA: 'Add to forever',
  },
  [TokenType.Seal]: {
    ACE: 'Accept endorsement requests',
    RQE: 'Accept endorsement requests',
  },
};

interface Props {
  token?: ITokenInfoDto;
  isEndorseOpen?: boolean;
  setEndorse?: (v: boolean, result?: 'request' | 'cancel' | 'forever') => void;
  blockchain?: string;
  isAccept?: boolean;
  isAcceptOpen?: boolean;
  setIsAcceptOpen?: (_: boolean) => void;
}

export default PermanentPropertiesModals;
