import React from 'react';
import { Formik, Form, FormikProps } from 'formik';
import { Modal, Button } from '..';

/**
 * A generic modal component that wraps a Formik form
 * @template T - The shape of the form values
 * @param {Object} props - Component props
 * @param {string} props.title - Modal title
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Handler for closing the modal
 * @param {T} props.initialValues - Initial form values
 * @param {(values: T) => void | Promise<void>} props.onSubmit - Form submission handler
 * @param {React.ReactNode} props.children - Form fields (typically using Formik's Field component)
 * @param {string} [props.submitButtonText='Submit'] - Text for the submit button
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Modal size
 */
interface FormModalProps<T> {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  children: React.ReactNode;
  submitButtonText?: string;
  size?: 'sm' | 'md' | 'lg';
}

function FormModal<T>({
  title,
  isOpen,
  onClose,
  initialValues,
  onSubmit,
  children,
  submitButtonText = 'Submit',
  size = 'md'
}: FormModalProps<T>) {
  const formikRef = React.useRef<FormikProps<T>>(null);

  const handleSubmit = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit();
    }
  };

  return (
    <Modal
      title={title}
      isModalOpen={isOpen}
      onClose={onClose}
      size={size}
      footerElement={
        <Button
          type="button"
          variant="primary responsive"
          onClick={handleSubmit}
        >
          {submitButtonText}
        </Button>
      }
    >
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        onSubmit={(values) => {
          onSubmit(values as any);
          onClose();
        }}
      >
        <Form>{children}</Form>
      </Formik>
    </Modal>
  );
}

export default FormModal;