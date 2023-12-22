import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, TextInput, Label } from 'flowbite-react';
import { useCreateSphereMutation } from '../../graphql/generated';

// Define the validation schema using Yup
const SphereValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  hashtag: Yup.string(),
});

const CreateSphere: React.FC = () => {
  const [addSphere] = useCreateSphereMutation();

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Create Sphere</h2>
      <Formik
        initialValues={{
          name: '',
          description: '',
          hashtag: '',
        }}
        validationSchema={SphereValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await addSphere({ variables: { variables: { name: values.name, description: values.description, hashtag: values.hashtag} } });
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

            <Button type="submit" className="mt-4">Create Sphere</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateSphere;
