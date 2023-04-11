const convertBytesToMegabytes = (bytes: number | undefined = 0, isMegabyte?: boolean) => {
  if (isMegabyte) {
    return bytes / 1024 / 1024;
  }

  return bytes / 1000 / 1000;
};

export default convertBytesToMegabytes;
