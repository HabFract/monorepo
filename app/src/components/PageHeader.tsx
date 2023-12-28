import React from 'react';
import './style.css';

type PageHeaderProps = {
  title: string;
};

const PageHeader : React.FC<PageHeaderProps> = ({ title }) => (
  <div className="page-header">
    <h1 className="text-3xl">{title}</h1>
  </div>
);

export default PageHeader;
