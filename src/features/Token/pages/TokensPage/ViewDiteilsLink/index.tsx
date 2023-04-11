import React from 'react';
import classes from '../Card/index.module.scss';
import LinkList from '../../../../../components/LinkList';

const ViewDetailsLink = () => {
  return (
    <LinkList
      items={[{ title: 'View details' }]}
      getItemTitle={(i) => i.title}
      getIsActive={() => true}
      className={classes.linkList}
    />
  );
};

ViewDetailsLink.propTypes = {};

export default ViewDetailsLink;
