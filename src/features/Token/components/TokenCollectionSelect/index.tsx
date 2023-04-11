import React from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import { Select } from 'antd';
import cn from 'classnames';
import getConfig from 'next/config';
import { GQLCollection } from '../../../../types/graphql.schema';
import { TokenType } from '../../TokenService';

const config = getConfig();
const imgUrl = config.publicRuntimeConfig.services.mediaUrl;

const TokenCollectionSelect = ({ collectionArray, values }: Props) => {

  return (
    <Properties
      className={cn(
        classes.propertiesCreate,
        classes.standardMarginDesktop,
        values.type === TokenType.Forever
          ? classes.collectionForeverCategory
          : classes.collectionCategory,
      )}
      items={[
        {
          name: 'Collection',
          value: (
            <Select
              defaultValue="No collection"
              bordered={false}
              onChange={(value: any) => {
                values.collectionID = value;
              }}
              className={cn(classes.select, classes.formControl)}>
              {/*@ts-ignore*/}
              {collectionArray?.map(({ raw, collectionID }, index) => {
                const avatar = raw?.media?.find(({ role }: any) => role === 'avatar')?.hash;
                return (
                  <Select.Option key={collectionID || index} value={collectionID || ''}>
                    <img
                      src={`${imgUrl}/${avatar}`}
                      alt=""
                      style={{
                        height: 80,
                        width: 80,
                        borderRadius: 16,
                        marginRight: 10,
                        objectFit: 'cover',
                      }}
                    />
                    {raw?.title || ''}
                  </Select.Option>
                );
              })}
            </Select>
          ),
          required: true,
        },
      ]}
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
  collectionArray: GQLCollection[] | undefined;
}

export default TokenCollectionSelect;
