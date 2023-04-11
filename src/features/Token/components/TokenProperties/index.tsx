import { TokenType } from '../../TokenService';
import React from 'react';
// eslint-disable-next-line camelcase
import { GQLCollection, GQLContract_type } from '../../../../types/graphql.schema';
import { useTranslation } from 'react-i18next';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import TokenTypeSelect from '../TokenTypeSelect';
import TokenCollectionSelect from '../TokenCollectionSelect';
import AddMedia from '../AddMedia';
import TokenCreateForm from '../TokenCreateForm';

const TokenProperties = ({
  setFieldValue,
  setType,
  contractTypes,
  collectionArray,
  values,
}: {
  values: any;
  setFieldValue: (v: any, d: any) => void;
  setType: (v: TokenType) => void;
  // eslint-disable-next-line camelcase
  contractTypes: GQLContract_type[] | undefined;
  collectionArray: GQLCollection[] | undefined;
}) => {
  const { width, maxMobileWidth } = useWindowDimensions();

  return (
    <>
      {width > maxMobileWidth && contractTypes && (
        <TokenTypeSelect
          values={values}
          setType={setType}
          setFieldValue={setFieldValue}
          contractTypes={contractTypes}
        />
      )}
      <TokenCollectionSelect values={values} collectionArray={collectionArray} />
      {width > maxMobileWidth && values.type !== TokenType.Forever && (
        <AddMedia values={values} setFieldValue={setFieldValue} />
      )}
      <TokenCreateForm values={values} setFieldValue={setFieldValue} />
    </>
  );
};

export default TokenProperties;

