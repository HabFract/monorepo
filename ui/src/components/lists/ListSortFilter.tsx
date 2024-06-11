import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { SortDescendingOutlined, SortAscendingOutlined, FilterOutlined } from '@ant-design/icons';
import { Modal, Radio } from 'flowbite-react';
import './common.css';
import { SortCriteria, SortOrder, listSortFilterAtom } from '../../state/listSortFilterAtom';
import { store } from '../../state/jotaiKeyValueStore';

const ListSortFilter = ({label} : {label: string}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const listSortFilter = store.get(listSortFilterAtom)

  const toggleSortOrder = () => {
    store.set(listSortFilterAtom, {
      ...listSortFilter,
      sortOrder: listSortFilter.sortOrder === SortOrder.GreatestToLowest ? SortOrder.LowestToGreatest : SortOrder.GreatestToLowest
    });
  };

  return (
    <div className="list-sort-filter">
      <div className="sort-icon-container text-gray-500 flex justify-end">
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
              }}
              onSubmit={(_values) => {
                toggleModal();
              }}
            >
              {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-xl">Sort by:</label>
                      <div className="flex flex-col">
                        <label className='text-xl lowercase capitalize'>
                          <Field className="text-primary m-2 p-2" onChange={(e: any) => store.set(listSortFilterAtom, {...listSortFilter, sortCriteria: e.currentTarget.value})} checked={listSortFilter.sortCriteria==SortCriteria.Name} type="radio" name="sortCriteria" value={SortCriteria.Name} as={Radio} />
                          Name
                        </label>
                        <label className='text-xl lowercase capitalize'>
                          <Field className="text-primary m-2 p-2" onChange={(e: any) => store.set(listSortFilterAtom, {...listSortFilter, sortCriteria: e.currentTarget.value})} checked={listSortFilter.sortCriteria==SortCriteria.Scale} type="radio" name="sortCriteria" value={SortCriteria.Scale} as={Radio} />
                          Scale
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary">
                      Ok
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
