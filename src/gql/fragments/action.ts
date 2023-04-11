import { gql } from '@apollo/client';

export const actionFragment = gql`
  fragment ActionFragment on Action {
    _id
    actionAttributes {
      bidCreator
      actionCapture
      actionStatus
      auctionCreator
      auctionStartTime
      bidStep
      finalBidValue
      managerExpirationTime
      managerSuperType
      minimalBid
      releasedBidOwner
      releasedBidValue
      submittedBidOwner
      submittedBidValue
      askCreator
      askEndTime
      askValue
      sealCreator
      endorsementCreator
    }
    createdAt
    message {
      actionCode {
        _id
        actionCapture
        additionalInfo
        applicableContractType
        code
        description
        actorField
      }
      hash
      superType
      time
      senderID
      senderAddress
    }
    tokenAttributes {
      collectionID
      collectionCreator
      newOwner
      oldOwner
      tokenCreator
      seriesCreator
      creatorFees
      hash
      manager
      maximum
      owner
      supply
      ownerPublicKey
      seriesID {
        seriesID
      }
      tokenID
    }
    updatedAt
  }
`;
