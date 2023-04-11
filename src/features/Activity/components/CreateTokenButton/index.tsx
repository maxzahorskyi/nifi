import Link from 'next/link';
import { urls } from '../../../../types/pages';
import Button from '../../../../components/Button';
import classes from '../../pages/ActivityPage/index.module.scss';
import cn from 'classnames';
import React, { CSSProperties } from 'react';
import useAuthContext from '../../../../hooks/useAuthContext';
import { useTranslation } from 'react-i18next';
import { useNetworkError } from '../../../../hooks/useNetworkError';

type Props = { style?: CSSProperties };

const CreateTokenButton: React.FC<Props> = ({ style }) => {
  const { t } = useTranslation();
  const { onNetworkErrorClick } = useNetworkError();
  const { networkError } = useAuthContext();

  if (!networkError) {
    return (
      <Link href={urls.tokenCreate.default}>
        <a>
          <Button className={cn(classes.createTokenButton, 'rounded')} style={style}>
            {t('Navigation.CreateYourToken')}
          </Button>
        </a>
      </Link>
    );
  }

  return (
    <Button
      className={cn('link', classes.createTokenButton, 'rounded')}
      onClick={onNetworkErrorClick}
      style={style}>
      {t('Navigation.CreateYourToken')}
    </Button>
  );
};

export default CreateTokenButton;
