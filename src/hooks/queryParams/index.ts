import { useRouter } from 'next/router';

const useQueryParams = () => {
  const router = useRouter();

  const getQueryParam = (name: string) => router.query[name];

  const changeQueryParam = (key?: FilterKey, value?: string | number) => {
    if (!key && !value) return;
    if (!key) return;

    const obj = Object.assign(router.query, { [key]: value });

    Object.keys(obj).forEach((key) => !obj[key] && delete obj[key]);

    router.push({ pathname: router.route, query: obj }, undefined, { shallow: true });
  };

  return { changeQueryParam, getQueryParam };
};

export default useQueryParams;

export type FilterKey = 'time' | 'page' | 'limit' | 'filtertype' | 'type' | 'search';
