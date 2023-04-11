import React, { useState } from 'react';
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
import Link from 'next/link';
import Title from '../../../../components/Title';
import getMediaResolution from '../../../../utils/getMediaResolution';
import { SetFieldValue } from '../../../../types/Tokens/Token';
import useAuthContext from '../../../../hooks/useAuthContext';
import { urls } from '../../../../types/pages';
import { useCollection, useCollectionTransactionHandler } from '../../../../hooks/collections';
import { GQLCollection } from '../../../../types/graphql.schema';
import { ApolloError } from '@apollo/client';
import CreateTokenButton from '../../../Activity/components/CreateTokenButton';
import Loader from '../../../../components/Loader';
import UploadAndResizeImageModal from '../../../../components/UploadAndResizeImage';

const UpdateCollectionPage = () => {
  const { width, maxMobileWidth } = useWindowDimensions();
  const { walletAddress, user } = useAuthContext();
  const router = useRouter();
  const [isOpenedModal, setIsOpenedModal] = useState<boolean>(false);
  const [photoType, setPhotoType] = useState<string>('');
  const [collection, setCollection] = useState<GQLCollection | undefined>(undefined);
  const [editedAvatarBlob, setEditedAvatarBlob] = useState<Blob | null>(null);
  const [editedWallpaperBlob, setEditedWallpaperBlob] = useState<Blob | null>(null);
  const { collectionID } = router.query;

  const wallpaper = collection?.media?.find(({ role }: any) => role === 'wallpaper');
  const avatar = collection?.media?.find(({ role }: any) => role === 'avatar');

  useCollection({
    skipQuery: false,
    variables: { query: { collectionID } },
    onSuccess: (collection: GQLCollection) => {
      setCollection(collection);
    },
    onError: (e: ApolloError) => {
      console.log(e);
    },
  });

  const { update } = useCollectionTransactionHandler({
    showNoExtratonException: () => console.log(''),
  });

  const initialValues: CollectionFormValues = {
    title: collection?.title || '',
    collectionID: collection?.collectionID || '',
    description: collection?.about || '',
    avatar: avatar || ({} as FormMedia),
    wallpaper: wallpaper || ({} as FormMedia),
  };

  const createFormMedia = async (key: string, file: File) => {
    const { width, height } = await getMediaResolution(file);

    if (key === 'avatar') {
      return {
        file,
        subtitle: '',
        width,
        height,
        role: key,
      };
    }

    if (key === 'wallpaper') {
      return {
        file,
        subtitle: '',
        width,
        height,
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

    if (file.type === 'image/gif') {
      if (key === 'avatar') {
        setEditedAvatarBlob(file);
      }
      if (key === 'wallpaper') {
        setEditedWallpaperBlob(file);
      }
      return;
    }

    setPhotoType(key);

    if (isFilesLength) {
      setIsOpenedModal(true);
    }

    const formAvatar = await createFormMedia(key, file);
    setFieldValue(key, formAvatar);
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
    // if (media.type.includes('image')) {
    //   setFieldValue(
    //     'avatar',
    //     values.avatar.slice(0, index).concat(formMedia, values.avatar.slice(index + 1)),
    //   )
    // } else if (media.type.includes('video')) {
    //   setFieldValue(
    //     'wallpaper',
    //     values.wallpaper.slice(0, index).concat(formMedia, values.wallpaper.slice(index + 1)),
    //   )
    // }
  };

  const onSubmit = async (values: CollectionFormValues) => {
    if (!walletAddress || !user.accountNumber) {
      return;
    }

    await update(
      values,
      () => router.push(`/collection/${values.collectionID}`),
      editedAvatarBlob,
      editedWallpaperBlob,
    );
  };

  if (!collection) return <Loader text="The collection is being loaded" />;

  return (
    <>
      {width > maxMobileWidth && (
        <div className={classes.createToken}>
          <CreateTokenButton />
        </div>
      )}

      <div className={classes.titleWrapper}>
        <Title>Collection update</Title>
      </div>

      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {({ setFieldValue, values, setValues, submitForm }) => {
          return (
            <Form>
              <div className={classes.formWrapper}>
                <UploadAndResizeImageModal
                  visible={isOpenedModal}
                  onCancel={() => {
                    setIsOpenedModal(false);
                  }}
                  photoType={photoType}
                  src={photoType === 'avatar' ? values.avatar.file : values.wallpaper.file}
                  resizedImage={
                    photoType === 'avatar' ? setEditedAvatarBlob : setEditedWallpaperBlob
                  }
                  closeModal={() => setIsOpenedModal(false)}
                />
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
                            value={collection?.title}
                            required
                            bordered={false}
                            wrapClassName={classes.inputWrap}
                            className={classes.mediaInput}
                            maxLength={32}
                          />
                        ),
                        required: true,
                      },

                      {
                        name: 'Collection ID',
                        value: (
                          <div className={classes.create_collectionID}>
                            <span className={classes.create_collectionID_url}>
                              https://nifi.club/collection/
                            </span>
                            <FormInput
                              name="collectionID"
                              placeholder="id here"
                              disabled
                              value={collection?.collectionID}
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
                              value={collection?.about}
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
                        Update
                      </Button>
                    </div>
                  )}
                </div>

                {width <= maxMobileWidth && <BigDividerMobile paddingBottom={40} paddingTop={40} />}

                <ImageUpload
                  className={classes.formWrapper__imageUpload}
                  onUpload={(key, file, isFilesLength) =>
                    onMediaUpload(key, file, values, setFieldValue, isFilesLength)
                  }
                  items={[
                    {
                      key: 'avatar',
                      title: 'Avatar',
                      blobHash: editedAvatarBlob
                        ? URL.createObjectURL(editedAvatarBlob)
                        : undefined,
                      image: values.avatar.file ?? undefined,
                      hash: avatar?.hash,
                      avatar: values.avatar,
                    },
                    {
                      key: 'wallpaper',
                      title: 'Wallpaper',
                      blobHash: editedWallpaperBlob
                        ? URL.createObjectURL(editedWallpaperBlob)
                        : undefined,
                      hash: wallpaper?.hash,
                      image: values.wallpaper.file ?? undefined,
                      wallpaper: values.wallpaper,
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
                  Update
                </Button>
              )}
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default UpdateCollectionPage;

export interface CollectionFormValues {
  title: string;
  collectionID: string;
  description: string;
  avatar: any;
  wallpaper: any;
}

interface FormMedia {
  subtitle: string;
  file: File;
  width: number;
  height: number;
  role?: string;
}
