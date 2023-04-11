import { ApolloError, useQuery as useGqlQuery } from '@apollo/client';
import { message, Radio, Select, Skeleton, Slider } from 'antd';
import cn from 'classnames';
import { Formik } from 'formik';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import Button, { ButtonType } from '../../../../components/Button';
import Category from '../../../../components/Category';
import EverIcon from '../../../../components/EverIcon';
import Fees from '../../../../components/Fees';
import FileInput from '../../../../components/FileInput';
import FormDateTimePicker from '../../../../components/FormDateTimePicker';
import FormInput from '../../../../components/FormInput';
import FormTextArea from '../../../../components/FormTextArea';
import MediaPreview from '../../../../components/MediaPreview';
import NoExtratonExceptionModal from '../../../../components/NoExtratonExceptionModal';
import Properties from '../../../../components/Properties';
import UserInfo from '../../../../components/UserInfo';
import CollectiblesService from '../../../../config/http/CollectiblesService';
import { getContract } from '../../../../gql/query/contract';
import { useCollectible } from '../../../../hooks/collectibles';
import { useCollections } from '../../../../hooks/collections';
import useAuthContext from '../../../../hooks/useAuthContext';
import useContractsContext from '../../../../hooks/useContractsContext';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import { GQLCollection, GQLContract } from '../../../../types/graphql.schema';
import { routeToTypeMap, urls } from '../../../../types/pages';
import AddressUtil from '../../../../utils/AddressUtil';
import getMediaResolution from '../../../../utils/getMediaResolution';
import getMediaUrl from '../../../../utils/getMediaUrl';
import TimeUtil from '../../../../utils/TimeUtil';
import { TokenType } from '../../TokenService';
import { CollectiblesUtil } from '../../utils/CollectiblesUtil';
import classes from './index.module.scss';
import FeesWithButton from '../../components/FeesWithButton';
import { useNetworkError } from '../../../../hooks/useNetworkError';

const initialFormValues = {
  images1: [] as FormMedia[],
  images2: [] as FormMedia[],
  images3: [] as FormMedia[],
  images4: [] as FormMedia[],
  images5: [] as FormMedia[],

  layerName0: '',
  layerName1: '',
  layerName2: '',
  layerName3: '',
  layerName4: '',

  'imageName0-0': '',

  title: '',
  type: TokenType.Collectible,
  collectionID: '',
  numberOfEditions: 1,
  mintCost: 1,
  fee: 0,
  description: '',
  startTime: 0,
};

type FormValues = typeof initialFormValues;

type SetFieldValue = <FieldKey extends keyof FormValues>(
  field: FieldKey,
  value: FormValues[FieldKey],
  shouldValidate?: boolean,
) => void;

enum LoadingStatus {
  NotLoading = 'NotLoading',
  SavingOnBackend = 'SavingOnBackend',
  SavingOnBlockchain = 'SavingOnBlockchain',
}

const config = getConfig();

const CreateCollectiblePage = () => {
  const { onNetworkErrorClick } = useNetworkError();
  const { networkError } = useAuthContext();

  const tonClientBridge = useTonClientBridge();
  const { contractTypes } = useContractsContext();
  const router = useRouter();
  const { width, maxMobileWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const { user, walletAddress: wallet } = useAuthContext();
  const [type, setType] = useState('art1');
  const { data: contract } = useGqlQuery<{ contract: GQLContract }>(getContract, {
    errorPolicy: 'ignore',
    variables: { name: `nifi.${type}`, status: 'active' },
  });
  const identifier = router.query?.usernameOrAccountNumber as string | undefined;

  const imageMutation = useMutation(CollectiblesService.post);
  const seriesMutation = useMutation(CollectiblesService.generate);

  const [createdSeriesId, setCreatedSeriesId] = useState<string | undefined>(undefined);

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.NotLoading);
  const isLoading = loadingStatus !== LoadingStatus.NotLoading;

  const [isNoExtratonExceptionShown, setIsNoExtratonExceptionShown] = useState(false);
  const [collectionArray, setCollectionArray] = useState<GQLCollection[] | undefined>(undefined);
  const imgUrl = config.publicRuntimeConfig.services.mediaUrl;

  const showNoExtratonException = () => {
    setIsNoExtratonExceptionShown(true);
  };
  useCollections({
    skipQuery: false,
    variables: { query: { creator: wallet } },
    onSuccess: (collections: GQLCollection[]) => {
      setCollectionArray(collections);
    },
    onError: (e: ApolloError) => {
      console.log(e);
    },
  });

  useCollectible({
    skipQuery: !createdSeriesId,
    variables: {
      query: {
        seriesId: createdSeriesId,
      },
    },
    onError: (e) => {
      message.error('Collectibles error');
      console.log(e);
    },
    onCompleted: (data) => {
      if (data?.col1?.seriesId) {
        router.push(`/token/col1/${data.col1.seriesId}/series`);
      }
    },
    poolInterval: 1000,
  });

  const [layerValue, setLayerValue] = useState<number>(1);

  const CollectiblesTools = new CollectiblesUtil(
    wallet,
    imageMutation,
    tonClientBridge,
    showNoExtratonException,
    seriesMutation,
  );

  useEffect(() => {
    if (createdSeriesId) {
      const timeout = setTimeout(() => {
        setCreatedSeriesId(undefined);
        message.error('An error occurred while creating the series');
      }, 15000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [createdSeriesId]);

  const createFormMedia = async (file: File) => {
    const { width, height } = await getMediaResolution(file);

    return {
      file,
      subtitle: '',
      width,
      height,
      rarity: 4,
    };
  };

  const onMediaReload = async (
    media: File | undefined,
    index: number,
    values: FormValues,
    setFieldValue: SetFieldValue,
    field: keyof FormValues,
  ) => {
    if (!media) {
      return;
    }
    const formMedia = await createFormMedia(media);
    if (media.type.includes('image')) {
      setFieldValue(
        field,
        (values[field] as FormMedia[])
          .slice(0, index)
          .concat(formMedia, (values[field] as FormMedia[]).slice(index + 1)),
      );
    }
  };

  const onMediaUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    values: FormValues,
    setFieldValue: SetFieldValue,
    layer: number,
  ) => {
    const images = Array.from(e.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );

    if (images.length !== (e.target.files?.length ?? 0)) {
      message.warn('Some files have been removed since they have incorrect type', 5);
    }

    const formImages = await Promise.all(Array.from(images ?? []).map(createFormMedia));

    setFieldValue(
      `images${layer}` as keyof FormValues,
      (values[`images${layer}` as keyof FormValues] as FormMedia[]).concat(formImages),
    );
  };

  const onSubmit = async (values: FormValues) => {
    if (!wallet) {
      showNoExtratonException();
    }
    const images = Object.keys(values)
      .filter((item) => Array.isArray(values[item as keyof FormValues]))
      .map((item) => values[item as keyof FormValues] as FormMedia[]);

    images.forEach((layer, layerNum) => {
      layer.forEach((image, imageNum) => {
        // @ts-ignore
        image.subtitle = values[`imageName${layerNum + 1}-${imageNum}`] as string;

        if (image.subtitle === '' || !image.subtitle) {
          message.error('Subtitles cannot be empty');
          throw new Error('Subtitles cannot be empty');
        }
      });
    });

    await CollectiblesTools.createCollectible({
      onSuccess: (id) => {
        setCreatedSeriesId(id);
      },
      layers: images,
      mintCost: values.mintCost,
      name: values.title,
      symbol: values.title,
      creatorFees: values.fee,
      limit: values.numberOfEditions,
      description: values.description,
      startTime: TimeUtil.convertTimestampToSeconds(values.startTime),
      layersNames: [
        ...Object.keys(values)
          .filter((entity, key) => {
            return entity.includes('layerName');
          })
          .map((item) => values[item as keyof FormValues] as string),
      ],
    });
  };

  const hideNoExtratonException = () => {
    setIsNoExtratonExceptionShown(false);
  };

  const handleArtworkTypeChange = (value: TokenType, setFieldValue: SetFieldValue) => {
    setFieldValue('type', value);
    setType(value);

    if (value === TokenType.Art1) {
      setFieldValue('numberOfEditions', 1);
    }

    router.push(`${urls.tokenCreate.route}/${routeToTypeMap[value]}`);
  };

  return (
    <div>
      {width <= maxMobileWidth && (
        <div style={{ marginTop: 30 }}>
          <UserInfo
            avatarUrl={
              user?.avatarHash && getMediaUrl(user?.avatarHash, 'image', { width: 80, height: 80 })
            }
            name={
              <div className="username">
                <span>{user?.nickname ?? AddressUtil.shorten(identifier)}</span>
                {user?.username && <span>@{user?.username}</span>}
              </div>
            }
            className={classes.userInfo}
          />
        </div>
      )}

      <Formik initialValues={initialFormValues} onSubmit={onSubmit}>
        {({ handleSubmit, setFieldValue, values }) => (
          <form onSubmit={handleSubmit}>
            {width <= maxMobileWidth && (
              <>
                <Properties
                  className={cn(classes.createCollectible)}
                  items={[
                    {
                      name: 'Token type',
                      value: (
                        <Select
                          defaultValue={TokenType.Collectible}
                          bordered={false}
                          onChange={(value) => handleArtworkTypeChange(value, setFieldValue)}
                          className={cn(classes.select, classes.formControl)}>
                          {Object.keys(TokenType).map((item, key, arr) => {
                            return (
                              <Select.Option value={TokenType[item as keyof typeof TokenType]}>
                                {contractTypes?.find(
                                  (contract) =>
                                    contract.longType ===
                                    `nifi.${TokenType[item as keyof typeof TokenType]}`,
                                )?.frontendName || TokenType[item as keyof typeof TokenType]}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      ),
                      required: true,
                    },
                  ]}
                  renderItemLabel={(item) => item.name}
                  renderItemValue={(item) => item.value}
                  resolveIsHighlighted={(item) => item.required}
                />
              </>
            )}

            {width <= maxMobileWidth && <BigDividerMobile paddingBottom={10} paddingTop={40} />}

            <Category
              title={t(
                width <= maxMobileWidth
                  ? 'TokenCreationPage.MediaFiles'
                  : 'TokenCreationPage.TokenCreation',
              )}
              className={`${classes.wrap} ${
                width <= maxMobileWidth && classes.mobileFormInputWrap
              }`}
              contentProps={{
                className: classes.content,
              }}>
              <div className={classes.images}>
                {layerValue &&
                  !(values[`images${layerValue}` as keyof FormValues] as FormMedia[]).length && (
                    <>
                      <Skeleton.Image
                        style={{
                          width: width > maxMobileWidth ? 500 : '100%',
                          height: width > maxMobileWidth ? 500 : '355px  ',
                        }}
                      />
                    </>
                  )}

                {/*разделитель*/}
                {layerValue &&
                  (values[`images${layerValue}` as keyof FormValues] as FormMedia[])?.map(
                    ({ file, width, height, subtitle }, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <MediaPreview
                          src={imageUrl}
                          number={index + 1}
                          subtitle={
                            <FormInput
                              required
                              placeholder="Type image subtitle here"
                              maxLength={64}
                              bordered={false}
                              wrapClassName={classes.subtitleInputWrap}
                              name={`imageName${layerValue}-${index}`}
                              style={{
                                fontSize: 14,
                                fontWeight: 300,
                              }}
                            />
                          }
                          isRarityShown
                          rarity={
                            Array.isArray(values[`images${layerValue}` as keyof FormValues])
                              ? (values[`images${layerValue}` as keyof FormValues] as FormMedia[])[
                                  index
                                ]?.rarity
                              : undefined
                          }
                          onRarityChange={(rarity) => {
                            setFieldValue(
                              `images${layerValue}` as keyof FormValues,
                              (
                                values[`images${layerValue}` as keyof FormValues] as FormMedia[]
                              ).map((item, key) => {
                                return key === index ? { ...item, rarity } : item;
                              }),
                            );
                          }}
                          onDelete={() => {
                            setFieldValue(
                              `images${layerValue}` as keyof FormValues,
                              (values[`images${layerValue}` as keyof FormValues] as FormMedia[])
                                .slice(0, index)
                                .concat(
                                  (
                                    values[`images${layerValue}` as keyof FormValues] as FormMedia[]
                                  ).slice(index + 1),
                                ),
                            );
                          }}
                          onReload={(media) =>
                            onMediaReload(
                              media,
                              index,
                              values,
                              setFieldValue,
                              `images${layerValue}` as keyof FormValues,
                            )
                          }
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
                    },
                  )}
              </div>

              <div className={classes.form}>
                <>
                  <Properties
                    className={cn(classes.createCollectible, classes.tokenTypeCategory)}
                    items={[
                      width > maxMobileWidth && {
                        name: 'Token type',
                        value: (
                          <Select
                            defaultValue={TokenType.Collectible}
                            bordered={false}
                            onChange={(value) => handleArtworkTypeChange(value, setFieldValue)}
                            className={cn(classes.select, classes.formControl)}>
                            {Object.keys(TokenType).map((item, key, arr) => {
                              return (
                                <Select.Option value={TokenType[item as keyof typeof TokenType]}>
                                  {contractTypes?.find(
                                    (contract) =>
                                      contract.longType ===
                                      `nifi.${TokenType[item as keyof typeof TokenType]}`,
                                  )?.frontendName || TokenType[item as keyof typeof TokenType]}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        ),
                        required: true,
                      },
                    ]}
                    renderItemLabel={(item) => item.name}
                    renderItemValue={(item) => item.value}
                    resolveIsHighlighted={(item) => item.required}
                    resolveHideItemInMobile={(item) => item.hideInMobile}
                  />

                  <Properties
                    className={cn(classes.createCollectible, classes.collectionCollectibleCategory)}
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
                            {collectionArray?.map(({ title, media, _id }) => {
                              const avatar = media?.find(
                                ({ role }: any) => role === 'avatar',
                              )?.hash;
                              return (
                                <Select.Option value={_id}>
                                  <img
                                    src={`${imgUrl}/${avatar}`}
                                    alt=""
                                    style={{
                                      height: 80,
                                      width: 80,
                                      borderRadius: 12,
                                      marginRight: 10,
                                      objectFit: 'cover',
                                    }}
                                  />{' '}
                                  {title}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        ),
                        required: true,
                      },
                    ]}
                    renderItemLabel={(item) => item.name}
                    renderItemValue={(item) => item.value}
                    resolveIsHighlighted={(item) => item.required}
                    resolveHideItemInMobile={(item) => item.hideInMobile}
                  />

                  <Properties
                    className={cn(classes.createCollectible, classes.padding)}
                    style={{ gridRowGap: 20 }}
                    items={[
                      {
                        name: 'Collectible title',
                        value: (
                          <FormInput
                            required
                            name="title"
                            maxLength={128}
                            bordered={false}
                            placeholder="Type title here"
                            wrapClassName={classes.formControlWrap}
                            className={classes.formControl}
                            valueTextAlign="start"
                          />
                        ),
                        required: true,
                      },
                      {
                        name: 'Media width',
                        value: (
                          <FormInput
                            required
                            name="MediaWidth"
                            bordered={false}
                            placeholder="1,000"
                            wrapClassName={classes.formControlWrap}
                            className={classes.formControl}
                            valueTextAlign="start"
                            type="number"
                          />
                        ),
                        required: true,
                      },
                      {
                        name: 'Media height',
                        value: (
                          <FormInput
                            required
                            name="MediaHeight"
                            bordered={false}
                            placeholder="1,000"
                            wrapClassName={classes.formControlWrap}
                            className={classes.formControl}
                            valueTextAlign="start"
                            type="number"
                          />
                        ),
                        required: true,
                      },
                      {
                        name: 'Number of editions',
                        value: (
                          <FormInput
                            required
                            name="numberOfEditions"
                            type="number"
                            min={0}
                            bordered={false}
                            placeholder="10 000"
                            wrapClassName={classes.formControlWrap}
                            className={cn(classes.formControl, classes.numberOfEdition)}
                          />
                        ),
                        required: true,
                      },
                      {
                        name: 'Minting start time',
                        value: <FormDateTimePicker name="startTime" required min={new Date()} />,
                        required: true,
                      },
                      {
                        name: 'Minimal mint fee',
                        value: (
                          <div className={classes.minFee}>
                            <span style={{ marginRight: 10, fontSize: 24 }}>
                              <EverIcon />
                            </span>
                            <FormInput
                              required
                              name="mintCost"
                              type="number"
                              min={0.5}
                              step={0.01}
                              bordered={false}
                              placeholder="3"
                              wrapClassName={classes.formControlWrap}
                              className={classes.formControl}
                            />
                          </div>
                        ),
                        required: true,
                      },
                      {
                        name: t('TokenCreationPage.CreatorsLifetimeFee'),
                        value: (
                          <div className={classes.slider}>
                            <span className={classes.slider__value}>{values.fee}%</span>
                            <Slider
                              style={{
                                width: '100%',
                              }}
                              min={0}
                              max={24}
                              onChange={(value: number) => setFieldValue('fee', value)}
                              tooltipVisible={false}
                            />
                          </div>
                        ),
                        required: true,
                      },
                      {
                        name: t('TokenCreationPage.Description'),
                        value: (
                          <FormTextArea
                            name="description"
                            maxLength={512}
                            bordered={false}
                            placeholder="Type description here"
                            autoSize={{
                              minRows: 1,
                              maxRows: 10,
                            }}
                            wrapClassName={classes.formControlWrap}
                            className={classes.formControl}
                          />
                        ),
                        required: false,
                      },
                    ]}
                    renderItemLabel={(item) => item.name}
                    renderItemValue={(item) => item.value}
                    resolveIsHighlighted={(item) => item.required}
                    resolveHideItemInMobile={(item) => item.hideInMobile}
                  />

                  {/*<Properties*/}
                  {/*  className={classes.createCollectible}*/}
                  {/*  items={[]}*/}
                  {/*  renderItemLabel={(item) => item.name}*/}
                  {/*  renderItemValue={(item) => item.value}*/}
                  {/*  resolveIsHighlighted={(item) => item.required}*/}
                  {/*  resolveHideItemInMobile={(item) => item.hideInMobile}*/}
                  {/*/>*/}

                  <div className={classes.layers}>
                    <div className={classes.layers_title}>Layers</div>
                    <div>
                      <div>
                        <Radio.Group
                          defaultValue={layerValue}
                          value={layerValue}
                          className={classes.layers_radioButtons}
                          onChange={(e) => {
                            setLayerValue(e.target.value);
                          }}>
                          {[1, 2, 3, 4, 5].map((layer) => {
                            return (
                              <div className={classes.layers_radioButtons__sections}>
                                <Radio value={layer}>Layer {layer}</Radio>
                                <Properties
                                  className={classes.layerProperties}
                                  items={[
                                    {
                                      name: 'Layer name',
                                      value: (
                                        <FormInput
                                          required
                                          key={layer}
                                          name={`layerName${layer - 1}`}
                                          maxLength={70}
                                          bordered={false}
                                          placeholder="Layer name here"
                                          wrapClassName={classes.formControlWrap}
                                          className={classes.layerInput}
                                          valueTextAlign="start"
                                        />
                                      ),
                                      required: true,
                                    },
                                    {
                                      name: 'Add media',
                                      value: (
                                        <FileInput
                                          wrapProps={{
                                            className: classes.layers_radioButtons__fileInput,
                                          }}
                                          fileInputProps={{
                                            onChange: (e) =>
                                              onMediaUpload(e, values, setFieldValue, layer),
                                            onClick: () => {
                                              setLayerValue(layer);
                                            },
                                            multiple: true,
                                            accept: 'image/*',
                                            required: true,
                                          }}
                                          isTokenPageCreate
                                        />
                                      ),
                                      required: true,
                                    },
                                  ]}
                                  renderItemLabel={(item) => item.name}
                                  renderItemValue={(item) => item.value}
                                  resolveIsHighlighted={(item) => item.required}
                                />
                              </div>
                            );
                          })}
                        </Radio.Group>
                      </div>
                    </div>
                  </div>
                  <div className={classes.submitButtonWrapper}>
                    <FeesWithButton commissionsIds={[CommissionTypes.CollectibleCreation]}>
                      <>
                        {!networkError ? (
                          <Button
                            type="submit"
                            className={classes.form__submit}
                            styleType={ButtonType.Primary}
                            loading={isLoading}>
                            Create collectible
                          </Button>
                        ) : (
                          <Button
                            className={classes.form__submit}
                            styleType={ButtonType.Primary}
                            onClick={onNetworkErrorClick}>
                            Create collectible
                          </Button>
                        )}
                      </>
                    </FeesWithButton>
                  </div>
                </>
              </div>
            </Category>
          </form>
        )}
      </Formik>

      <NoExtratonExceptionModal
        isNoExtratonExceptionShown={isNoExtratonExceptionShown}
        hideNoExtratonException={hideNoExtratonException}
      />
    </div>
  );
};

export interface FormMedia {
  subtitle: string;
  file: File;
  width: number;
  height: number;
  rarity: number;
}

export interface Loading {
  mintToken: boolean;
  mintedToken: boolean;
}

export default CreateCollectiblePage;
