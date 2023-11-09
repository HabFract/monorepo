import React from 'react';

type PageHeaderProps = {
  title: string;
};

const PageHeader : React.FC<PageHeaderProps> = ({ title }) => (
  <div className="page-header bg-primary h-12 text-off-white rounded-xl flex items-center justify-center">
    <h1 className="text-3xl">{title}</h1>
  </div>
);

export default PageHeader;
