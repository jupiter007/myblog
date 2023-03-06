import React, { useEffect } from 'react';
import classNames from 'classnames';

function Container(props) {
  const containerClasses = classNames('container py-md-5', {
    'container--narrow': !props.wide,
  });
  return <div className={containerClasses}>{props.children}</div>;
}

export default Container;
