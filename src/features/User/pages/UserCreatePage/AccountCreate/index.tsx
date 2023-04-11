import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthContext from '../../../../../hooks/useAuthContext';
import { Form, Formik } from 'formik';
import classes from './index.module.scss';
import FileInput from '../../../../../components/FileInput';
import Properties from '../../../../../components/Properties';
import FormInput from '../../../../../components/FormInput';
import Button, { ButtonType } from '../../../../../components/Button';
import Category from '../../../../../components/Category';
import { Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useMutation } from 'react-query';
import UserService from '../../../UserService';
import MediaService from '../../../../../config/http/MediaService';
import { useRouter } from 'next/router';
import UsernameInput from '../../../components/UsernameInput';
import useWindowDimensions from '../../../../../hooks/useWindowDimensions';
import { walletTypes } from '../../../../../types/wallet';
import Link from 'next/link';
import LinkList from '../../../../../components/LinkList';
import ModalForm from '../../../../../components/Modal';
import UploadAndResizeImageModal from '../../../../../components/UploadAndResizeImage';
import convertBytesToMegabytes from '../../../../../utils/convertBytesToMegabytes';

const AccountCreate = () => {
  const router = useRouter();
  const { user, setUser, type, walletAddress: address } = useAuthContext();
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const [isOpenedModal, setIsOpenedModal] = useState<boolean>(false);
  const [editedAvatarBlob, setEditedAvatarBlob] = useState<Blob | null>(null);
  useEffect(() => {
    if (user && Object.keys(user).length > 1) {
      router.replace('/user/account/settings');
    }
  }, [user]);

  const { t } = useTranslation();
  const userMutation = useMutation(UserService.createUser);
  const imageMutation = useMutation(MediaService.post);
  const { width } = useWindowDimensions();

  const initialValues: FormValues = {
    nickname: user?.nickname,
    username: user?.username,
    avatar: null,
  };

  const onSubmit = async (values: FormValues) => {
    const { nickname, username, avatar } = values;

    let avatarResponse;

    if (avatar) {
      avatarResponse = editedAvatarBlob && (await imageMutation.mutateAsync(editedAvatarBlob));
    }

    if (address) {
      try {
        const response = await userMutation.mutateAsync({
          walletAddress: address,
          nickname,
          username,
          avatarHash: avatarResponse?.hash,
          registeredWallet: type as walletTypes,
        });

        setUser(response.user);
        message.success('User has been successfully created');
      } catch (e: any) {
        message.error(e.message);
        console.log(e);
      }
    }
  };

  return (
    <Category
      title={t('AccountCreate.Title')}
      style={{ marginTop: innerWindowWidth > maxMobileWidth ? 50 : 20 }}
      filterMaxMobileWidth
      isBottomLine>
      {address && (
        <LinkList
          items={[
            <Link href={`/user/${address}`}>
              <a>
                <span>Go to tokens</span>
              </a>
            </Link>,
          ]}
          className={classes.tokensLink}
          getItemTitle={(item) => item}
          getIsActive={() => true}
        />
      )}
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {({ setFieldValue, values }) => {
          return (
            <Form>
              <div className={classes.categoryContent}>
                <UploadAndResizeImageModal
                  visible={isOpenedModal}
                  onCancel={() => {
                    setIsOpenedModal(false);
                    setEditedAvatarBlob(null);
                  }}
                  src={values.avatar}
                  resizedImage={setEditedAvatarBlob}
                  closeModal={() => setIsOpenedModal(false)}
                />

                <div className={classes.row}>
                  <div className={classes.categoryContent__avatar}>
                    {editedAvatarBlob ? (
                      <img
                        src={URL.createObjectURL(editedAvatarBlob)}
                        alt="avatar"
                        width={width > maxMobileWidth ? 146 : 200}
                        height={width > maxMobileWidth ? 146 : 200}
                        style={{
                          borderRadius: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Avatar size={width > maxMobileWidth ? 146 : 200} icon={<UserOutlined />} />
                    )}
                  </div>
                  <div className={classes.categoryContent__formWrap}>
                    {width > maxMobileWidth ? (
                      <>
                        <div className={classes.categoryContent__form}>
                          <Properties
                            items={[
                              {
                                name: 'Avatar',
                                value: (
                                  <>
                                    {width > maxMobileWidth && (
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
                                                setFieldValue('avatar', e.target.files[0]);
                                                if (e.target.files[0]?.type === 'image/gif') {
                                                  setEditedAvatarBlob(e.target.files[0]);
                                                  return;
                                                }
                                                if (e.target.files.length) {
                                                  setIsOpenedModal(true);
                                                }
                                              }
                                            },
                                            accept: 'image/*',
                                          }}
                                        />
                                        <div />
                                        <Button
                                          loading={
                                            userMutation.isLoading || imageMutation.isLoading
                                          }
                                          styleType={ButtonType.Primary}
                                          type="submit">
                                          Create
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                ),
                              },
                              {
                                name: t('AccountSettings.Nickname'),
                                value: (
                                  <FormInput
                                    name="nickname"
                                    required
                                    placeholder="Type nickname here"
                                    bordered={false}
                                    wrapClassName={classes.inputWrap}
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
                            ]}
                            renderItemLabel={(item) => item.name}
                            renderItemValue={(item) => item.value}
                            resolveIsHighlighted={(item) => item.required}
                          />
                        </div>
                      </>
                    ) : (
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
                                setIsOpenedModal(true);
                              }
                            }
                          },
                          accept: 'image/*',
                        }}
                      />
                    )}
                  </div>
                </div>
                {width <= maxMobileWidth && (
                  <>
                    <div className={classes.categoryContent__form}>
                      <Properties
                        items={[
                          {
                            name: t('AccountSettings.Nickname'),
                            value: (
                              <FormInput
                                name="nickname"
                                required
                                placeholder="Type nickname here"
                                bordered={false}
                                wrapClassName={classes.inputWrap}
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
                        ]}
                        renderItemLabel={(item) => item.name}
                        renderItemValue={(item) => item.value}
                        resolveIsHighlighted={(item) => item.required}
                      />
                    </div>

                    <div className={classes.buttonWrap}>
                      <Button
                        loading={userMutation.isLoading || imageMutation.isLoading}
                        styleType={ButtonType.Secondary}
                        type="submit">
                        Create
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </Category>
  );
};

export default AccountCreate;

interface FormValues {
  nickname: string;
  username: string;
  avatar: File | null;
}
