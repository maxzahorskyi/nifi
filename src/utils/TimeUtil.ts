import { format, formatDuration } from 'date-fns';

class TimeUtil {
  public static isInThePast(timestamp: number) {
    return timestamp * 1000 < Date.now();
  }

  public static getTimeLeft(timestamp: number | undefined, from?: number) {
    if (!timestamp) {
      return undefined;
    }

    let timeLeft = timestamp * 1000 - (from ? from * 1000 : Date.now());

    if (timeLeft <= 0) {
      return undefined;
    }

    const days = Math.floor(timeLeft / 1000 / 3600 / 24);
    timeLeft -= days * 24 * 3600 * 1000;

    const hours = Math.floor(timeLeft / 1000 / 3600);
    timeLeft -= hours * 3600 * 1000;

    const minutes = Math.floor(timeLeft / 1000 / 60);
    timeLeft -= minutes * 60 * 1000;

    const seconds = Math.floor(timeLeft / 1000);

    return formatDuration({
      days,
      hours,
      minutes,
      seconds,
    })
      .split(' ')
      .map((word, i, words) => {
        let result = word;

        if (i % 2 !== 0) {
          const firstLetter = word.slice(0, 1);
          result = i !== words.length - 1 ? `${firstLetter} ` : firstLetter;
        }

        return result;
      })
      .join('');
  }
  public static getTimeLeftMobile(timestamp: number | undefined, from?: number) {
    if (!timestamp) {
      return undefined;
    }

    let timeLeft = timestamp * 1000 - (from ? from * 1000 : Date.now());

    if (timeLeft <= 0) {
      return undefined;
    }

    const days = Math.floor(timeLeft / 1000 / 3600 / 24);
    timeLeft -= days * 24 * 3600 * 1000;

    const hours = Math.floor(timeLeft / 1000 / 3600);
    timeLeft -= hours * 3600 * 1000;

    const minutes = Math.floor(timeLeft / 1000 / 60);
    timeLeft -= minutes * 60 * 1000;

    return formatDuration({
      days,
      hours,
      minutes,
    })
      .split(' ')
      .map((word, i, words) => {
        let result = word;

        if (i % 2 !== 0) {
          const firstLetter = word.slice(0, 1);
          result = i !== words.length - 1 ? `${firstLetter} ` : firstLetter;
        }

        return result;
      })
      .join('');
  }
  public static convertTimestampToSeconds(timestamp: number) {
    return Math.floor(timestamp / 1000);
  }

  public static convertSecondsToTimestamp(timestamp: number) {
    return Math.floor(timestamp * 1000);
  }
}

export default TimeUtil;
