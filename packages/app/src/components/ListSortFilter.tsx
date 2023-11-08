import React from 'react';
import { SortDescendingOutlined, SortAscendingOutlined } from '@ant-design/icons'; // Assuming you have an SVG for the sort icon

const ListSortFilter = () => (
  <div className="list-sort-filter">
    <div className="sort-icon-container">
      <SortDescendingOutlined />
    </div>
  </div>
);

export default ListSortFilter;
