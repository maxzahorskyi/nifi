import React from 'react';
import AccountCreate from './AccountCreate';
import useAuthContext from '../../../../hooks/useAuthContext';
import classes from './index.module.scss';
import NoExtratonException from '../../../../components/NoExtratonException';

const UserCreatePage = (props: Props) => {
  const { walletAddress, isFetching } = useAuthContext();

  return (
    <div>
      {isFetching || walletAddress ? (
        <AccountCreate />
      ) : (
        <div className={classes.resultWrap}>
          <NoExtratonException />
        </div>
      )}
    </div>
  );
};

export default UserCreatePage;

interface Props {}
