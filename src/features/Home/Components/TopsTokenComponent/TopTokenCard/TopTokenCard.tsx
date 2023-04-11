import React from 'react';
import classes from '../index.module.scss';
import TokenUtil from '../../../../Token/utils/TokenUtil';
import GetTokenHeader from '../../../../Token/pages/TokensPage/GetTokenHeader';
import LinkList from '../../../../../components/LinkList';
import { IToken } from '../../../../../types/Tokens/Token';
import getMediaUrl from '../../../../../utils/getMediaUrl';
import { Skeleton } from 'antd';
import AddressUtil from '../../../../../utils/AddressUtil';
import parseTokenId from '../../../../../utils/TokenUtil';
import Link from 'next/link';
import { TokenType } from '../../../../Token/TokenService';

const TopTokenCard = ({ card, cardTag }: Props) => {
  //need checked video
  // const firstVideo = card?.raw?.videos?.[0]
  const imageToken = card?.raw?.media?.[0]?.hash;
  const previewToken = card?.raw?.media?.find(({ role }: any) => role === 'preview')?.hash;
  const isVideo = card?.raw?.media?.[0]?.mimetype?.indexOf('video') !== -1;
  const image = getMediaUrl(
    previewToken ? previewToken : imageToken || '',
    isVideo ? 'video/preview' : 'image',
    {
      width: 600,
    },
  );
  const { saleType, currentPrice, numberOfCustomers, step } = TokenUtil.getSaleInfo(card);

  const currentEdition =
    card?.deployed?.type === TokenType.Art2 ? parseTokenId(card.tokenID || '').tokenId : 1;

  const totalEdition =
    card?.deployed?.type === TokenType.Art2 ? card.deployed?.seriesID?.deployed?.maximum : 1;
  return (
    <>
      <div className={classes.wrapper}>
        <Link href={`/token/${card.deployed?.type}/${card.tokenID}`}>
          <div
            className={classes.container}
            style={{
              backgroundImage: `url(${image})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}>
            <div style={{ position: 'relative' }}>
              <div className={classes.hoverContainer}>
                <div className={classes.cardHeaderWrap}>
                  <GetTokenHeader
                    minimalBid={step}
                    currentPrice={currentPrice}
                    saleType={saleType}
                    numberOfCustomers={numberOfCustomers}
                    frontStatus={card.deployed?.frontStatus}
                  />
                </div>
                <div className={classes.cardTitle}>{card?.raw?.title}</div>
                <div className={classes.cardEdition}>
                  Edition {currentEdition} of {totalEdition}
                </div>
                <Link href={`/token/${card.deployed?.type}/${card.tokenID}`}>
                  <a>
                    <LinkList
                      items={[{ title: 'View details' }]}
                      getItemTitle={(i) => i.title}
                      getIsActive={() => true}
                      className={classes.linkList}
                    />
                  </a>
                </Link>
              </div>
            </div>
            <div className={classes.shadow}>
              <div className={classes.title}>{card?.raw?.title}</div>
            </div>
          </div>
        </Link>
        <div className={classes.userInfo}>
          <div className={classes.userInfo__wrapper}>
            <Link href={`/user/${card.deployed?.creatorObject?.username}`}>
              <a>
                {card?.deployed?.creatorObject?.avatarHash ? (
                  <img
                    src={
                      card?.deployed?.creatorObject?.avatarHash &&
                      getMediaUrl(card?.deployed?.creatorObject?.avatarHash, 'image', {
                        width: 32,
                        height: 32,
                        compressionQuality: 70,
                      })
                    }
                    alt="Author_img"
                  />
                ) : (
                  <Skeleton.Avatar />
                )}
              </a>
            </Link>
            <div className={classes.userInfo__authorname}>
              {card.deployed?.creatorObject
                ? card.deployed?.creatorObject?.nickname
                : AddressUtil.shorten(card.deployed?.creator)}
            </div>
          </div>
          <div className={classes.linkButton}>{cardTag || 'Top - 3 Price'}</div>
        </div>
      </div>
    </>
  );
};

interface Props {
  card: IToken;
  cardTag?: string | null;
}

export default TopTokenCard;
