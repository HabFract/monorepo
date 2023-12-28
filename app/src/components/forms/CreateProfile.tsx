// #region Global Imports
import React, { useEffect } from 'react'
import { Field, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { Alert, Spin, Input, Switch } from 'antd'
// #endregion Global Imports

// #region Local Imports
import './common.css';

// import { P, TextInput, Button, SwitchInput } from '@/atoms/.'
// import { ImageUploadInput } from '@/atoms/Input/ImageUpload'

import { useMyProfile } from '../../hooks/useMyProfile';

// #endregion Local Imports

// #region Interface Imports
import { ImageUpload } from '../inputs';
// #endregion Interface Imports

export interface IProfileForm {
  editMode: boolean
}

const ProfileForm: React.FunctionComponent<IProfileForm> = ({
  editMode,
}: IProfileForm) => {
  const [profile, _] = useMyProfile()
  // const [addUserMutation, { data, loading, error }] = useAddUserMutation()

  const initialValues =
    editMode && !!profile
      ? {
          nickname: profile.nickname,
          location: profile.fields.location,
          avatar: profile.fields.avatar,
          isPublic: profile.fields.isPublic,
        }
      : {
          nickname: '',
          location: '',
          avatar: '',
          isPublic: false,
        }

  return ( <></>
    // <div className='form-container'>
    //   {error ? (
    //     <Spin spinning={loading}>
    //       {error && (
    //         <Alert
    //           message="Alert message title"
    //           description="Further details about the context of this alert."
    //           type="error"
    //         />
    //       )}
    //     </Spin>
    //   ) : (
    //     <Formik
    //       initialValues={initialValues}
    //       validationSchema={Yup.object({
    //         nickname: Yup.string()
    //           .max(15, 'Must be 15 characters or less')
    //           .required('Required'),
    //         location: Yup.string().max(20, 'Must be 20 characters or less'),
    //         avatar: Yup.string(),
    //         isPublic: Yup.boolean(),
    //       })}
    //       onSubmit={(values, { setSubmitting }) => {
    //         console.log('values :>> ', values)
    //         addUserMutation({
    //           variables: {
    //             profileFields: {
    //               nickname: values.nickname,
    //               location: values.location,
    //               avatar: values.avatar,
    //               // TODO implement isPublic
    //               // isPublic: values.isPublic.toString(),
    //             },
    //           },
    //         })
    //         setSubmitting(false)
    //       }}
    //     >
    //       {({ touched, errors, handleSubmit }: FormikProps<any>) => {
    //         return (
    //           <Form
    //             onSubmit={handleSubmit}
    //             aria-label="profile-form"
    //             id="profile-form"
    //             className="flex flex-col py-2 pb-12 md:relative gap-y-6"
    //           >
    //             <div className="w-full">
    //               <label htmlFor="nickname">Nickname:</label>
    //               <Field
    //                 component={Input}
    //                 id="nickname"
    //                 name="nickname"
    //                 placeholder="Pick a nickname"
    //               />
    //               {errors &&
    //                 errors.nickname &&
    //                 touched &&
    //                 touched.nickname && <label>{errors.nickname as string}</label>}
    //             </div>
    //             <div className="w-full">
    //               <label htmlFor="location">Location:</label>
    //               <Field
    //                 component={Input}
    //                 id="location"
    //                 name="location"
    //                 placeholder="Pick a location"
    //               />
    //             </div>
    //               <Field
    //                 className="grid mr-2 place-content-end"
    //                 component={ImageUpload}
    //                 id="avatar-upload"
    //                 name="avatar-upload"
    //               />
    //               <div style={{ flexBasis: '33%', margin: '0 0 0 2rem' }}>
    //                 <p>Add a user avatar and people can relate visually *</p>
    //               </div>
    //               <div className="flex justify-around w-1/2">
    //                 <label htmlFor="public">Make Profile Public</label>
    //                 <Field component={Switch} id="public" name="public" />
    //               </div>
    //               <div className="px-4 mb-6">
    //                 <p>Going public will enable sharing and trading of habit structures, but is not required to use the app.</p>
    //               </div>
    //             {/* 
    //                 <div className="w-full h-6 bg-gray-200 rounded-full lg:hidden dark:bg-gray-700">
    //                   <div
    //                     className="h-6 bg-blue-600 rounded-full dark:bg-blue-500"
    //                     style={{ width: '20%' }}
    //                   ></div>
    //                 </div>
    //                 <div className="hidden h-full lg:block">
    //                   <Button
    //                     typeOfButton="submit"
    //                     size="lg"
    //                     text="Next"
    //                     onClick={() => {}}
    //                     iconName="forward"
    //                   />
    //                 </div>
    //                 <button
    //                   type="submit"
    //                   className="my-2 ml-2 text-primary-500"
    //                 >
    //                   <svg
    //                     xmlns="http://www.w3.org/2000/svg"
    //                     className="w-8 h-8 lg:hidden"
    //                     viewBox="0 0 20 20"
    //                     fill="currentColor"
    //                   >
    //                     <path
    //                       fillRule="evenodd"
    //                       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
    //                       clipRule="evenodd"
    //                     />
    //                   </svg>
    //                 </button>*/}
    //           </Form>
    //         )
    //       }}
    //     </Formik>
    //   )}
    // </div>
  )
}

export default ProfileForm;