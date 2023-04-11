import React from 'react';
import { BLOCKS } from '@contentful/rich-text-types';
import classes from '../../features/Help/pages/HelpPage/index.module.scss';

const OverrideComponent = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export default OverrideComponent;

export const H6 = ({ children, ...props }: any) => <h6 {...props}>{children}</h6>;

export const overrides = {
  [BLOCKS.HEADING_5]: {
    component: OverrideComponent,
    props: {
      className: classes.heading5,
    },
  },
  [BLOCKS.PARAGRAPH]: {
    component: OverrideComponent,
    props: {
      className: classes.paragraph,
    },
  },
  [BLOCKS.EMBEDDED_ASSET]: {
    image: {
      component: (props: any) => {
        // eslint-disable-next-line react/destructuring-assignment
        const url = props?.fields?.file?.url;
        return (
          <img
            key={url}
            src={url}
            className={classes.contentfulImage}
            style={{ margin: '30px 0' }}
          />
        );
      },
      props: {
        id: 'test',
      },
    },
  },
  [BLOCKS.HEADING_6]: {
    component: H6,
    props: {
      className: classes.heading6,
    },
  },
};
