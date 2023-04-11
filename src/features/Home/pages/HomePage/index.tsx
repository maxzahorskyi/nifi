import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import Slider from '../../Components/Slider';
import Category from '../../../../components/Category';
import Carousel from '../../Components/Carousel';
import Classified from '../../Components/Classified';
import Announcement from '../../Components/Announcement';
import { GQLUi_management as GQLUiManagement } from '../../../../types/graphql.schema';
import TopsTokenWrapper from '../../Components/TopsTokenComponent/TopsTokenWrapper';
import TopCreatorWrapper from '../../Components/TopCreatorCard/TopCreatorWrapper';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import Charts from '../../Components/Charts';
import CreateTokenButton from '../../../Activity/components/CreateTokenButton';
import { totalLikes, useLikes } from '../../../../hooks/likes/likes';
import MetaTags from '../../../Token/components/MetaTags';
import { useUiManagementData } from '../../../../hooks/new/useUiManagementData';
import Loader from '../../../../components/Loader';
import { UiManagementType } from '../../../../types/UiManagementType';
import { PageType } from '../../../../types/pages';
import { useUiAssetsData } from '../../../../hooks/new/useUiAssetsData';
import { HomePageProps } from '../../types';

const Home = ({ meta }: HomePageProps) => {
  const { getGroupLikesByUserAccountNumbers } = useLikes();
  const { uiAssets, isUiAssetsData, isLoading: isUiAssetsLoading } = useUiAssetsData();
  const {
    getUiManagementData,
    isUiManagementData,
    isLoading: isUiManagementLoading,
  } = useUiManagementData();
  const { isDesktopWidth } = useWindowDimensions();

  const [likesData, setLikesData] = useState<{ [key: string]: totalLikes }>({});
  const [mongoLoading, setMongoLoading] = useState<boolean>(true);

  let topDataTokens: GQLUiManagement[] = getUiManagementData(UiManagementType.TOPS_CARD);
  let topDataCreators: GQLUiManagement[] = getUiManagementData(UiManagementType.TOP_CREATORS);

  useEffect(() => {
    if (isUiAssetsData && !isUiAssetsLoading && isUiManagementData && !isUiManagementLoading) {
      setMongoLoading(false);
    }
  }, [isUiAssetsData, isUiAssetsLoading, isUiManagementData, isUiManagementLoading]);

  useEffect(() => {
    const creators = topDataCreators?.map((creator) => Number(creator?.itemID) || 0);
    if (creators?.length) {
      getGroupLikesByUserAccountNumbers({
        userAccountNumbers: creators,
        onSuccess: (data: any) => setLikesData(data),
      });
    }
  }, [topDataCreators]);

  if (mongoLoading) {
    return (
      <>
        <MetaTags title={meta.title} description={meta.description} image={meta.imgSrc} />
        <Loader size="default" height={70} />
      </>
    );
  }

  return (
    <>
      <MetaTags title={meta.title} description={meta.description} image={meta.imgSrc} />
      <div className={classes.container}>
        <div className={classes.firstSection}>
          <div className={classes.sliderSection}>
            <Slider mainSliders={getUiManagementData(UiManagementType.MAIN_SLIDER)} />
            <Classified
              classifieds={getUiManagementData(UiManagementType.CLASSIFIED)}
              assets={uiAssets}
            />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div className={classes.createButtonSection}>
            <div className={classes.backgroundImage} />
            <div className={classes.createButtonWrapper}>
              <div className={classes.createYourTokenButton}>
                <CreateTokenButton
                  style={{
                    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.5)',
                    background: '#d5617d',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <Announcement />

        {!isDesktopWidth && <BigDividerMobile paddingBottom="40px" />}

        <Category
          title="TRADING AND STATS"
          filterMaxMobileWidth
          style={{
            marginBottom: isDesktopWidth ? 75 : 50,
            marginTop: isDesktopWidth ? 0 : -28,
          }}
          contentProps={{ className: classes.tradingSection }}>
          <Charts />
        </Category>

        <div className={classes.deepBg}>
          <Category
            title="TOPS"
            deepBg
            contentProps={{ className: classes.topsSection }}
            style={{ paddingTop: isDesktopWidth ? 0 : 23 }}>
            <Carousel containerId="topTokens" deepBg gapBetweenItems={24}>
              {topDataTokens?.map((card: GQLUiManagement, index) => (
                <TopsTokenWrapper topsCard={card} key={index.toString()} />
              ))}
            </Carousel>
          </Category>
        </div>

        <Category
          title="TOP CREATORS"
          contentProps={{ className: classes.tradingSection }}
          filterMaxMobileWidth
          style={{
            marginBottom: isDesktopWidth ? 100 : 40,
            marginTop: isDesktopWidth ? 45 : 35,
          }}>
          <Carousel containerId="topCreators" gapBetweenItems={16}>
            {topDataCreators?.map((creator: GQLUiManagement, index) => (
              <TopCreatorWrapper
                key={index.toString()}
                creator={creator}
                likesCount={creator?.itemID ? likesData[creator.itemID]?.totalLikes : 0}
              />
            ))}
          </Carousel>
        </Category>
      </div>
    </>
  );
};

export default Home;
