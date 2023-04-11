import React from 'react';
import Properties from '../../../../components/Properties';
import classes from '../../pages/TokenPageCreate/index.module.scss';
import { Slider } from 'antd';
import cn from 'classnames';
import { TokenType } from '../../TokenService';
import FormInput from '../../../../components/FormInput';
import FormTextArea from '../../../../components/FormTextArea';
import { useTranslation } from 'react-i18next';

const TokenCreateForm = ({ setFieldValue, values }: Props) => {
  const { t } = useTranslation();

  return (
    <Properties
      className={cn(classes.propertiesCreate, classes.padding)}
      style={{ gridRowGap: 20 }}
      items={[
        {
          name: t('TokenCreationPage.Title'),
          value: (
            <FormInput
              required
              name="title"
              maxLength={128}
              minLength={2}
              bordered={false}
              placeholder="Type title here"
              wrapClassName={classes.formControlWrap}
              className={classes.formControl}
              valueTextAlign="start"
            />
          ),
          required: true,
        },

        {
          name: t('TokenCreationPage.NumberOfEditions'),
          value: (
            <FormInput
              disabled={values.type !== TokenType.Art2}
              required={values.type === TokenType.Art2}
              name="numberOfEditions"
              type="number"
              min={0}
              bordered={false}
              placeholder={values.type === TokenType.Art2 ? '10' : '1'}
              wrapClassName={classes.formControlWrap}
              className={cn(classes.formControl, classes.numberOfEdition)}
            />
          ),
          disabled: values.type !== TokenType.Art2,
        },
        {
          name: t('TokenCreationPage.CreatorsLifetimeFee'),
          value: (
            <div className={classes.slider}>
              <span className={classes.slider__value}>{values.fee}%</span>
              <Slider
                style={{
                  width: '100%',
                }}
                min={0}
                max={24}
                onChange={(value: number) => setFieldValue('fee', value)}
                tooltipVisible={false}
              />
            </div>
          ),
          required: false,
        },
        {
          name: (
            <span style={{ alignSelf: 'flex-start' }}>{t('TokenCreationPage.Description')}</span>
          ),
          value: (
            <FormTextArea
              name="description"
              maxLength={512}
              bordered={false}
              placeholder="Type description here"
              autoSize={{
                minRows: 1,
                maxRows: 10,
              }}
              wrapClassName={classes.formControlWrap}
              className={classes.formControl}
            />
          ),
          required: false,
        },
        {
          name: t('TokenCreationPage.Details'),
          value: `• ${
            values.media.length || values.frame.length
              ? values.media.length + values.frame.length
              : 0
          }-piece artefact`,
          disabled: true,
        },
      ]}
      renderItemLabel={(item) => item.name}
      renderItemValue={(item) => item.value}
      labelProps={{
        className: classes.createLabelWidth,
      }}
      resolveIsHighlighted={(item) => item.required}
      resolveIsGreyColor={(item) => item.disabled}
    />
  );
};

interface Props {
  values: any;
  setFieldValue: (v: any, d: any) => void;
}

export default TokenCreateForm;
