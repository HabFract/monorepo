import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { Button, TextInput, Label } from 'flowbite-react';
import { Frequency, Scale, useCreateOrbitMutation } from '../../graphql/generated';

// Define the validation schema using Yup
const OrbitValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  hashtag: Yup.string(),
});

const CreateOrbit: React.FC = () => {
  const [addOrbit] = useCreateOrbitMutation();

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Create Orbit</h2>
      <Formik
        initialValues={{
          name: '',
          description: '',
          startTime: '',
          endTime: '',
          frequency: Frequency.Day,
          scale: Scale.Astro,
        }}
        validationSchema={OrbitValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await addOrbit({ variables: { variables: { ...values, sphereEntryHashB64: '' } } });
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
              <span>Start Time:</span>
              <Field as={TextInput} type="text" name="hashtag" />
            </Label>
            {errors.startTime && touched.startTime ? <div>{errors.startTime}</div> : null}

            <Label>
              <span>End Time:</span>
              <Field as={TextInput} type="text" name="hashtag" />
            </Label>
            {errors.endTime && touched.endTime ? <div>{errors.endTime}</div> : null}

            <Label>
              <span>Frequency:</span>
              <Field as={TextInput} type="text" name="hashtag" />
            </Label>
            {errors.frequency && touched.frequency ? <div>{errors.frequency}</div> : null}

            <Label>
              <span>Scale:</span>
              <Field as={TextInput} type="text" name="hashtag" />
            </Label>
            {errors.scale && touched.scale ? <div>{errors.scale}</div> : null}

            <Button type="submit" className="mt-4">Create Orbit</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateOrbit;
