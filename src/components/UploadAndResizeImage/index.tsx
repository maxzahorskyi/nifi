import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import classes from './index.module.scss';
import { useDebounceEffect } from './useDebounceEffect';
import { canvasPreview } from './canvasPreview';
import { Slider } from 'antd';
import Button from '../Button';
import ModalForm from '../Modal';

const UploadAndResizeImageModal = ({
  visible,
  onCancel,
  src,
  resizedImage,
  closeModal,
  aspect = 1,
  photoType,
}: IUploadProps) => {
  if (!src) return <></>;

  const [imgSrc, setImgSrc] = useState(URL.createObjectURL(src));

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageHeight, setImageHeight] = useState(0);

  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setImageHeight(e.currentTarget.height);
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, photoType === 'wallpaper' ? 4.45333 : aspect));

      const x = document.getElementsByClassName('ReactCrop__crop-selection');
      x.length && console.log(x[0]);
    }
  }

  const onClickSave = () => {
    previewCanvasRef?.current?.toBlob((blob) => {
      if (blob) {
        resizedImage(new File([blob], src?.name, { type: src?.type }));
      }
      closeModal();
    });
  };

  useEffect(() => {
    setImgSrc(URL.createObjectURL(src));

    setScale(1);
    setRotate(0);

    setCrop(undefined);
  }, [src]);

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        await canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
      }
    },
    100,
    [completedCrop, scale, rotate],
  );
  return (
    <ModalForm title="Crop image" visible={visible} onCancel={onCancel}>
      <div className={classes.Wrapper}>
        <div className={classes.ImageWrapper} style={{ height: imageHeight }}>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={photoType === 'wallpaper' ? 4.45333 : aspect}>
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
              onLoad={onImageLoad}
              className={classes.Image}
            />
          </ReactCrop>
        </div>

        <div className={classes.ControlsWrapper}>
          <div className={classes.CanvasWrapper}>
            <span className={classes.Text}>Image Preview</span>
            <canvas
              ref={previewCanvasRef}
              className={classes.Canvas}
              style={{
                objectFit: 'contain',
                width: completedCrop?.width,
                height: completedCrop?.height,
                borderRadius: photoType === 'avatar' ? '50%' : '4px',
                aspectRatio: `${photoType === 'wallpaper' ? 4.45333 : aspect}`,
              }}
            />
          </div>

          <div className={classes.CropControls}>
            <div>
              <span className={classes.Text}>
                Scale: <span>{Math.round(scale * 100 - 100)}%</span>
              </span>
              <Slider
                step={0.01}
                max={2}
                min={1}
                value={scale}
                disabled={!imgSrc}
                onChange={(value) => setScale(value)}
                tooltipVisible={false}
              />
            </div>
            <div>
              <span className={classes.Text}>
                Rotate: <span>{rotate}°</span>
              </span>
              <Slider
                step={5}
                max={180}
                min={-180}
                value={rotate}
                disabled={!imgSrc}
                onChange={(value) => setRotate(Math.min(180, Math.max(-180, value)))}
              />
            </div>
          </div>
        </div>

        <div />

        <Button onClick={onClickSave} className={classes.Button}>
          Save
        </Button>
      </div>
    </ModalForm>
  );
};

export default UploadAndResizeImageModal;

interface IUploadProps {
  visible: boolean;
  onCancel: () => void;
  src: File | null;
  resizedImage: (blob: Blob) => void;
  closeModal: () => void;
  aspect?: number;
  photoType?: string;
}
