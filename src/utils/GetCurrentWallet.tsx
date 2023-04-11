import React from 'react';
import Cookies from 'universal-cookie';
import EverIcon from '../components/EverIcon';

const cookies = new Cookies();

type Props = {
  size: number;
  line: number;
};

const getCurrentWallet = ({ size, line }: Props) => {
  const [currentWallet] = React.useState<'everscale' | 'binance'>(
    cookies.get('blockchain') || 'everscale',
  );

  return (
    <>
      {currentWallet === 'everscale' ? (
        <EverIcon />
      ) : (
        <span
          style={{
            fontSize: size,
            fontStyle: 'normal',
            fontFamily: 'Inter',
            fontWeight: 300,
            lineHeight: `${line}px`,
          }}>
          Ƀ
        </span>
      )}{' '}
    </>
  );
};

export default getCurrentWallet;
