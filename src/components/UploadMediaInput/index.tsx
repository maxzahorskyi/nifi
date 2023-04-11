import React, { useEffect, useState } from 'react';
import classes from '../../features/Token/pages/TokenPageCreate/index.module.scss';
import { useQuery } from 'react-query';
import axios from 'axios';
import useMediaHandler from '../../hooks/media';
import FileInput from '../FileInput';

const UploadMediaInput = ({
  setFieldValue,
  values,
  layer,
  setLayerValue,
  type = 'text',
}: Props) => {
  const { onMediaUpload, onMediaUploadStamp } = useMediaHandler({ layerValue: 0 });
  const [mediaSupported, setMediaSupported] = useState<string | undefined>(undefined);

  const { data } = useQuery('mediaFormatSupported', () => {
    return axios('https://dev.nifi.club/api/media/supported');
  });
  useEffect(() => {
    if (data) {
      setMediaSupported(data?.data?.data.toString());
    }
  }, [data]);
  return (
    <FileInput
      wrapProps={{
        className: classes.form__fileInput,
      }}
      fileInputProps={{
        onChange: (e) => {
          layer
            ? onMediaUploadStamp(e, values, setFieldValue, layer)
            : onMediaUpload(e, values, setFieldValue);
        },
        onClick: () => {
          if (setLayerValue && layer) {
            setLayerValue(layer);
          }
        },
        multiple: true,
        accept: mediaSupported,
      }}
      type={type}
      isTokenPageCreate
    />
  );
};

interface Props {
  values: any;
  required: boolean;
  setFieldValue: (v: any, d: any) => void;
  layer?: number;
  setLayerValue?: (v: number) => void;
  type?: 'text' | 'circle';
}

export default UploadMediaInput;
