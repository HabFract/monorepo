import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAddOrbitMutation } from '../../graphql/mocks/generated';
import { Button, TextInput, Label } from 'flowbite-react';

// Define the validation schema using Yup
const OrbitValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  hashtag: Yup.string(),
});

const CreateOrbit = () => {
  const [addOrbit] = useAddOrbitMutation();

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Create Orbit</h2>
      <Formik
        initialValues={{
          name: '',
          description: '',
          hashtag: '',
        }}
        validationSchema={OrbitValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await addOrbit({ variables: { name: values.name, metadata: { description: values.description, hashtag: values.hashtag } } });
            setSubmitting(false);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <Label>
              <span>Name:</span>
              <Field as={TextInput} type="text" name="name" required />
            </Label>
            {errors.name && touched.name ? <div>{errors.name}</div> : null}

            <Label>
              <span>Description:</span>
              <Field as={TextInput} type="text" name="description" />
            </Label>
            {errors.description && touched.description ? <div>{errors.description}</div> : null}

            <Label>
              <span>Hashtag:</span>
              <Field as={TextInput} type="text" name="hashtag" />
            </Label>
            {errors.hashtag && touched.hashtag ? <div>{errors.hashtag}</div> : null}

            <Button type="submit" variant="primary" className="mt-4">Create Orbit</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateOrbit;
