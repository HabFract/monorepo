import React from 'react';

const PageHeader = ({ title }) => (
  <div className="page-header bg-primary h-12 text-off-white rounded-xl rounded-b-0 my-2">
    <h1 className="text-3xl">{title}</h1>
  </div>
);

export default PageHeader;
