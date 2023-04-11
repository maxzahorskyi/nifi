import React, { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import classes from './index.module.scss';
import {
  FacebookShareButton,
  RedditShareButton,
  TelegramShareButton,
  TwitterShareButton,
  VKShareButton,
} from 'react-share';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import ShareIcon from '../../../public/icons/share.svg';
import { ITokenInfoDto } from '../../types/Tokens/TokenInfo';
import { GQLSeries } from '../../types/graphql.schema';

const ShareModal = ({ token }: Props) => {
  const [isShareModalShown, setIsShareModalShown] = useState(false);
  const router = useRouter();
  const config = getConfig().publicRuntimeConfig;
  const { domain } = config.services;

  return (
    <>
      <ShareIcon
        style={{ cursor: 'pointer', marginLeft: 10 }}
        onClick={() => setIsShareModalShown(!isShareModalShown)}
      />
      {isShareModalShown && (
        <OutsideClickHandler onOutsideClick={() => setIsShareModalShown(!isShareModalShown)}>
          <div className={classes.shareModal}>
            <div className={classes.shareContainer}>
              <span className={classes.title}>Share</span>
              <hr className={classes.divider} />
              <div className={classes.socialNetworkContainer}>
                <div className={classes.socialNetwork}>
                  <TwitterShareButton url={`https://${domain}${router.asPath}`}>
                    <img src="/icons/twitter.svg" alt="social-network-icon" />
                    <span className={classes.socialNetworkName}>Twitter</span>
                  </TwitterShareButton>
                </div>
                <div className={classes.socialNetwork}>
                  <FacebookShareButton
                    windowPosition="windowCenter"
                    url={`https://${domain}${router.asPath}`}>
                    <img src="/icons/facebook.svg" alt="social-network-icon" />
                    <span className={classes.socialNetworkName}>Facebook</span>
                  </FacebookShareButton>
                </div>
                <div className={classes.socialNetwork}>
                  <RedditShareButton url={`https://${domain}${router.asPath}`}>
                    <img src="/icons/reddit.svg" alt="social-network-icon" />
                    <span className={classes.socialNetworkName}>Reddit</span>
                  </RedditShareButton>
                </div>
                <div className={classes.socialNetwork}>
                  <TelegramShareButton url={`https://${domain}${router.asPath}`}>
                    <img src="/icons/telegram.svg" alt="social-network-icon" />
                    <span className={classes.socialNetworkName}>Telegram</span>
                  </TelegramShareButton>
                </div>
                <div className={classes.socialNetwork}>
                  <VKShareButton url={`https://${domain}${router.asPath}`}>
                    <img src="/icons/vk.svg" alt="social-network-icon" />
                    <span className={classes.socialNetworkName}>VKontakte</span>
                  </VKShareButton>
                </div>
              </div>
            </div>
          </div>
        </OutsideClickHandler>
      )}
    </>
  );
};

interface Props {
  token: ITokenInfoDto | GQLSeries | undefined;
}

export default ShareModal;
