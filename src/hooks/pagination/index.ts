import { useEffect, useState } from 'react';
import useQueryParams, { FilterKey } from '../queryParams';
import { getTime } from 'date-fns';
import { useRouter } from 'next/router';

const usePagination = ({ isExternal = false, pageParam, limitParam, defaultLimit }: Props) => {
  const router = useRouter();
  const newTime = Math.round(getTime(new Date()) / 1000);

  const { changeQueryParam, getQueryParam } = useQueryParams();

  const [time, setTime] = useState<number>(newTime);
  const [limit, setLimit] = useState<number>(defaultLimit || 10);
  const [page, setPage] = useState<number>(1);

  const changeTime = (value: number) => {
    if (isExternal) {
      changeQueryParam('time', value);
    } else {
      setTime(value);
    }
  };
  const changePage = (value: number) => {
    if (isExternal) {
      changeQueryParam('page', value);
    } else {
      setPage(value);
    }

    const t = getQueryParam('time') as string;
    if (!t) {
      changeTime(newTime);
    }
  };
  const changeLimit = (value: number) => {
    if (isExternal) {
      changeQueryParam('limit', value);
    } else {
      setLimit(value);
    }
    changePage(1);
  };

  const changeFilter = (key?: FilterKey, value?: string | number) => {
    if (isExternal) {
      changeQueryParam(key, value);
    }
    changePage(1);
  };

  useEffect(() => {
    if (isExternal) {
      setTime(Number(getQueryParam('time')) || time);
      setPage(Number(getQueryParam('page')) || page);
      setLimit(Number(getQueryParam('limit')) || limit);
    }
  }, [router]);

  return {
    time,
    changeTime: () => changeTime(newTime),

    page,
    setPage: (value: number) => changePage(value),

    limit,
    setLimit: (value: number) => changeLimit(value),

    queryObject: router.query,
    changePaginationParam: (key?: FilterKey, value?: string | number) => changeFilter(key, value),
  };
};

type Props = {
  isExternal?: boolean;
  pageParam?: string;
  limitParam?: string;
  defaultLimit?: number;
};

export default usePagination;
