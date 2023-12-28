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
    setListSortFilter({
      ...listSortFilter,
      sortOrder: listSortFilter.sortOrder === SortOrder.GreatestToLowest ? SortOrder.LowestToGreatest : SortOrder.GreatestToLowest
    });
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
              }}
              onSubmit={(_values) => {
                toggleModal();
              }}
            >
              {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="space-y-4 bg-dark-gray">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Sort by:</label>
                      <div className="flex flex-col">
                        <label>
                          <Field onChange={(e: any) => setListSortFilter({...listSortFilter, sortCriteria: e.currentTarget.value})} checked={listSortFilter.sortCriteria==SortCriteria.Name} type="radio" name="sortCriteria" value={SortCriteria.Name} as={Radio} />
                          Name
                        </label>
                        <label>
                          <Field onChange={(e: any) => setListSortFilter({...listSortFilter, sortCriteria: e.currentTarget.value})} checked={listSortFilter.sortCriteria==SortCriteria.Scale} type="radio" name="sortCriteria" value={SortCriteria.Scale} as={Radio} />
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
