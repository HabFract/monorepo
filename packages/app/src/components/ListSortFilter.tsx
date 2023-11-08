import React from 'react';
import { ReactComponent as SortIcon } from '../assets/sort-icon.svg'; // Assuming you have an SVG for the sort icon

const ListSortFilter = () => (
  <div className="list-sort-filter">
    <div className="sort-icon-container">
      <SortIcon />
    </div>
  </div>
);

export default ListSortFilter;
