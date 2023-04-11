import React from 'react';
import classes from './index.module.scss';
import Link from 'next/link';

const CardThemeUsual = () => {
  return (
    <div className={classes.card}>
      <div className={classes.cardWrap}>
        <div className={classes.cardWrap__image}>image</div>
        <Link href="#">
          <a>
            <div className={classes.cardWrap_active}>
              <div className={classes.cardHeader}>Header</div>
              <div>
                <div className={classes.cardWrap_active__cardName__wrap}>
                  <span className={classes.cardWrap_active__cardName}>text</span>
                </div>
                <div className={classes.cardWrap_active__edition__wrap}>
                  <span className={classes.cardWrap_active__edition}>text</span>
                </div>
              </div>
            </div>
          </a>
        </Link>
        Usual
      </div>
    </div>
  );
};

export default CardThemeUsual;
