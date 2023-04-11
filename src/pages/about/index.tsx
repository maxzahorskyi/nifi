import dynamic from 'next/dynamic';
import React from 'react';

const AboutPage = dynamic(() => import('../../features/About/pages/AboutPage'), {
  ssr: false,
});

export default AboutPage;
