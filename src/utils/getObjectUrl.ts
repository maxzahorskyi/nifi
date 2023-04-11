const getObjectUrl = (file: File | null) => {
  if (!file) {
    return undefined;
  }
  return URL.createObjectURL(file);
};

export default getObjectUrl;
