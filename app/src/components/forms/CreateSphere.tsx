import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, TextInput, Label, Textarea, Tooltip } from 'flowbite-react';
import { useCreateSphereMutation } from '../../graphql/generated';
import { AlertOutlined } from '@ant-design/icons';

// Define the validation schema using Yup
const SphereValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().min(10, 'A description needs to be descriptive!'),
  hashtag: Yup.string().min(2, 'Ah'),
});

const CustomErrorLabel: any = (fieldName: string, errors: object, touched: object) => {
  console.log('fieldName, errors[fieldName] :>> ', fieldName, errors[fieldName]);
  return (
    <div className='error-label'>
      {errors[fieldName] && touched[fieldName] 
        ? <>
            <AlertOutlined className={errors[fieldName].match(/required/) ? 'icon-warn' : 'icon-danger'} /><span className='error-label-text'>{errors[fieldName]}</span>
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
    <div className="form-container">
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
          <Form noValidate={true}>
            <div className="field">
              <Label htmlFor='name'>Name:</Label>

              <div className="flex flex-col gap-2">
                <Field as={TextInput} color={"default"} sizing="lg" autoComplete={'off'} type="text" name="name" id="name" required />
                {CustomErrorLabel('name', errors, touched)}
              </div>
            </div>

            <div className="field">
              <Label htmlFor='description'>Description:</Label>
              <div className="flex flex-col gap-2">
                <Field as={Textarea} color={"default"} autoComplete={'off'} type="text" name="description" id="description" />
                {CustomErrorLabel('description', errors, touched)}
              </div>
            </div>

            <div className="field">
              <Label htmlFor='hashtag' disabled>Hashtag:</Label>
              <div className="flex flex-col gap-2">
                <Field as={TextInput} disabled color={"disabled"} sizing="lg" autoComplete={'off'} type="text" name="hashtag" id="hashtag" />
                {CustomErrorLabel('hashtag', errors, touched)}
              </div>
            </div>

            <Button type="submit" disabled={!!Object.values(errors).length} className="btn-primary">Create Sphere</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateSphere;
