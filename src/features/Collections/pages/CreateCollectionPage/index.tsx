import React, { useState } from 'react';
import { useQuery as useGqlQuery } from '@apollo/client';
import classes from './index.module.scss';
import Properties from '../../../../components/Properties';
import Button, { ButtonType } from '../../../../components/Button';
import { Form, Formik } from 'formik';
import FormInput from '../../../../components/FormInput';
import { useRouter } from 'next/router';
import FormTextArea from '../../../../components/FormTextArea';
import ImageUpload from '../../../../components/ImageUpload';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import Title from '../../../../components/Title';
import getMediaResolution from '../../../../utils/getMediaResolution';
import { SetFieldValue } from '../../../../types/Tokens/Token';
import useAuthContext from '../../../../hooks/useAuthContext';
import { urls } from '../../../../types/pages';
import { useCollectionTransactionHandler } from '../../../../hooks/collections';
import CreateTokenButton from '../../../Activity/components/CreateTokenButton';
import UploadAndResizeImageModal from '../../../../components/UploadAndResizeImage';
import { message } from 'antd';
import { GQLCollection } from '../../../../types/graphql.schema';
import { getCollection } from '../../../../gql/query/collection';
import convertBytesToMegabytes from '../../../../utils/convertBytesToMegabytes';

const CreateCollectionPage = () => {
  const { width, maxMobileWidth } = useWindowDimensions();
  const { walletAddress, user, blockchain } = useAuthContext();
  const router = useRouter();
  const { create } = useCollectionTransactionHandler({
    showNoExtratonException: () => console.log(''),
  });

  const initialValues: CollectionFormValues = {
    title: '',
    collectionID: '',
    description: '',
    thumbnail: {} as FormMedia,
    wallpaper: {} as FormMedia,
  };
  const [isOpenedModal, setIsOpenedModal] = useState<boolean>(false);
  const [photoType, setPhotoType] = useState<string>('');
  const [editedThumbnailBlob, setEditedThumbnailBlob] = useState<Blob | null>(null);
  const [editedWallpaperBlob, setEditedWallpaperBlob] = useState<Blob | null>(null);

  const { refetch } = useGqlQuery<{ collection: GQLCollection }>(getCollection, {
    skip: true,
    fetchPolicy: 'network-only',
  });

  const createFormMedia = async (key: string, file: File) => {
    if (key === 'thumbnail') {
      return {
        file,
        subtitle: '',
        width: 500,
        height: 500,
        role: key,
      };
    }

    if (key === 'wallpaper') {
      return {
        file,
        subtitle: '',
        width: 1306,
        height: 300,
        role: key,
      };
    }
    return;
  };

  const onMediaUpload = async (
    key: any,
    file: File | undefined,
    values: CollectionFormValues,
    setFieldValue: SetFieldValue,
    isFilesLength: any,
  ) => {
    if (!file) {
      return;
    }
    setPhotoType(key);
    const formAvatar = await createFormMedia(key, file);
    setFieldValue(key, formAvatar);
    if (file.type === 'image/gif') {
      if (key === 'thumbnail') {
        setEditedThumbnailBlob(file);
      }
      if (key === 'wallpaper') {
        setEditedWallpaperBlob(file);
      }
      return;
    }
    if (isFilesLength) {
      setIsOpenedModal(true);
    }
  };

  const onMediaReload = async (
    media: File | undefined,
    values: CollectionFormValues,
    setFieldValue: SetFieldValue,
  ) => {
    if (!media) {
      return;
    }
    // const formMedia = await createFormMedia(media)
  };

  const onSubmit = async (values: CollectionFormValues) => {
    if (!walletAddress || !user.accountNumber) {
      return;
    }
    if (blockchain === 'everscale') {
      const { data } = await refetch({ query: { collectionID: values.collectionID } });

      if (data.collection) {
        message.warning('Collection path has to be unique. Please change it accordingly');
        return;
      }

      await create(
        values,
        () => router.push(`/collection/${values.collectionID}`),
        user.accountNumber,
        editedThumbnailBlob,
        editedWallpaperBlob,
        blockchain,
      );
    }
    if (blockchain === 'binance') {
      await create(
        values,
        () => router.push('/collections'),
        user.accountNumber,
        editedThumbnailBlob,
        editedWallpaperBlob,
        blockchain,
      );
    }
  };

  return (
    <div>
      {width > maxMobileWidth && (
        <div className={classes.createToken}>
          <CreateTokenButton />
        </div>
      )}

      <div className={classes.titleWrapper}>
        <Title>Collection creation</Title>
      </div>

      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {({ setFieldValue, values }) => {
          return (
            <Form>
              <UploadAndResizeImageModal
                visible={isOpenedModal}
                onCancel={() => {
                  setIsOpenedModal(false);
                }}
                photoType={photoType}
                src={photoType === 'thumbnail' ? values.thumbnail.file : values.wallpaper.file}
                resizedImage={
                  photoType === 'thumbnail' ? setEditedThumbnailBlob : setEditedWallpaperBlob
                }
                closeModal={() => setIsOpenedModal(false)}
              />
              <div className={classes.formWrapper}>
                <div className={classes.formWrapper_row}>
                  <Properties
                    className={classes.create}
                    items={[
                      {
                        name: 'Title',
                        value: (
                          <FormInput
                            name="title"
                            placeholder="Type title here"
                            required
                            bordered={false}
                            wrapClassName={classes.inputWrap}
                            className={classes.mediaInput}
                            maxLength={32}
                          />
                        ),
                        required: true,
                      },

                      blockchain !== 'binance' && {
                        name: 'Collection path',
                        value: (
                          <div className={classes.create_collectionID}>
                            <span className={classes.create_collectionID_url}>
                              https://nifi.club/collection/
                            </span>
                            <FormInput
                              name="collectionID"
                              placeholder="path here"
                              required
                              bordered={false}
                              wrapClassName={classes.inputWrap}
                              className={classes.create_collectionID_inputId}
                              maxLength={32}
                            />
                          </div>
                        ),
                        required: true,
                      },

                      {
                        name: 'Description',
                        value: (
                          <>
                            <FormTextArea
                              name="description"
                              placeholder="Type something description here"
                              bordered={false}
                              wrapClassName={classes.inputWrap}
                              autoSize={{
                                minRows: 1,
                                maxRows: 10,
                              }}
                              maxLength={500}
                            />
                          </>
                        ),
                        required: false,
                      },
                    ]}
                    renderItemLabel={(item) => item.name}
                    renderItemValue={(item) => item.value}
                    resolveIsHighlighted={(item) => item.required}
                  />
                  {width > maxMobileWidth && (
                    <div>
                      <Button
                        className={classes.formWrapper__createCollectionButton}
                        styleType={ButtonType.Secondary}
                        type="submit">
                        Create
                      </Button>
                    </div>
                  )}
                </div>

                {width <= maxMobileWidth && <BigDividerMobile paddingBottom={40} paddingTop={40} />}

                <ImageUpload
                  className={classes.formWrapper__imageUpload}
                  onUpload={(key, file, isFilesLength) => {
                    if (file && convertBytesToMegabytes(file.size, true) > 10) {
                      message.error(
                        'Media file can not exceed 10 Mb. Please select appropriate file',
                      );

                      return;
                    }
                    onMediaUpload(key, file, values, setFieldValue, isFilesLength);
                  }}
                  items={[
                    {
                      key: 'thumbnail',
                      title: 'Thumbnail',
                      blobHash: editedThumbnailBlob
                        ? URL.createObjectURL(editedThumbnailBlob)
                        : undefined,
                    },
                    {
                      key: 'wallpaper',
                      title: 'Wallpaper',
                      blobHash: editedWallpaperBlob
                        ? URL.createObjectURL(editedWallpaperBlob)
                        : undefined,
                    },
                  ]}
                  onReload={(media) => onMediaReload(media, values, setFieldValue)}
                />
              </div>

              {width <= maxMobileWidth && (
                <Button
                  className={classes.formWrapper__createCollectionButton}
                  styleType={ButtonType.Primary}
                  type="submit">
                  Create
                </Button>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CreateCollectionPage;

export interface CollectionFormValues {
  title: string;
  collectionID?: string;
  description: string;
  thumbnail: FormMedia;
  wallpaper: FormMedia;
}

interface FormMedia {
  subtitle: string;
  file: File;
  width: number;
  height: number;
  role?: string;
}
