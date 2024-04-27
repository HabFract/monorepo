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
    <div className="">
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
          function DefaultSubmitBtn() {
            return <Button type="submit" disabled={loading || !!Object.values(errors).length || !!(Object.values(touched).filter(value => value).length < 1)} className={editMode ? "btn-warn" : "btn-primary"}>
              { loading
                ? <div role="status">
                      <svg aria-hidden="true" className="text-center inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                      </svg>
                      <span className="sr-only">Loading...</span>
                  </div>
                : editMode ? "Update" : "Create"
              }
              </Button>
          }
          return (
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


            { submitBtn || <DefaultSubmitBtn></DefaultSubmitBtn> }
          </Form>
        )}}
      </Formik>
    </div>
  );
};

export default CreateSphereOnboarding;
