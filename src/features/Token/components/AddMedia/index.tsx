import React from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import cn from 'classnames';
import UploadMediaInput from '../../../../components/UploadMediaInput';

const AddMedia = ({ setFieldValue, values }: Props) => {
  return (
    <Properties
      className={cn(
        classes.propertiesCreate,
        classes.propertiesCreate_stamp,
        classes.standardMarginDesktop,
        classes.addMediaCategory,
      )}
      items={[
        {
          name: 'Add media',
          value: (
            <UploadMediaInput
              required
              values={values}
              setFieldValue={setFieldValue}
              type="circle"
            />
          ),
          required: true,
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
}

export default AddMedia;
