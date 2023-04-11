import React from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import { Select } from 'antd';
import cn from 'classnames';
import { TokenType, TokenTypeBSC } from '../../TokenService';
import { SetFieldValue } from '../../../../types/Tokens/Token';
import { routeToTypeMap, urls } from '../../../../types/pages';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { GQLContract_type } from '../../../../types/graphql.schema';
import BlockchainIcon from '../../../../components/BlockchainIcon';
import useAuthContext from '../../../../hooks/useAuthContext';
import { walletTypes } from '../../../../types/wallet';

const config = getConfig();

const TokenTypeSelect = ({ setFieldValue, setType, contractTypes, values }: Props) => {
  const { type, blockchain } = useAuthContext();
  const router = useRouter();

  const handleArtworkTypeChange = (value: TokenType, setFieldValue: SetFieldValue) => {
    setFieldValue('type', value);
    setType(value);

    if (value === TokenType.Art1) {
      setFieldValue('numberOfEditions', 1);
    }

    router.push(`${urls.tokenCreate.route}/${routeToTypeMap[value]}`);
  };

  const items = [
    {
      name: 'Token type',
      value: (
        <Select
          defaultValue={values.type}
          bordered={false}
          onChange={(value) => handleArtworkTypeChange(value, setFieldValue)}
          className={cn(classes.select, classes.formControl)}>
          {blockchain === 'everscale'
            ? Object.keys(TokenType).map((item, index) => {
                if (
                  TokenType[item as keyof typeof TokenType] === TokenType.Collectible &&
                  config.publicRuntimeConfig.stage === 'prod'
                ) {
                  return false;
                }

                if (contractTypes) {
                  for (let i = 0; i < contractTypes.length; i += 1) {
                    if (
                      contractTypes[i]?.longType ===
                        `nifi.${TokenType[item as keyof typeof TokenType]}` &&
                      !contractTypes[i]?.applicableBlockchains?.includes(blockchain || 'everscale')
                    ) {
                      return false;
                    }
                  }

                  if (
                    !contractTypes.find(
                      (contract) =>
                        contract.longType === `nifi.${TokenType[item as keyof typeof TokenType]}`,
                    )
                  ) {
                    return false;
                  }
                }
                return (
                  <Select.Option
                    key={item || index}
                    value={TokenType[item as keyof typeof TokenType]}>
                    {
                      contractTypes?.find(
                        (contract) =>
                          contract.longType === `nifi.${TokenType[item as keyof typeof TokenType]}`,
                      )?.frontendName
                    }
                  </Select.Option>
                );
              })
            : Object.keys(TokenTypeBSC).map((item, index) => {
                return (
                  <Select.Option
                    key={item || index}
                    value={TokenTypeBSC[item as keyof typeof TokenTypeBSC]}>
                    {
                      contractTypes?.find(
                        (contract) =>
                          contract.longType ===
                          `nifi.${TokenTypeBSC[item as keyof typeof TokenTypeBSC]}`,
                      )?.frontendName
                    }
                  </Select.Option>
                );
              })}
        </Select>
      ),
      required: true,
    },
  ];

  if (type) {
    items.unshift({
      name: 'Blockchain',
      value: (
        <BlockchainIcon
          showText
          blockchain={blockchain}
          textClassName={classes.blockchain__text}
          imgClassName={classes.blockchain__img}
        />
      ),
      required: true,
    });
  }

  return (
    <Properties
      className={cn(
        classes.propertiesCreate,
        classes.standardMarginDesktop,
        classes.tokenTypeCategory,
        'rounded',
      )}
      items={items}
      renderItemLabel={(item) => item.name}
      labelProps={{
        className: classes.createLabelWidth,
      }}
      renderItemValue={(item) => item.value}
      resolveIsHighlighted={(item) => item.required}
    />
  );
};

interface Props {
  values: any;
  setFieldValue: (v: any, d: any) => void;
  setType: (v: TokenType) => void;
  // eslint-disable-next-line camelcase
  contractTypes: GQLContract_type[] | undefined;
}

export default TokenTypeSelect;
