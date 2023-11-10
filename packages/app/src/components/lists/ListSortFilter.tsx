import React, { useState } from 'react';
import { SortDescendingOutlined, FilterOutlined } from '@ant-design/icons';
import { Modal } from 'flowbite-react';
import './common.css';

const ListSortFilter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="list-sort-filter">
      <div className="sort-icon-container flex justify-end">
        <div className="flex gap-2 text-2xl">
          <FilterOutlined className="sort-filter-icon" onClick={toggleModal} />
          <SortDescendingOutlined className="sort-filter-icon" onClick={toggleModal} />
        </div>
      </div>
      {isModalOpen && (
        <Modal show={isModalOpen} onClose={toggleModal}>
          <Modal.Header>
            Sort Criteria
          </Modal.Header>
          <Modal.Body>
            {/* Add your form or content for the sort criteria here */}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default ListSortFilter;
