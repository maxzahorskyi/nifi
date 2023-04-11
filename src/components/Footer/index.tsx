import React from 'react';
import classes from './index.module.scss';
import TextList from '../TextList';
import Container from '../Container';
import Link from 'next/link';
import cn from 'classnames';
import { useUiManagementData } from '../../hooks/new/useUiManagementData';
import { UiManagementType } from '../../types/UiManagementType';

const Footer = (props: Props) => {
  const { getUiManagementData } = useUiManagementData();

  return (
    <div className={classes.bg}>
      <Container className={classes.wrap}>
        <div className={classes.content}>
          <div className={classes.footer}>
            <div className={classes.companyInfo}>
              <img src="/images/logo.svg" alt="Nifi" width="auto" height="30px" />
              <span className={classes.companyInfo__text}>
                © 2022 NiFi Club LLC, All rights reserved
              </span>
            </div>

            <div className={classes.columns}>
              <div className={classes.columns__column}>
                <TextList
                  title="About"
                  titleClassname={classes.titleWhite}
                  items={getUiManagementData(UiManagementType.FOOTER_ABOUT)}
                  getItemTitle={(item) => (
                    <span className={classes.hintText}>
                      <Link href={item.assetID?.textLanding || '/'}>{item.assetTitle}</Link>
                    </span>
                  )}
                />
              </div>
              <div className={classes.columns__column}>
                <TextList
                  title="Help"
                  items={getUiManagementData(UiManagementType.FOOTER_HELP)}
                  titleClassname={classes.titleWhite}
                  getItemTitle={(item) => (
                    <span className={cn(classes.hintText)}>
                      <Link href={item.assetID?.textLanding || '/'}>{item.assetTitle}</Link>
                    </span>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;

interface Props {}
