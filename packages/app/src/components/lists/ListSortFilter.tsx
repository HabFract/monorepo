import React from 'react';
import { SortDescendingOutlined, SortAscendingOutlined, FilterOutlined } from '@ant-design/icons'; // Assuming you have an SVG for the sort icon
import './common.css';

const ListSortFilter = () => (
  <div className="list-sort-filter">
    <div className="sort-icon-container flex justify-end">
      <div className="flex gap-2 text-2xl">
        <FilterOutlined className="sort-filter-icon" />
        <SortDescendingOutlined className="sort-filter-icon" />
      </div>
    </div>
  </div>
);

export default ListSortFilter;
