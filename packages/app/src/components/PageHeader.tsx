import React from 'react';

const PageHeader = ({ title }) => (
  <div className="page-header bg-primary h-12 text-off-white rounded-xl flex items-center justify-center">
    <h1 className="text-3xl">{title}</h1>
  </div>
);

export default PageHeader;
