import { message } from 'antd';

export const useNetworkError = () => {
  const duration = 3;

  const onNetworkErrorClick = () =>
    message
      .error('Wrong network selected! Please change network type in active wallet', duration)
      .then(() => {});
  const onNetworkSuccessClick = () =>
    message.success('The network has been successfully changed!', duration).then(() => {});

  return { onNetworkErrorClick, onNetworkSuccessClick };
};
