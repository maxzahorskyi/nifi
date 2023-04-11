import React, { useEffect, useRef, useState } from 'react';
import classes from './index.module.scss';
import Category from '../../../../../components/Category';
import FileInput from '../../../../../components/FileInput';
import Properties from '../../../../../components/Properties';
import Button, { ButtonType } from '../../../../../components/Button';
import { useTranslation } from 'react-i18next';
import useAuthContext from '../../../../../hooks/useAuthContext';
import useImageUrl from '../../../../../hooks/useImageUrl';
import { Form, Formik } from 'formik';
import FormInput from '../../../../../components/FormInput';
import UserService, { UserDto } from '../../../UserService';
import { Avatar, message, Skeleton } from 'antd';
import { useMutation } from 'react-query';
import MediaService from '../../../../../config/http/MediaService';
import { useRouter } from 'next/router';
import { UserOutlined } from '@ant-design/icons';
import FormTextArea from '../../../../../components/FormTextArea';
import ImageUpload from '../../../../../components/ImageUpload';
import UsernameInput from '../../../components/UsernameInput';
import useWindowDimensions from '../../../../../hooks/useWindowDimensions';
import BigDividerMobile from '../../../../../components/BigDividerMobile';
import { walletTypes } from '../../../../../types/wallet';
import Link from 'next/link';
import LinkList from '../../../../../components/LinkList';
import { toFormatWalletAddress } from '../../../../../utils/toFormatWalletAddress';
import CopyWalletIcon from '../../../../../components/CopyWalletIcon';
import UploadAndResizeImageModal from '../../../../../components/UploadAndResizeImage';
import convertBytesToMegabytes from '../../../../../utils/convertBytesToMegabytes';

const AccountSettings = (propsL: Props) => {
  const { user, setUser, isFetching, isAuthenticated, type } = useAuthContext();
  const { width, maxMobileWidth, isDesktopWidth } = useWindowDimensions();
  const router = useRouter();

  const [isOpenedModal, setIsOpenedModal] = useState<boolean>(false);
  const [photoType, setPhotoType] = useState<string>('');
  const [editedAvatarBlob, setEditedAvatarBlob] = useState<Blob | null>(null);
  const [editedPhotoBlob, setEditedPhotoBlob] = useState<Blob | null>(null);
  const [editedWallpaperBlob, setEditedWallpaperBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (user && Object.keys(user).length === 1) {
      router.replace('/user/account/create');
    }
  }, [user]);

  const { t } = useTranslation();

  const avatar = useImageUrl(user?.avatarHash, { width: 146, height: 146 });
  const photo = useImageUrl(user?.photoHash, { width: 450, height: 450 });
  const wallpaper = useImageUrl(user?.wallpaperHash, { width: 450, height: 450 });

  const userMutation = useMutation(UserService.updateUserSettings);
  const imageMutation = useMutation(MediaService.post);

  const setFormValuesRef = useRef<(values: UserDto) => void>(null);

  const initialValues: FormValues = {
    accountNumber: user?.accountNumber,
    nickname: user?.nickname,
    username: user?.username,
    avatar: null,
    about: '',
    photo: null,
    wallpaper: null,
  };
  const onSubmit = async (values: FormValues) => {
    const { nickname, username, about } = values;

    const avatarResponse = editedAvatarBlob && (await imageMutation.mutateAsync(editedAvatarBlob));
    const photoResponse = editedPhotoBlob && (await imageMutation.mutateAsync(editedPhotoBlob));
    const wallpaperResponse =
      editedWallpaperBlob && (await imageMutation.mutateAsync(editedWallpaperBlob));

    try {
      const response = await userMutation.mutateAsync({
        walletAddress: user?.walletAddress,
        nickname,
        username,
        avatarHash: avatarResponse?.hash || user?.avatarHash,
        photoHash: photoResponse?.hash || user?.photoHash,
        wallpaperHash: wallpaperResponse?.hash || user?.wallpaperHash,
        about,
        defaultWallet: type || walletTypes.ET,
      });

      setUser({
        ...response.user,
        registeredWallet: user?.registeredWallet,
      });
      message.success('User profile has been successfully updated');
    } catch (e: any) {
      message.error(e.message);
      console.log(e);
    }
  };

  useEffect(() => {
    const { current: setFormValues } = setFormValuesRef;

    if (setFormValues) {
      setFormValues(user);
    }
  }, [user]);

  if (!isFetching && !isAuthenticated && !user?.accountNumber) {
    return null;
  }

  return (
    <Category title={t('AccountSettings.Title')} isBottomLine>
      {!isFetching ? (
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {({ setFieldValue, values, setValues, submitForm }) => {
            // @ts-ignore
            setFormValuesRef.current = setValues;

            return (
              <Form>
                <div className={classes.categoryContent}>
                  <UploadAndResizeImageModal
                    visible={isOpenedModal}
                    onCancel={() => {
                      setIsOpenedModal(false);
                    }}
                    photoType={photoType}
                    src={
                      photoType === 'avatar'
                        ? values.avatar
                        : photoType === 'wallpaper'
                        ? values.wallpaper
                        : values.photo
                    }
                    resizedImage={
                      photoType === 'avatar'
                        ? setEditedAvatarBlob
                        : photoType === 'wallpaper'
                        ? setEditedWallpaperBlob
                        : setEditedPhotoBlob
                    }
                    closeModal={() => setIsOpenedModal(false)}
                  />

                  <div className={classes.row}>
                    <div className={classes.categoryContent__avatar}>
                      {avatar || values?.avatar ? (
                        <img
                          src={editedAvatarBlob ? URL.createObjectURL(editedAvatarBlob) : avatar}
                          alt="avatar"
                          width={width > maxMobileWidth ? 146 : 242}
                          height={width > maxMobileWidth ? 146 : 242}
                          style={{
                            borderRadius: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Avatar size={width > maxMobileWidth ? 146 : 242} icon={<UserOutlined />} />
                      )}
                      {width < maxMobileWidth && (
                        <FileInput
                          fileInputProps={{
                            onChange(e) {
                              if (e.target.files) {
                                setFieldValue('avatar', e.target.files[0]);
                                if (e.target.files[0]?.type === 'image/gif') {
                                  setEditedAvatarBlob(e.target.files[0]);
                                  return;
                                }
                                if (e.target.files.length) {
                                  setPhotoType('avatar');
                                  setIsOpenedModal(true);
                                }
                              }
                            },
                            accept: 'image/*',
                          }}
                        />
                      )}
                    </div>
                    <div className={classes.categoryContent__formWrap}>
                      <div className={classes.categoryContent__form}>
                        <Properties
                          items={[
                            {
                              name: 'Avatar',
                              value: (
                                <div className={classes.fileInputWrap}>
                                  <FileInput
                                    fileInputProps={{
                                      onChange(e) {
                                        if (e.target.files) {
                                          const file = e.target.files[0];
                                          if (
                                            file &&
                                            convertBytesToMegabytes(file.size, true) > 10
                                          ) {
                                            message.error(
                                              'Media file can not exceed 10 Mb. Please select appropriate file',
                                            );
                                            return;
                                          }

                                          setFieldValue('avatar', file);
                                          if (file?.type === 'image/gif') {
                                            setEditedAvatarBlob(file);
                                            return;
                                          }
                                          if (e.target.files.length) {
                                            setPhotoType('avatar');
                                            setIsOpenedModal(true);
                                          }
                                        }
                                      },
                                      accept: 'image/*',
                                    }}
                                  />
                                  <div />
                                  <Button
                                    loading={userMutation.isLoading || imageMutation.isLoading}
                                    styleType={ButtonType.Primary}
                                    type="submit">
                                    Update
                                  </Button>
                                </div>
                              ),
                              hideInMobile: true,
                            },
                            {
                              name: t('AccountSettings.Nickname'),
                              value: (
                                <FormInput
                                  name="nickname"
                                  placeholder="Type nickname here"
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
                              name: 'Username',
                              value: <UsernameInput />,
                              required: true,
                            },
                            {
                              name: 'Account ID',
                              value: (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                  className="padding-left">
                                  <span style={{ marginRight: 10 }}>{values.accountNumber}</span>
                                  <CopyWalletIcon text={values.accountNumber} />
                                  <LinkList
                                    className={classes.categoryContent__form_create_collection}
                                    items={[
                                      <Link href="/collection/create/">
                                        <a>
                                          <span>Create collection</span>
                                        </a>
                                      </Link>,
                                    ]}
                                    getItemTitle={(item) => item}
                                    getIsActive={() => true}
                                  />
                                </div>
                              ),
                              disabled: true,
                            },
                            {
                              name: t('AccountSettings.AssociatedWallet'),
                              value: (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                  className="padding-left">
                                  <span style={{ marginRight: 10 }}>
                                    {toFormatWalletAddress(user.walletAddress)}
                                  </span>
                                  <CopyWalletIcon text={user.walletAddress} />
                                </div>
                              ),
                              disabled: true,
                            },
                            {
                              name: (
                                <span
                                  style={{
                                    position: isDesktopWidth ? 'absolute' : 'relative',
                                  }}>
                                  About myself
                                </span>
                              ),
                              value: (
                                <FormTextArea
                                  name="about"
                                  placeholder="Type about yourself here"
                                  bordered={false}
                                  wrapClassName={classes.inputWrap}
                                  autoSize={{
                                    minRows: 1,
                                    maxRows: 10,
                                  }}
                                  maxLength={500}
                                />
                              ),
                              required: false,
                            },
                          ]}
                          renderItemLabel={(item) => item.name}
                          renderItemValue={(item) => item.value}
                          resolveIsHighlighted={(item) => item.required}
                          resolveIsGreyColor={(item) => item.disabled}
                          resolveHideItemInMobile={(item) => item.hideInMobile}
                        />
                      </div>
                    </div>
                  </div>

                  {width <= maxMobileWidth && (
                    <div style={{ marginTop: 40 }}>
                      <BigDividerMobile />
                    </div>
                  )}

                  <ImageUpload
                    className={classes.categoryContent__imageUpload}
                    editedPhotoBlob={editedPhotoBlob}
                    editedWallpaperBlob={editedWallpaperBlob}
                    onUpload={(key, file, isFilesLength) => {
                      if (file) {
                        if (convertBytesToMegabytes(file.size, true) > 10) {
                          message.error(
                            'Media file can not exceed 10 Mb. Please select appropriate file',
                          );
                          return;
                        }
                        setPhotoType(key);
                        setFieldValue(key, file);
                        if (file.type === 'image/gif') {
                          if (key === 'photo') {
                            setEditedPhotoBlob(file);
                          }
                          if (key === 'wallpaper') {
                            setEditedWallpaperBlob(file);
                          }
                          return;
                        }
                        if (isFilesLength) {
                          setIsOpenedModal(true);
                        }
                      }
                    }}
                    items={[
                      {
                        key: 'photo',
                        title: 'Photo',
                        image: editedPhotoBlob ? undefined : photo ?? undefined,
                        blobHash: editedPhotoBlob
                          ? URL.createObjectURL(editedPhotoBlob)
                          : undefined,
                      },
                      {
                        key: 'wallpaper',
                        title: 'Wallpaper',
                        image: editedWallpaperBlob ? undefined : wallpaper ?? undefined,
                        blobHash: editedWallpaperBlob
                          ? URL.createObjectURL(editedWallpaperBlob)
                          : undefined,
                      },
                    ]}
                  />
                </div>

                {width < maxMobileWidth && (
                  <div className={classes.buttonWrap}>
                    <Button
                      loading={userMutation.isLoading || imageMutation.isLoading}
                      styleType={ButtonType.Primary}
                      type="submit">
                      Update
                    </Button>
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      ) : (
        <div>
          <div className={classes.categoryContent}>
            <div className={classes.row}>
              <div className={classes.categoryContent__avatar}>
                <Skeleton.Avatar style={{ width: '146px', height: '146px' }} active />
              </div>
              <div className={classes.categoryContent__formWrap}>
                <div className={classes.categoryContent__fileInputWrap}>
                  <Skeleton.Input className="skeletonInput" style={{ width: '500px' }} active />
                </div>
                <div className={classes.categoryContent__form}>
                  <Skeleton.Input
                    className="skeletonInput"
                    style={{ marginBottom: '15px' }}
                    active
                  />
                  <Skeleton.Input
                    className="skeletonInput"
                    style={{ marginBottom: '15px' }}
                    active
                  />
                  <Skeleton.Input
                    className="skeletonInput"
                    style={{ marginBottom: '15px' }}
                    active
                  />
                </div>

                <div className={classes.buttonWrap}>
                  <Button
                    loading={userMutation.isLoading}
                    styleType={ButtonType.Primary}
                    type="submit">
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Category>
  );
};

export default AccountSettings;

interface Props {}

interface FormValues {
  accountNumber: number;
  nickname: string;
  username: string;
  avatar: File | null;
  photo: File | null;
  wallpaper: File | null;
  about: string;
}
