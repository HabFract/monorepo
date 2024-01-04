import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, TextInput, Label, Textarea, Tooltip } from 'flowbite-react';
import { useCreateSphereMutation } from '../../graphql/generated';
import { AlertOutlined } from '@ant-design/icons';

// Define the validation schema using Yup
const SphereValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().min(10, 'Testing'),
  hashtag: Yup.string(),
});

const CustomLabel: any = (fieldName: string, errors: object, touched: object) => {
  return (
    <div className='error-label'>
      {errors[fieldName] && touched[fieldName] 
        ? <>
            <AlertOutlined className={errors[fieldName].match(/required/) ? 'icon-warn' : 'icon-danger'} /><span className='error-label-text'>{errors.name}</span>
          </> 
        : ''}</div>
      );
}

const CreateSphere: React.FC = () => {
  const [addSphere] = useCreateSphereMutation({
    refetchQueries: [
      'getSpheres',
    ]
  });

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
            await addSphere({ variables: { variables: { name: values.name, description: values.description, hashtag: values.hashtag } } });
            setSubmitting(false);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <div className="field">
              <Label htmlFor='name'>Name:</Label>
              <Field as={TextInput} color={"default"} autoComplete={'off'} type="text" name="name" required />
              {CustomLabel('name', errors, touched)}
            </div>

            <div className="field">
              <Label htmlFor='description'>Description:</Label>
              <Field as={Textarea} color={"default"} autoComplete={'off'} type="text" name="description" />
              {<div className='error-label'>{errors.description && touched.description ? errors.description : ''}</div>}
            </div>

            <div className="field">
              <Label htmlFor='hashtag' disabled>Hashtag:</Label>
              <Field as={TextInput} disabled color={"default"} autoComplete={'off'} type="text" name="hashtag" />
            </div>
            {errors.hashtag && touched.hashtag ? <div>{errors.hashtag}</div> : null}

            <Button type="submit" className="btn-primary mt-4">Create Sphere</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateSphere;
