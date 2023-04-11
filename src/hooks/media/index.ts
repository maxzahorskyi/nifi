import getMediaResolution from '../../utils/getMediaResolution';
import { FormValues, SetFieldValue, FormMedia } from '../../types/Tokens/Token';
import { ChangeEvent } from 'react';
import { message } from 'antd';

const useMediaHandler = ({ layerValue }: { layerValue: number }) => {
  const createFormMedia = async (file: File) => {
    const { width, height } = await getMediaResolution(file);

    return {
      file,
      subtitle: '',
      width,
      height,
      role: '',
    };
  };

  const createFormMediaStamp = async (file: File, role: string) => {
    const { width, height } = await getMediaResolution(file);
    return { file, subtitle: '', width, height, role };
  };

  const onMediaUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    values: FormValues,
    setFieldValue: SetFieldValue,
  ) => {
    const media = Array.from(e.target.files ?? []);

    if (media.length !== (e.target.files?.length ?? 0)) {
      message.warn('Some files have been removed since they have incorrect type', 5);
    }
    const formMedia = await Promise.all(Array.from(media ?? []).map(createFormMedia));
    setFieldValue('media', values.media?.concat(formMedia));
  };

  const onMediaReload = async (
    media: File | undefined,
    index: number,
    values: FormValues,
    setFieldValue: SetFieldValue,
  ) => {
    if (!media) return;
    const formMedia = await createFormMedia(media);
    if (media.type.includes('image')) {
      setFieldValue(
        'media',
        values.media
          ?.slice(0, index)
          .concat({ ...formMedia, role: '' }, values.media.slice(index + 1)),
      );
    }
  };

  const onMediaReloadStamp = async (
    media: File | undefined,
    index: number,
    values: FormValues,
    setFieldValue: SetFieldValue,
    field: keyof FormValues,
  ) => {
    if (!media) return;
    const formMedia = await createFormMediaStamp(media, layerValue === 2 ? 'frame' : 'image');
    if (media.type.includes('image')) {
      setFieldValue(
        field,
        (values[field] as FormMedia[])
          .slice(0, index)
          .concat(formMedia, (values[field] as FormMedia[]).slice(index + 1)),
      );
    }
  };

  const onMediaUploadStamp = async (
    e: ChangeEvent<HTMLInputElement>,
    values: FormValues,
    setFieldValue: SetFieldValue,
    layer: number,
  ) => {
    const images = Array.from(e.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );
    if (images.length !== (e.target.files?.length ?? 0)) {
      message.warn('Some files have been removed since they have incorrect type', 5);
    }

    const formImages = await Promise.all(
      Array.from(images ?? []).map((file) =>
        createFormMediaStamp(file, layer === 2 ? 'frame' : 'image'),
      ),
    );
    if (
      ((!values.format || values.format === '0 x 0 px') &&
        ((values.media?.length &&
          values?.media?.[0]?.height !== formImages[0]?.height &&
          values.media?.[0]?.width !== formImages[0]?.width) ||
          (values.frame?.length &&
            values?.frame?.[0]?.height !== formImages[0]?.height &&
            values.frame?.[0]?.width !== formImages[0]?.width))) ||
      (values.format === '2000 x 2000 px' &&
        formImages[0]?.width !== 2000 &&
        formImages[0]?.height !== 2000) ||
      (values.format === '3000 x 2000 px' &&
        formImages[0]?.width !== 3000 &&
        formImages[0]?.height !== 2000)
    ) {
      return message.warn('Some files have been removed since they have incorrect size', 5);
    }

    if (layer === 1 && values.media?.length === 0) {
      setFieldValue(
        'media' as keyof FormValues,
        (values['media' as keyof FormValues] as FormMedia[]).concat(formImages),
      );
    }

    if (layer === 1 && values.media?.length === 1) {
      return message.warn('Only one picture', 5);
    }

    if (layer === 2 && (!values?.frame?.length || values?.frame?.length < 1)) {
      setFieldValue(
        'frame' as keyof FormValues,
        (values['frame' as keyof FormValues] as FormMedia[]).concat(formImages),
      );
    }

    if (layer === 2 && values.frame?.length === 1) {
      return message.warn('Only one picture', 5);
    }
  };

  return {
    createFormMedia,
    createFormMediaStamp,
    onMediaReload,
    onMediaReloadStamp,
    onMediaUploadStamp,
    onMediaUpload,
  };
};

export default useMediaHandler;
