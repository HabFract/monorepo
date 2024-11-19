import React, { useState, useRef } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import {
  SortDescendingOutlined,
  SortAscendingOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Radio } from "flowbite-react";
import "./common.css";
import { SortCriteria, SortOrder, listSortFilterAtom } from "../../state/ui";
import { store } from "../../state/store";
import { RadioGroupField, Modal, Button } from "habit-fract-design-system";
import { useAtomValue } from "jotai";

const ListSortFilter = ({ label }: { label: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formikRef = useRef<FormikProps<{ sortCriteria: SortCriteria }>>(null);
  const listSortFilter = useAtomValue(listSortFilterAtom);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const toggleSortOrder = () => {
    store.set(listSortFilterAtom, {
      ...listSortFilter,
      sortOrder:
        listSortFilter.sortOrder === SortOrder.GreatestToLowest
          ? SortOrder.LowestToGreatest
          : SortOrder.GreatestToLowest,
    });
  };

  const handleSubmit = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit();
    }
  };

  return (
    <div className="list-sort-filter">
      <div className="sort-icon-container flex justify-end text-gray-500">
        {!!label && <span className="sort-filter-label">{label}</span>}
        <div className="flex gap-2 text-2xl">
          <FilterOutlined className="sort-filter-icon" onClick={toggleModal} />
          {listSortFilter.sortOrder === SortOrder.GreatestToLowest ? (
            <SortDescendingOutlined
              className="sort-filter-icon"
              onClick={toggleSortOrder}
            />
          ) : (
            <SortAscendingOutlined
              className="sort-filter-icon"
              onClick={toggleSortOrder}
            />
          )}
        </div>
      </div>
      {isModalOpen && (
        <Modal
          title="Sort Criteria"
          isModalOpen={isModalOpen}
          onClose={toggleModal}
          size="lg"
          footerElement={
              <Button
                type="button"
                variant={"primary responsive"}
                onClick={handleSubmit}
              >
                Set Criteria
              </Button>
          }
        >
          <Formik
            innerRef={formikRef}
            initialValues={listSortFilter}
            onSubmit={(values) => {
              store.set(listSortFilterAtom, {
                ...listSortFilter,
                sortCriteria:  (values.sortCriteria == 'Scale' as any ? SortCriteria.Scale : SortCriteria.Name),
              });
              toggleModal();
            }}
          >
            {({ values }) => (
              <Form>
                <Field
                  name="sortCriteria"
                  component={RadioGroupField}
                  id="sort-criteria"
                  labelValue="Sort by:"
                  options={["Name", "Scale"]}
                  direction="vertical"
                />
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </div>
  );
};

export default ListSortFilter;