import React from 'react';
import { SortDescendingOutlined, SortAscendingOutlined } from '@ant-design/icons'; // Assuming you have an SVG for the sort icon
import './list.css';

const ListSortFilter = () => (
  <div className="list-sort-filter bg-off-white rounded-xl">
    <div className="sort-icon-container flex justify-end">
      <SortDescendingOutlined />
    </div>
  </div>
);

export default ListSortFilter;
