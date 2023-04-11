import React, { ChangeEventHandler, useEffect } from 'react';
import { useQuery as useGqlQuery } from '@apollo/client';
import { Form, Input, InputProps, message } from 'antd';
import { useField } from 'formik';
import classes from './index.module.scss';
import cn from 'classnames';
import { toFormatWalletAddress } from '../../utils/toFormatWalletAddress';
import { useToken } from '../../hooks/tokens';
import { TokenType } from '../../features/Token/TokenService';
import useDebounce from '../../hooks/useDebounce';
import { GQLCollection } from '../../types/graphql.schema';
import { getCollection } from '../../gql/query/collection';

const invalidCharsPrice = ['-', '+', 'e'];
const inputPrice = ['stepBid', 'startBid', 'price', 'bidPrice', 'offerPrice'];

const FormInput = ({
  name,
  renderValue = (value) => value,
  className,
  wrapClassName,
  onChange,
  valueTextAlign,
  setValidate,
  disabled,
  minLength = 0,
  empty = false,
  type = 'text',
  proceedPrice,
  iTokenSuperTypes,
  isCross = false,
  ...props
}: Props) => {
  const [field, meta] = useField(name);

  const [tokenId, setTokenId] = React.useState<string | undefined>();
  const [userWalletAddress, setUserWalletAddress] = React.useState<string | undefined>();
  const [priceTest, setPriceTest] = React.useState<string | undefined>(undefined);
  const [collection, setCollection] = React.useState<GQLCollection | null>(null);
  const debounceValue = useDebounce(field.value, 300);

  const { refetch } = useGqlQuery<{ collection: GQLCollection }>(getCollection, {
    skip: true,
    fetchPolicy: 'network-only',
    variables: {
      query: {
        collectionID: debounceValue,
      },
    },
  });

  React.useEffect(() => {
    if (debounceValue && debounceValue.length > 0 && name === 'collectionID') {
      refetch({ collectionID: debounceValue }).then((res) => setCollection(res.data.collection));
    }
  }, [debounceValue]);

  React.useEffect(() => {
    if (collection) {
      message.warning('Collection path has to be unique. Please change it accordingly');
    }
  }, [collection]);

  useToken({
    skipQuery: !tokenId,
    variables: {
      query: {
        tokenID: tokenId,
      },
    },
    onSuccess: (data) => {
      if (isCross) {
        if (name === 'seal' && data?.deployed?.type === TokenType.Stamp) {
          message.success('Token type is correct', 3);
          setValidate(true);
        } else {
          message.error('Token type is not correct', 3);
          setValidate(false);
        }
      } else if (
        (name === 'seal' && data?.deployed?.type === TokenType.Seal) ||
        (name === 'foreverID' && data?.deployed?.type === TokenType.Forever)
      ) {
        if (
          iTokenSuperTypes?.raw?.substr(12) !== data?.raw?.superType?.substr(10) ||
          iTokenSuperTypes?.deployed?.substr(12) !== data?.deployed?.superType?.substr(10)
        ) {
          message.warning(
            `Version of ${
              name === 'seal' ? 'seal' : '4ever'
            } token doesn't fit version of endorsable token`,
            3,
            setValidate(false),
          );
        } else {
          message.success('Token type is correct', 3);
          setValidate(true);
        }
      } else {
        message.error('Token type is not correct', 3);
        setValidate(false);
      }
    },
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    if (empty) {
      field.onChange(name)('');
      setValidate(false);
      setTokenId(undefined);
      setUserWalletAddress(undefined);
    }
  }, [empty]);

  const validate: ChangeEventHandler<HTMLInputElement> = (e) => {
    //validation for inputs with price part 1
    if (inputPrice.includes(name) && e.target.value) {
      const test = e.target.value.split('.');
      if (test.length === 2) {
        if (typeof test[1] === 'string') {
          setPriceTest(test[1]);
        } else {
          setPriceTest(undefined);
        }
      }
    }

    if (name === 'seal' || name === 'foreverID') {
      if (
        e.target.value.length >= minLength
        // && e.target.value.substring(0, 2) === '0:'
      ) {
        setTokenId(e.target.value);
      }
    }

    if (name === 'receiverAddress') {
      if (e.target.value.length === minLength && e.target.value.substring(0, 2) === '0:') {
        message.success('Wallet format is correct', 1);
        setValidate(true);
        setUserWalletAddress(e.target.value);
      } else {
        message.error('Wallet format is not correct', 1);
        setValidate(false);
      }
    }

    if (name === 'collectionID' || name === 'username') {
      if (/[^A-Z]/gi.test(e.target.value) && e.target.value.length <= 1) {
        return;
      }

      if (!/[^A-Z]/gi.test(e.target.value) && e.target.value.length <= 1) {
        field.onChange(name)(e);
        onChange?.(e);
      }

      if (/[^\dA-Z-]/gi.test(e.target.value)) {
        return;
      }

      if (!/[^\dA-Z-]/gi.test(e.target.value) && e.target.value.length > 1) {
        field.onChange(name)(e);
        onChange?.(e);
      }
    }

    if (name === 'title') {
      if (
        /[^A-Zа-яёË-і-ї]/gi.test(e.target.value) &&
        /[^0-9]/gi.test(e.target.value) &&
        e.target.value.length <= 1
      ) {
        return;
      }
      if (!/[^A-Zа-яёË-і-ї]/gi.test(e.target.value) && e.target.value.length <= 1) {
        field.onChange(name)(e);
        onChange?.(e);
      }

      if (e.target.value.trim().length < 2) {
        e.target.setCustomValidity(
          'The field can not start with a blank and requires at least 2 non-blank characters',
        );
      } else {
        e.target.setCustomValidity('');
      }

      if (e.target.value.length < 1) {
        e.target.setCustomValidity('');
      }

      if (e.target.value.length > 1) {
        field.onChange(name)(e);
        onChange?.(e);
      }
    }

    if (name === 'nickname') {
      if (/[^A-Zа-яёË-і-ї]/gi.test(e.target.value) && e.target.value.length <= 1) {
        return;
      }
      if (!/[^A-Zа-яёË-і-ї]/gi.test(e.target.value) && e.target.value.length <= 1) {
        field.onChange(name)(e);
        onChange?.(e);
      }

      if (e.target.value.length > 1) {
        field.onChange(name)(e);
        onChange?.(e);
      }
    }

    if (name !== 'collectionID' && name !== 'nickname' && name !== 'username') {
      field.onChange(name)(e);
      onChange?.(e);
    }
  };

  return (
    <Form.Item
      help={meta.touched && meta.error}
      validateStatus={meta.touched && meta.error ? 'error' : ''}
      className={cn(wrapClassName)}>
      <Input
        {...props}
        minLength={minLength}
        onKeyDown={(e) => {
          if (inputPrice.includes(name)) {
            //validation for inputs with price part 2
            if (invalidCharsPrice.includes(e.key)) {
              e.preventDefault();
            }
            if (e.key === 'Meta' || e.key === 'Alt' || e.key === 'Backspace') {
              setPriceTest(undefined);
            }
            if (priceTest && priceTest.length >= 9 && e.key !== 'Backspace') {
              e.preventDefault();
            }
          }
        }}
        type={type}
        className={cn(className, classes.input, 'rounded', 'background-grey')}
        style={{
          textAlign: valueTextAlign,
          fontSize: type === 'number' ? 22 : 18,
        }}
        value={
          proceedPrice
            ? proceedPrice
            : name === 'seal' || name === 'receiverAddress' || name === 'foreverID'
            ? field.value.length >= minLength && field.value.substring(0, 2) === '0:'
              ? field.value.length > minLength
                ? renderValue(toFormatWalletAddress(field.value, 8))
                : renderValue(toFormatWalletAddress(field.value, 4))
              : renderValue('')
            : type === 'number'
            ? props.value
            : field.value || field.value === ''
            ? renderValue(field.value)
            : props.value
        }
        disabled={disabled || !!tokenId || !!userWalletAddress}
        onChange={validate}
        onBlur={field.onBlur(name)}
      />
    </Form.Item>
  );
};

interface Props extends InputProps {
  proceedPrice?: number | undefined;
  name: string;
  renderValue?: (value: any) => string | number;
  wrapClassName?: string;
  setValidate?: any; // TODO: replace any
  empty?: boolean;
  disabled?: boolean;
  iTokenSuperTypes?: { raw: string | undefined; deployed: string | undefined };
  valueTextAlign?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
  isCross?: boolean;
}

export default FormInput;
