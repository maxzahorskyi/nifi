import React from 'react';
import classes from './index.module.scss';
import Link from 'next/link';

const CardThemeMasonry = () => {
  return (
    <div className={classes.card}>
      <div className={classes.cardWrapper}>
        <div className={classes.cardWrapper__image}>image</div>
        <Link href="#">
          <a>
            <div className={classes.cardWrapper_active}>
              <div className={classes.cardHeader}>Header</div>
              <div>
                <div className={classes.cardWrapper_active__cardName__wrap}>
                  <span className={classes.cardWrap_active__cardName}>text</span>
                </div>
                <div className={classes.cardWrapper_active__edition__wrap}>
                  <span className={classes.cardWrap_active__edition}>text</span>
                </div>
              </div>
            </div>
          </a>
        </Link>
        Masonry
      </div>
    </div>
  );
};

export default CardThemeMasonry;
