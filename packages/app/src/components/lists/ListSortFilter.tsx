import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { SortDescendingOutlined, FilterOutlined } from '@ant-design/icons';
import { Modal, Radio } from 'flowbite-react';
import './common.css';

const ListSortFilter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('greatestToLowest');

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
            <Formik
              initialValues={{
                sortCriteria: 'name',
                sortOrder: 'greatestToLowest',
              }}
              onSubmit={(values) => {
                setSortCriteria(values.sortCriteria);
                setSortOrder(values.sortOrder);
                toggleModal();
              }}
            >
              {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Sort by:</label>
                      <div className="flex flex-col">
                        <label>
                          <Field type="radio" name="sortCriteria" value="name" as={Radio} />
                          Name
                        </label>
                        <label>
                          <Field type="radio" name="sortCriteria" value="atomicOrbits" as={Radio} />
                          Atomic Orbits
                        </label>
                        <label>
                          <Field type="radio" name="sortCriteria" value="subatomicOrbits" as={Radio} />
                          Subatomic Orbits
                        </label>
                        <label>
                          <Field type="radio" name="sortCriteria" value="astronomicOrbits" as={Radio} />
                          Astronomic Orbits
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Sort order:</label>
                      <div className="flex flex-col">
                        <label>
                          <Field type="radio" name="sortOrder" value="greatestToLowest" as={Radio} />
                          Greatest to Lowest
                        </label>
                        <label>
                          <Field type="radio" name="sortOrder" value="lowestToGreatest" as={Radio} />
                          Lowest to Greatest
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary">
                      Apply
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default ListSortFilter;
