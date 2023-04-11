import React from 'react';
import { Result } from 'antd';

const NoExtratonException = () => {
  return (
    <Result
      status="warning"
      title={
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <b>Something went wrong.</b>
          <span>You either don&apos;t have an Extraton extension or a wallet in it.</span>
          <span>
            You can download it{' '}
            <a
              target="_blank"
              href="https://chrome.google.com/webstore/detail/extraton/hhimbkmlnofjdajamcojlcmgialocllm"
              rel="noreferrer">
              here
            </a>
            .
          </span>
        </div>
      }
    />
  );
};

export default NoExtratonException;
