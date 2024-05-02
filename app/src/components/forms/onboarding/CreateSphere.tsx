import React, { useEffect } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Button, Label } from 'flowbite-react';
import { useCreateSphereMutation, useGetSphereQuery, useUpdateSphereMutation } from '../../../graphql/generated';
import { AlertOutlined } from '@ant-design/icons';
import { ImageUpload } from '../input';
import { TextAreaField } from '../../../../../design-system/inputs/textarea';
import { TextInputField } from '../../../../../design-system/inputs/text';
import { useStateTransition } from '../../../hooks/useStateTransition';
import { ActionHashB64 } from '@holochain/client';
import DefaultSubmitBtn from '../DefaultSubmitButton';
import { Select } from '../../../../../design-system/dist/index.es';


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
  submitBtn?: React.ReactNode;
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

const CreateSphereOnboarding: React.FC<CreateSphereProps> = ({editMode = false, sphereToEditId, submitBtn}) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing

  const [addSphere, {loading}] = useCreateSphereMutation({
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
    <Formik
      initialValues={{
        name: '',
        description: '',
        sphere_image: '',
      }}
      validationSchema={SphereValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let response = editMode
            ? await updateSphere({ variables: { sphere: { id: sphereToEditId as string, name: values.name, description: values.description, image: values.sphere_image } } })
            : await addSphere({ variables: { variables: { name: values.name, description: values.description, image: values.sphere_image } } })
          setSubmitting(false);
          if(!response.data) return;
          transition('Onboarding2', { sphereAh: editMode ? (response.data as any).updateSphere.actionHash : (response.data as any).createSphere.actionHash })
        } catch (error) {
          console.error(error);
        }
      }}
    >
      {({ errors, touched, setFieldTouched, handleChange }) => {
        return (
        <>
        <Select {...{
    id: "example",
    icon: "Favorite fruit:",
    iconSide: "left",
    labelValue: "Favorite fruit:",
    placeholder: "Type here",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    errored: false,
    required: false,
    disabled: false,
    withInfo: false,
  }}></Select>
          <p className='form-description'>A sphere is an <em>area of your life</em> where you want to track repeated actions.</p>
          <Form noValidate={true}>
            {editMode && <SphereFetcher sphereToEditId={sphereToEditId} />}
              <div className="flex flex-col gap-2">
                <Field
                  component={TextInputField}
                  size="base"
                  name="name"
                  id="name"
                  required={true}
                  labelValue={"Name:"}
                  iconSide={"left"}
                  icon={"pen"}
                  placeholder={"E.g. Health and Fitness"}
                  onChange={(e) => { setFieldTouched(e.target.name); handleChange(e) }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Field
                  component={TextAreaField}
                  name="description"
                  id="description"
                  labelValue={"Description:"}
                  placeholder={"E.g. I am aiming to run a marathon this year"}
                  onChange={(e) => { setFieldTouched(e.target.name); handleChange(e); console.log('errors :>> ', errors); }}
                />
              </div>
            <div className="field row sphere-image">
              <Label htmlFor='sphere_image'>Image:</Label>
              <div className="flex flex-col gap-2">
                <Field component={ImageUpload} color={"disabled"} sizing="lg" autoComplete={'off'} type="text" name="sphere_image" id="sphere_image" />
              </div>
            </div>
            { submitBtn || <DefaultSubmitBtn loading={loading} editMode={editMode} errors={errors} touched={touched}></DefaultSubmitBtn> }
          </Form>
        </>
      )}}
    </Formik>
  );
};

export default CreateSphereOnboarding;
