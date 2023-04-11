import React, { useEffect } from 'react';
import Head from 'next/head';
import getMediaUrl from '../../../../utils/getMediaUrl';
import { useRouter } from 'next/router';
import getConfig from 'next/config';

const MetaTags = ({ title, description, image, media, imageHash }: Props) => {
  const router = useRouter();
  const config = getConfig().publicRuntimeConfig;
  const { domain } = config.services;

  let imageObject;
  let subtitle;

  if (media?.length) {
    imageObject = media.find((item: any) => item?.role === 'preview') || media[0];
    subtitle = imageObject?.subtitle;
    if (imageObject?.mimetype.includes('mp4')) {
      imageHash = `${imageObject?.hash}/preview`;
    } else {
      imageHash = imageObject?.hash;
    }
  }
  const url = imageHash ? getMediaUrl(imageHash, 'image') : '';
  const meta = {
    title: title || '',
    description: description || '',
    image: image || url || '',
  };

  return (
    <Head>
      <meta charSet="UTF-8" />
      <meta lang="en" />

      <meta property="og:site_name" content="NiFi Club" />
      <meta property="og:type" content="website" />

      <title>{title}</title>
      <meta name="description" content={meta.description} key="description" />
      <meta name="keywords" content="NiFi, tokens, website, blockchain, cryptocurrency, market" />

      <meta property="og:title" content={meta.title} key="og:title" />
      <meta
        property="og:url"
        content={`https://${domain}${router.asPath.split('?')[0]}`}
        key="og:url"
      />
      <meta property="og:description" content={meta.description} key="og:description" />
      <meta
        property="og:image"
        itemProp="image primaryImageOfPage"
        content={meta.image}
        key="og:image"
      />

      {imageObject?.width && (
        <meta property="og:image:width" content={imageObject.width} key="og:image:width" />
      )}
      {imageObject?.height && (
        <meta property="og:image:height" content={imageObject.height} key="og:image:height" />
      )}

      <meta property="twitter:image" content={meta.image} key="twitter:image" />
      <meta property="twitter:site" content="@NiFi" key="twitter:site" />
      <meta property="twitter:title" content={meta.title} key="twitter:title" />
      <meta property="twitter:description" content={meta.description} key="twitter:description" />
      <meta property="twitter:card" content="summary_large_image" key="twitter:card" />
    </Head>
  );
};

export default MetaTags;

interface Props {
  title?: string;
  description?: string;
  image?: string;
  media?: any;
  imageHash?: string;
}
