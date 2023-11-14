import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { SortDescendingOutlined, SortAscendingOutlined, FilterOutlined } from '@ant-design/icons';
import { Modal, Radio } from 'flowbite-react';
import './common.css';
import { useAtom } from 'jotai';
import { SortCriteria, SortOrder, listSortFilterAtom } from '../../state/listSortFilterAtom';

const ListSortFilter = ({label} : {label: string}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const [listSortFilter, setListSortFilter] = useAtom(listSortFilterAtom)

  const toggleSortOrder = () => {
    setListSortFilter(listSortFilter.sortOrder === SortOrder.GreatestToLowest ? SortOrder.LowestToGreatest : SortOrder.GreatestToLowest);
  };

  return (
    <div className="list-sort-filter">
      <div className="sort-icon-container text-dark-gray flex justify-end">
        {!!label && <span className="sort-filter-label">{label}</span>}
        <div className="flex gap-2 text-2xl">
          <FilterOutlined className="sort-filter-icon" onClick={toggleModal} />
          {listSortFilter.sortOrder === SortOrder.GreatestToLowest ? (
            <SortDescendingOutlined className="sort-filter-icon" onClick={toggleSortOrder} />
          ) : (
            <SortAscendingOutlined className="sort-filter-icon" onClick={toggleSortOrder} />
          )}
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
                sortCriteria: SortCriteria.Name,
                sortOrder: SortOrder.GreatestToLowest,
              }}
              onSubmit={(values) => {
                console.log('values :>> ', values);
                // setSortCriteria(SortCriteria[values.sortCriteria as keyof typeof SortCriteria]);
                // setListSortFilter(SortOrder[values.sortOrder as keyof typeof SortOrder]);
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
                          <Field type="radio" name="sortCriteria" value={SortCriteria.Name} as={Radio} />
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
