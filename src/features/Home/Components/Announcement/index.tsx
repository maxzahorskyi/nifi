import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Timer, { timeFormat } from '../Timer';
import { GQLUi_management as GQLUiManagement } from '../../../../types/graphql.schema';
import getCorrectImageUrl from '../../../../utils/GetCorrectImageUrlUtil';
import { urls } from '../../../../types/pages';
import { Spin } from 'antd';
import moment from 'moment';
import { UiManagementType } from '../../../../types/UiManagementType';
import { useUiManagementData } from '../../../../hooks/new/useUiManagementData';
import Loader from '../../../../components/Loader';

const Announcement = () => {
  const { getUiManagementData } = useUiManagementData();
  const [announcements, setAnnouncement] = useState<GQLUiManagement[] | undefined>([]);

  let announcementData1: GQLUiManagement[] = getUiManagementData(UiManagementType.ANNOUNCEMENT1);
  let announcementData2: GQLUiManagement[] = getUiManagementData(UiManagementType.ANNOUNCEMENT2);
  let announcementData3: GQLUiManagement[] = getUiManagementData(UiManagementType.ANNOUNCEMENT3);

  const getTime = (autoFinish: number | undefined) => {
    return autoFinish ? new Date(autoFinish * 1000) : new Date(3);
  };

  useEffect(() => {
    const timeTillDate1 = getTime(announcementData1?.[0]?.moduleID?.autoFinish);
    const timeTillDate2 = getTime(announcementData2?.[0]?.moduleID?.autoFinish);
    const timeTillDate3 = getTime(announcementData3?.[0]?.moduleID?.autoFinish);

    const interval = setInterval(() => {
      const then1 = moment(timeTillDate1, timeFormat);
      const then2 = moment(timeTillDate2, timeFormat);
      const then3 = moment(timeTillDate3, timeFormat);

      const now = moment();

      const diff1 = moment.duration(moment(then1).diff(moment(now)));
      const diff2 = moment.duration(moment(then2).diff(moment(now)));
      const diff3 = moment.duration(moment(then3).diff(moment(now)));

      let seconds1: any = parseInt(diff1.asSeconds(), 10);
      let seconds2: any = parseInt(diff2.asSeconds(), 10);
      let seconds3: any = parseInt(diff3.asSeconds(), 10);

      if (announcementData1?.[0]?.moduleID?.autoFinish && seconds1 > 0) {
        return setAnnouncement(announcementData1);
      }
      if (announcementData2?.[0]?.moduleID?.autoFinish && seconds2 > 0) {
        return setAnnouncement(announcementData2);
      }
      if (announcementData3?.[0]?.moduleID?.autoFinish && seconds3 > 0) {
        return setAnnouncement(announcementData3);
      }
      return setAnnouncement(undefined);
    }, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [announcementData1, announcementData2, announcementData3]);

  if (!announcements) {
    return (
      <div className={classes.getPreparedContainer}>
        <Loader text="Time is being loaded" height={7} />
      </div>
    );
  }

  return (
    <>
      {announcements.map((announcement, index) => (
        <div key={index} className={classes.getPreparedContainer}>
          <div>
            <div className={classes.title}>{announcement.assetID?.assetTitle}</div>
            {announcement.moduleID?.timerVisible && (
              <Timer timeTillDate={getTime(announcement.moduleID?.autoFinish)} />
            )}
          </div>

          <img src={getCorrectImageUrl(announcement.assetID?.image)} alt="" />
          <div className={classes.notifyMeButtonContainer}>
            <Link href={urls.tokenCreate.default}>
              <a>
                <Button className={classes.notifyMeButton}>Notify me</Button>
              </a>
            </Link>
          </div>
        </div>
      ))}
    </>
  );
};

export default Announcement;
