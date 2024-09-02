import React from 'react';
import '../style.css';

type PageHeaderProps = {
  title: string;
};

const PageHeader : React.FC<PageHeaderProps> = ({ title }) => (
  <div role="heading" className="page-header">
    <h1>{title}</h1>
  </div>
);

export default PageHeader;
