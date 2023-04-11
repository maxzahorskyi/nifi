import { useState, useEffect } from 'react';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  const maxMobileWidth = 1024;
  const isDesktopWidth = width >= maxMobileWidth;
  return {
    width,
    height,
    maxMobileWidth,
    isDesktopWidth,
  };
}

export default function useWindowDimensions(): {
  height: number;
  width: number;
  maxMobileWidth: number;
  isDesktopWidth: boolean;
} {
  const [windowDimensions, setWindowDimensions] = useState({
    height: 0,
    width: 0,
    maxMobileWidth: 0,
    isDesktopWidth: false,
  });

  useEffect(() => {
    setWindowDimensions(getWindowDimensions());
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
