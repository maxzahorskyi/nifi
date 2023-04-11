import React from 'react';
import FileButton from '../FileButton';
import classes from '../MediaPreview/index.module.scss';
import TextList from '../TextList';
import MediaUtil from '../../utils/MediaUtil';

const ImageMeta = ({
  mimetype,
  weight,
  height,
  width,
  path,
  onReload,
  ownToken,
  tokenPageCreate,
  noLineUnderCard,
}: Props) => {
  const items = [
    `${width} x ${height} px, ${MediaUtil.prepareMimetype(mimetype)} (${MediaUtil.prepareWeight(
      weight,
    )} MB)`,
    path && onReload && (
      <>
        {path}
        <FileButton
          fileInputProps={{
            accept: 'image/*,video/*',
            onChange(e) {
              onReload(e.target.files?.[0]);
            },
          }}>
          reload
        </FileButton>
      </>
    ),
  ];

  return (
    <TextList
      items={items}
      getItemTitle={(title) => title && <span>• {title}</span>}
      className={classes.meta}
      itemClassName={classes.meta__item}
      isDividerShow
      ownToken={ownToken}
      tokenPageCreate={tokenPageCreate}
      noLineUnderCard={noLineUnderCard}
    />
  );
};

export default ImageMeta;

interface Props {
  mimetype: string | undefined;
  weight: number | undefined;
  width: number | undefined;
  height: number | undefined;
  path?: string;
  onReload?: (image: File | undefined) => void;
  ownToken?: boolean;
  tokenPageCreate?: boolean;
  noLineUnderCard?: boolean;
}
