import React from 'react';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import { Skeleton } from 'antd';
import MediaPreview from '../../../../components/MediaPreview';
import FormInput from '../../../../components/FormInput';
import { TokenType } from '../../TokenService';
import FileInput from '../../../../components/FileInput';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import useMediaHandler from '../../../../hooks/media';
import { FormValues } from '../../../../types/Tokens/Token';
import StampAddMedia from '../StampAddMedia';

const CreateTokenMediasPreview = ({
  values,
  setFieldValue,
  type,
  layerValue,
  setLayerValue,
}: Props) => {
  const { width, maxMobileWidth } = useWindowDimensions();

  const { onMediaUpload } = useMediaHandler({ layerValue: 0 });
  const { onMediaReload } = useMediaHandler({ layerValue });

  return (
    <div className={classes.images}>
      {!values.media?.length && (
        <>
          <Skeleton.Image
            style={{
              width: width > maxMobileWidth ? 500 : '100%',
              height: width > maxMobileWidth ? 500 : '355px  ',
            }}
          />
        </>
      )}

      {values.media?.map(({ file, width, height, subtitle }, index) => {
        if (!file) return;
        const imageUrl = URL.createObjectURL(file);
        return (
          <MediaPreview
            src={imageUrl}
            number={index + 1}
            subtitle={
              values?.media?.length && (
                <FormInput
                  placeholder="Type media subtitle here"
                  maxLength={64}
                  bordered={false}
                  wrapClassName={classes.mobileFormInputWrap}
                  name={`media[${index}].subtitle`}
                  style={{
                    fontSize: 14,
                    fontWeight: 300,
                  }}
                  required={
                    values?.type === TokenType.Art1 ||
                    values?.type === TokenType.Art2 ||
                    values?.type === TokenType.Seal
                      ? values?.media?.length >= 2
                      : true
                  }
                />
              )
            }
            onDelete={() => {
              setFieldValue(
                'media',
                values.media?.slice(0, index).concat(values.media?.slice(index + 1)),
              );
            }}
            onReload={(media) => onMediaReload(media, index, values, setFieldValue)}
            meta={{
              width,
              height,
              mimetype: file.type,
              weight: file.size,
              path: file.name,
            }}
            title={values.title}
            hint={values.type === TokenType.Art2 ? 'series' : '1 of 1'}
            subtitleText={subtitle}
            tokenPageCreate
          />
        );
      })}
      {values.frame?.map(({ file, width, height, subtitle }, index) => {
        const imageUrl = URL.createObjectURL(file);
        return (
          <MediaPreview
            src={imageUrl}
            number={index + 1}
            subtitle={
              <FormInput
                placeholder="Type image subtitle here"
                maxLength={64}
                bordered={false}
                wrapClassName={classes.mobileFormInputWrap}
                name={`frame[${index}].subtitle`}
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                }}
                required
              />
            }
            onDelete={() => {
              setFieldValue(
                'frame',
                values.frame?.slice(0, index).concat(values.frame?.slice(index + 1)),
              );
            }}
            onReload={(media) => onMediaReload(media, index, values, setFieldValue)}
            meta={{
              width,
              height,
              mimetype: file.type,
              weight: file.size,
              path: file.name,
            }}
            title={values.title}
            hint={values.type === TokenType.Art2 ? 'series' : '1 of 1'}
            subtitleText={subtitle}
            tokenPageCreate
          />
        );
      })}

      {width <= maxMobileWidth && type !== TokenType.Stamp && type !== TokenType.Forever && (
        <FileInput
          wrapProps={{
            className: classes.fileInputMobile,
          }}
          fileInputProps={{
            onChange: (e) => onMediaUpload(e, values, setFieldValue),
            multiple: true,
            accept: 'image/*,video/*',
            required: true,
          }}
          isTokenPageCreate
        />
      )}
      {width <= maxMobileWidth && type === TokenType.Stamp && (
        <StampAddMedia
          values={values}
          setFieldValue={setFieldValue}
          setLayerValue={setLayerValue}
        />
      )}
    </div>
  );
};

interface Props {
  values: FormValues;
  setFieldValue: (v: any, d: any) => void;
  setLayerValue: (v: number) => void;
  layerValue: number;
  type: TokenType;
}

export default CreateTokenMediasPreview;
