const getCorrectImageUrl = (url: string | undefined) => {
  return url ? url.substring(url.indexOf('(') + 1).slice(0, -1) : '/';
};

export default getCorrectImageUrl;
