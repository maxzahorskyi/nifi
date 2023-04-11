import React from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import cn from 'classnames';
import UploadMediaInput from '../../../../components/UploadMediaInput';

const StampAddMedia = ({ setFieldValue, values, setLayerValue }: Props) => {
  return (
    <Properties
      className={cn(
        classes.propertiesCreate,
        classes.propertiesCreate_stamp,
        classes.standardMarginDesktop,
        classes.addMediaAndFrameCategory,
      )}
      items={[
        {
          name: 'Add Media',
          value: (
            <UploadMediaInput
              values={values}
              required
              setFieldValue={setFieldValue}
              setLayerValue={setLayerValue}
              layer={1}
              type="circle"
            />
          ),
          required: true,
        },
        {
          name: 'Add Frame',
          value: (
            <UploadMediaInput
              required={false}
              values={values}
              setFieldValue={setFieldValue}
              layer={2}
              type="circle"
            />
          ),
          required: false,
        },
      ]}
      renderItemLabel={(item) => item.name}
      renderItemValue={(item) => item.value}
      labelProps={{
        className: classes.createLabelWidth,
      }}
      resolveIsHighlighted={(item) => item.required}
    />
  );
};

interface Props {
  values: any;
  setFieldValue: (v: any, d: any) => void;
  setLayerValue: (v: number) => void;
}

export default StampAddMedia;
