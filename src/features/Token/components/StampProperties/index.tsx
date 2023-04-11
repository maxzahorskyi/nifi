import { TokenType } from '../../TokenService';
import React from 'react';
import { GQLCollection, GQLContract_type, GQLFormat } from '../../../../types/graphql.schema';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import TokenTypeSelect from '../TokenTypeSelect';
import TokenCollectionSelect from '../TokenCollectionSelect';
import StampFormatSizeSelect from '../StampFormatSizeSelect';
import StampAddMedia from '../StampAddMedia';
import TokenCreateForm from '../TokenCreateForm';

const StampProperties = ({
  setType,
  contractTypes,
  setFieldValue,
  collectionArray,
  values,
  setLayerValue,
  formatData,
}: Props) => {
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
      {width > maxMobileWidth && (
        <StampFormatSizeSelect
          values={values}
          formatData={formatData}
          setFieldValue={setFieldValue}
        />
      )}
      {width > maxMobileWidth && (
        <StampAddMedia
          values={values}
          setFieldValue={setFieldValue}
          setLayerValue={setLayerValue}
        />
      )}
      <TokenCreateForm values={values} setFieldValue={setFieldValue} />
    </>
  );
};

type Props = {
  values: any;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  formatData?: GQLFormat[];
  setType: (v: TokenType) => void;
  contractTypes: GQLContract_type[] | undefined;
  collectionArray: GQLCollection[] | undefined;
  setLayerValue: (v: number) => void;
};

export default StampProperties;
