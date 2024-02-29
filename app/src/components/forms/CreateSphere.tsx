import React, { useEffect } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Button, TextInput, Label, Textarea, Tooltip } from 'flowbite-react';
import { useCreateSphereMutation, useGetSphereQuery, useUpdateSphereMutation } from '../../graphql/generated';
import { AlertOutlined } from '@ant-design/icons';
import { ImageUpload } from './input';
import { useStateTransition } from '../../hooks/useStateTransition';
import { ActionHashB64 } from '@holochain/client';


// Define the validation schema using Yup
const SphereValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().min(10, 'A description needs to be descriptive!'),
  sphere_image: Yup.string().trim().matches(/^data:((?:\w+\/(?:(?!;).)+)?)((?:;[\w=]*[^;])*),(.+)$/,"Image must be a valid data URI"),
  //TODO: limit to jpg/png?
});


interface CreateSphereProps {
  editMode: boolean;
  sphereToEditId?: ActionHashB64;
}

export const CustomErrorLabel: any = (fieldName: string, errors: object, touched: object) => {
  return (
    <div className='error-label'>
      {errors[fieldName] && touched[fieldName] 
        ? <>
            <AlertOutlined className={errors[fieldName].match(/required/) ? 'icon-warn' : 'icon-danger'} /><span className='error-label-text'>{errors[fieldName]}</span>
          </> 
        : ''}</div>
      );
}

const SphereFetcher = ({sphereToEditId}) => {
  const { setValues } = useFormikContext();

  const {data: getData, error: getError, loading: getLoading } = useGetSphereQuery({
    variables: {
      id: sphereToEditId as string
    },
  });

  useEffect(() => {
      const {  name, metadata: {description, image }} = getData!.sphere as any;
      
      setValues({
        name, description, sphere_image: image
      })
  }, [getData])
  return null;
};

const CreateSphere: React.FC<CreateSphereProps> = ({editMode = false, sphereToEditId}) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing

  const [addSphere] = useCreateSphereMutation({
    refetchQueries: [
      'getSpheres',
    ]
  });
  const [updateSphere] = useUpdateSphereMutation({
    refetchQueries: [
      'getSpheres',
    ]
  });

  return (
    <div className="form-container create-sphere">
      <h2 className="form-title">{editMode ? "Update" : "Create"} Sphere</h2>
      <Formik
        initialValues={{
          name: '',
          description: '',
          sphere_image: '',
        }}
        validationSchema={SphereValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            
            editMode
              ? await updateSphere({ variables: { sphere: { id: sphereToEditId as string, name: values.name, description: values.description, image: values.sphere_image } } })
              : await addSphere({ variables: { variables: { name: values.name, description: values.description, image: values.sphere_image } } })
            setSubmitting(false);

            // transition('ListOrbits', { sphereHash: selectedSphere.actionHash })
            transition('ListSpheres')
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {({ errors, touched, setFieldTouched, handleChange }) => (
          <Form noValidate={true}>
            {editMode && <SphereFetcher sphereToEditId={sphereToEditId} />} 

            <div className="field">
              <Label htmlFor='name'>Name: <span className="reqd">*</span></Label>

              <div className="flex flex-col gap-2">
                <Field as={TextInput} color={"default"} sizing="lg" autoComplete={'off'} type="text" name="name" id="name" required
                onChange={(e) => { setFieldTouched(e.target.name); handleChange(e) }} />
                {CustomErrorLabel('name', errors, touched)}
              </div>
            </div>

            <div className="field">
              <Label htmlFor='description'>Description:</Label>
              <div className="flex flex-col gap-2">
                <Field as={Textarea} color={"default"} autoComplete={'off'} type="text" name="description" id="description"
                onChange={(e) => { setFieldTouched(e.target.name); handleChange(e) }}/>
                {CustomErrorLabel('description', errors, touched)}
              </div>
            </div>

            {/* <div className="field">
              <Label htmlFor='hashtag' disabled>Hashtag:</Label>
              <div className="flex flex-col gap-2">
                <Field as={TextInput} disabled color={"disabled"} sizing="lg" autoComplete={'off'} type="text" name="hashtag" id="hashtag"
                onChange={(e) => { setFieldTouched(e.target.name); handleChange(e) }} />
                {CustomErrorLabel('hashtag', errors, touched)}
              </div>
            </div> */}

            <div className="field row sphere-image">
              <Label htmlFor='sphere_image'>Image:</Label>
              <div className="flex flex-col gap-2">
                <Field component={ImageUpload} color={"disabled"} sizing="lg" autoComplete={'off'} type="text" name="sphere_image" id="sphere_image" />
              </div>
            </div>

            <Button type="submit" disabled={Object.values(errors).length > 0 || Object.values(touched).filter(value => value).length < 1} className={editMode ? "btn-warn" : "btn-primary"}>{editMode ? "Update" : "Create"}</Button>
          </Form>
        )}
      </Formik>
      <div className="scene">
        <img src="assets/scenes/Dark/RemoteLife.svg" alt="" />
      </div>
    </div>
  );
};

export default CreateSphere;
