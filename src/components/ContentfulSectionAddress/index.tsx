import classes from './index.module.scss';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import RichText from '@madebyconnor/rich-text-to-jsx';
import cn from 'classnames';
import { Collapse } from 'antd';
import { useRouter } from 'next/router';
import ContentfulService from '../../services/ContentfulService';
import Title from '../Title';
import { overrides } from '../OverrideComponent';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useDocumentScrollThrottled from '../../hooks/useDocumentScrollThrottled';
import CreateTokenButton from '../../features/Activity/components/CreateTokenButton';
import Loader from '../Loader';

const { Panel } = Collapse;
const ContentfulSectionAddress = ({ routerFromSubsection, sectionAddress }: any) => {
  const [entries, setEntries] = useState<any>([]);
  const [currentEntryId, setCurrentEntryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldHideHeader, setShouldHideHeader] = useState(false);
  const [collapseKey, setCollapseKey] = useState<any>(1);
  const router = useRouter();
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  useLayoutEffect(() => {
    setIsLoading(true);
    const currentTitleId = router.query.id as string;
    ContentfulService.getEntries('article')
      ?.then((res: any) => {
        const foundedEntries = res.items
          .filter((item: any) => item.fields.sectionAddress === sectionAddress)
          .sort((a: any, b: any) => a.fields.sortOrder - b.fields.sortOrder);
        setEntries(foundedEntries);
        setCurrentEntryId(currentTitleId);
      })
      .catch(console.log)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (routerFromSubsection && routerFromSubsection.query.subsection) {
      const foundedEntry = entries.find(
        (entry: any) => entry.fields.subsection === routerFromSubsection.query.subsection,
      );
      setCurrentEntryId(foundedEntry?.sys?.id);
    } else if (entries.length > 0) {
      router.push(`/${sectionAddress}/${entries[0].fields.subsection}`);
    }
  }, [routerFromSubsection, entries]);

  const currentEntry = useMemo(() => {
    return entries.find((item: any) => item.sys.id === currentEntryId);
  }, [currentEntryId, entries]);

  const handleTitleClick = (id: string, title: string) => {
    setCurrentEntryId(id);
    router
      .push(
        {
          pathname: `/${sectionAddress}/${title}`,
          query: id,
        },
        { pathname: `/${sectionAddress}/${title}` },
        { shallow: false },
      )
      .then((r) => console.log(r, 'r'));
  };

  const MINIMUM_SCROLL = 80;
  const TIMEOUT_DELAY = 300;

  useDocumentScrollThrottled((callbackData: { previousScrollTop: any; currentScrollTop: any }) => {
    const { previousScrollTop, currentScrollTop } = callbackData;
    const isScrolledDown = previousScrollTop < currentScrollTop;
    const isMinimumScrolled = currentScrollTop > MINIMUM_SCROLL;

    setTimeout(() => {
      setShouldHideHeader(isScrolledDown && isMinimumScrolled);
    }, TIMEOUT_DELAY);
  });
  return (
    <div style={{ scrollBehavior: 'smooth' }}>
      {innerWindowWidth > maxMobileWidth ? (
        <div className={classes.buttonWrap}>
          <CreateTokenButton />
        </div>
      ) : (
        <div style={{ marginTop: 20 }} />
      )}
      {isLoading ? (
        <Loader text="Help is being loaded" />
      ) : (
        <div className={classes.contentWrapper}>
          <Title className={classes.list__title}>{sectionAddress}</Title>
          {innerWindowWidth > maxMobileWidth ? (
            <>
              <div className={classes.contentWrap}>
                <div className={classes.listWrap}>
                  <div className={classes.list}>
                    {entries?.map((entry: any) => {
                      return (
                        <div
                          key={entry.sys.id}
                          className={cn(classes.list__item, {
                            [classes['list__item-active']!]: currentEntryId === entry.sys.id,
                          })}
                          onClick={() => handleTitleClick(entry.sys.id, entry.fields.subsection)}>
                          {entry.fields.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={classes.content}>
                  <RichText richText={currentEntry?.fields.content} overrides={overrides} />
                </div>
              </div>
            </>
          ) : (
            <Collapse
              defaultActiveKey={['1']}
              activeKey={collapseKey}
              onChange={(key) => {
                if (key.length > 1) {
                  setCollapseKey(key[key.length - 1]);
                } else {
                  setCollapseKey(key[0]);
                }
                window.scrollTo({ top: 50, behavior: 'smooth' });
              }}>
              {/*TODO: Fix types*/}
              {entries.map((entry: any, index: any) => (
                <>
                  <Panel
                    className={
                      shouldHideHeader ? classes.mobileHeaderToTop : classes.mobileHeaderUnder
                    }
                    key={index}
                    header={
                      <div
                        key={entry.sys.id}
                        className={cn(classes.list__item, {
                          [classes['list__item-active']!]: currentEntryId === entry.sys.id,
                        })}>
                        {entry.fields.title}
                      </div>
                    }>
                    <div className={classes.content}>
                      <RichText richText={entry?.fields.content} overrides={overrides} />
                    </div>
                  </Panel>
                </>
              ))}
            </Collapse>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentfulSectionAddress;
