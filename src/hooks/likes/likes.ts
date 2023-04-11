import { useMutation } from 'react-query';
import TokenService, { TokenType } from '../../features/Token/TokenService';
import useAuthContext from '../useAuthContext';
import { IToken, ISeries } from '../../types/Tokens/Token';
import { message } from 'antd';

export const useLikes = () => {
  const { setLikesCollectionData } = useAuthContext();

  const likeMutation = useMutation(TokenService.like);

  const getLikesMutation = useMutation(TokenService.getLikes);
  const getGroupLikesMutation = useMutation(TokenService.getGroupLikes);

  const getGroupLikesByUserAccountNumbersMutation = useMutation(
    TokenService.getGroupLikesByUserAccountNumbers,
  );
  const getGroupLikesBycollectionIDsMutation = useMutation(
    TokenService.getGroupLikesBycollectionIDs,
  );

  const getLikes = ({ token, userAccountNumber, onSuccess }: SingleTokenProps) => {
    getLikesMutation?.mutate(
      {
        id: token?.tokenID || token?.seriesID,
        userAccountNumber,
      },
      {
        onSuccess: (data: likesData | any) => {
          onSuccess(data);
        },
      },
    );
  };

  const changeLike = ({ token, userAccountNumber, walletAddress, onSuccess }: SingleTokenProps) => {
    likeMutation?.mutate(
      {
        tokenID: token?.tokenID,
        accountNumber: userAccountNumber,
        walletAddress,
        type: token?.deployed?.type,
        seriesID: token?.seriesID || token?.deployed?.seriesID?.seriesID,
      },
      {
        onSuccess: (data: likesData | any) => {
          onSuccess(data);
          if (!setLikesCollectionData) return;
          if (token?.deployed?.type === TokenType.Art2) {
            const id = token?.deployed?.seriesID?.seriesID;
            setLikesCollectionData({
              [id]: data,
            });
          }
        },
        onError: (error: any) => {
          message.error(error.message);
        },
      },
    );
  };

  const getGroupLikes = ({ tokens, userAccountNumber, onSuccess }: ArrayTokenProps) => {
    if (!tokens) return;
    const ids = tokens?.map((token: IToken | ISeries | any) => {
      if (token?.deployed?.type === TokenType.Art2) {
        return token?.deployed?.seriesID?.seriesID || '';
      }
      return token?.tokenID || '';
    }) || [''];
    getGroupLikesMutation?.mutate(
      {
        ids,
        userAccountNumber,
      },
      {
        onSuccess: (data: Record<string, likesData> | any) => {
          onSuccess(data);
        },
      },
    );
  };

  const getGroupLikesBycollectionIDs = ({ collectionIDs, onSuccess }: CollectionsProps) => {
    getGroupLikesBycollectionIDsMutation?.mutate(
      {
        collectionIDs,
      },
      {
        onSuccess: (data: { [key: string]: totalLikes } | any) => {
          onSuccess(data);
        },
      },
    );
  };

  const getGroupLikesByUserAccountNumbers = ({
    userAccountNumbers,
    onSuccess,
  }: AccountNumbersProps) => {
    getGroupLikesByUserAccountNumbersMutation?.mutate(
      {
        requestedUserAccountNumbers: userAccountNumbers,
      },
      {
        onSuccess: (data: { [key: string]: totalLikes } | any) => {
          onSuccess(data);
        },
      },
    );
  };

  return {
    changeLike,
    getLikes,
    getGroupLikes,
    getGroupLikesByUserAccountNumbers,
    getGroupLikesBycollectionIDs,
  };
};

export interface likesData {
  likesCount: number;
  hasLike?: boolean;
}

interface SingleTokenProps {
  token: IToken | ISeries | any;
  userAccountNumber: number;
  walletAddress: string;
  onSuccess: (data: likesData | any) => void;
}

interface ArrayTokenProps extends Pick<SingleTokenProps, 'onSuccess'> {
  tokens: IToken[] | ISeries[] | any;
  userAccountNumber?: number;
}

interface AccountNumbersProps extends Omit<ArrayTokenProps, 'tokens'> {
  userAccountNumbers: number[];
}

interface CollectionsProps extends Pick<SingleTokenProps, 'onSuccess'> {
  collectionIDs: string[];
}

export interface totalLikes {
  totalLikes: number;
}
