import dynamic from 'next/dynamic';

const PaymentSettingsPage = dynamic(
  () => import('../../../../features/User/pages/PaymentSettingsPage'),
  {
    ssr: false,
  },
);

export default PaymentSettingsPage;
