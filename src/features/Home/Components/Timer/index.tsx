import moment from 'moment';
import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import { Spin } from 'antd';

export const timeFormat = 'YYYY-MM-DD h:mm';

const Timer = ({ timeTillDate }: Props) => {
  const [state, setState] = useState({
    days: undefined,
    hours: undefined,
    minutes: undefined,
    seconds: undefined,
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const then = moment(timeTillDate, timeFormat);
      const now = moment();
      const diff = moment.duration(moment(then).diff(moment(now)));

      let days: any = parseInt(diff.asDays(), 10);
      let hours: any = parseInt(diff.asHours(), 10);
      hours -= days * 24;
      let minutes: any = parseInt(diff.asMinutes(), 10);
      minutes -= days * 24 * 60 + hours * 60;
      let seconds: any = parseInt(diff.asSeconds(), 10);
      seconds -= days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;

      if (hours.toString().length <= 1) {
        hours = `0${hours}`;
      }
      if (minutes.toString().length <= 1) {
        minutes = `0${minutes}`;
      }
      if (seconds.toString().length <= 1) {
        seconds = `0${seconds}`;
      }

      setState({ days, hours, minutes, seconds });
    }, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeTillDate]);

  return (
    <>
      <div className={classes.days}>{state?.days} days</div>
      <div className={classes.time}>
        <span>
          {state?.hours}:{state.minutes}:{state.seconds}
        </span>
      </div>
    </>
  );
};

interface Props {
  timeTillDate?: Date;
}

export default Timer;
