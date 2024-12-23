import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  SphereCreateParams,
  useGetSphereQuery,
  useUpdateSphereMutation,
} from "../../graphql/generated";
import { useStateTransition } from "../../hooks/useStateTransition";
import { ActionHashB64 } from "@holochain/client";
import DefaultSubmitBtn from "./buttons/DefaultSubmitButton";
import { ImageUploadInput, Label, TextAreaField, TextInputField } from "habit-fract-design-system";
import { useCreateSphereMutation } from "../../hooks/gql/useCreateSphereMutation";
import { ERROR_MESSAGES, MODEL_DISPLAY_VALUES, ONBOARDING_FORM_DESCRIPTIONS } from "../../constants";
import { SphereFetcher } from "./utils";
import Collapse from "antd/es/collapse";

// Define the validation schema using Yup
const SphereValidationSchema = Yup.object().shape({
  name: Yup.string().required(ERROR_MESSAGES['sphere-name-empty']),
  description: Yup.string().min(
    8,
    ERROR_MESSAGES['sphere-description-short'],
  ),
  image: Yup.string()
    .trim()
    .matches(
      /^data:((?:\w+\/(?:(?!;).)+)?)((?:;[\w=]*[^;])*),(.+)$/,
      "Image must be a valid data URI",
    ),
});

interface CreateSphereProps {
  editMode: boolean;
  sphereToEditId?: ActionHashB64;
  headerDiv?: React.ReactNode;
  submitBtn?: React.ReactNode;
}

const CreateSphere: React.FC<CreateSphereProps> = ({
  editMode = false,
  sphereToEditId,
  headerDiv,
  submitBtn,
}) => {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  const [currentSphereValues, setCurrentSphereValues] =
    useState<SphereCreateParams>({
      name: "",
      description: "",
      image: "",
      spin: params?.spin || "positive"
    });

  const [addSphere, { loading }] = useCreateSphereMutation();
  const [updateSphere] = useUpdateSphereMutation({
    refetchQueries: ["getSpheres"],
  });

  return (
    <Formik
      enableReinitialize={true}
      initialValues={currentSphereValues}
      validationSchema={SphereValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let response = editMode
            ? await updateSphere({
              variables: {
                sphere: {
                  id: sphereToEditId as string,
                  name: values.name,
                  description: values.description,
                  image: values.image,
                  // spin: values.spin,
                },
              },
            })
            : await addSphere({
              variables: {
                variables: {
                  name: values.name,
                  description: values.description,
                  image: values.image,
                  // spin: values.spin,
                },
              },
            });

          if (!response.data) return;
          const payload = response.data as any;
          const eH =
            payload?.createSphere?.entryHash ||
            payload?.updateSphere?.entryHash;
          const aH =
            payload?.createSphere?.actionHash ||
            payload?.updateSphere?.actionHash;
          const props =
            state == "Onboarding1" ? { sphereEh: eH } : { sphereAh: aH };

          transition(
            state == "Onboarding1" ? "Onboarding2" : "Home",
            {... props, spin: params?.spin},
          );
        } catch (error) {
          console.error(error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, isSubmitting, validateForm, submitForm }) => {
        const handleClick = () => {
          try {
            submitForm();
            Object.values(errors).length == 0 && (submitBtn as any).props.onClick.call(null);
          } catch (error) {
            console.log('error :>> ', error);
          }
        };
        const SubmitButton = submitBtn ? (
          React.cloneElement(submitBtn as React.ReactElement, {
            loading: (loading || isSubmitting),
            errors,
            touched,
            onClick: handleClick
          })
        ) : (
          <DefaultSubmitBtn
            loading={loading || isSubmitting}
            editMode={editMode}
            errors={errors}
            touched={touched}
            onClick={handleClick}
          />
        );

        const descriptionParts = ONBOARDING_FORM_DESCRIPTIONS[0].split('[em]')
        return (
          <section>
            {headerDiv}
            <div className="content">
              <div className="form-description">
                {descriptionParts[0]}&nbsp;
                <Collapse
                  size="small"
                  items={[{ key: '1', label: <em>{descriptionParts[1]}</em>, children: <p>{descriptionParts[2]}</p> }]}
                />
              </div>
              <Form noValidate onSubmit={async (e) => {
                  e.preventDefault();
                  // Validate before submitting
                  const errors = await validateForm();
                  if (Object.keys(errors).length === 0) {
                    // Form is valid, allow submission
                    
                    e.currentTarget.submit();
                  }
                }}>
                {editMode && (
                  <SphereFetcher
                    sphereToEditId={sphereToEditId}
                    setValues={setCurrentSphereValues}
                  />
                )}
                <div className="form-field">
                  <Field
                    component={TextInputField}
                    size="base"
                    name="name"
                    id="name"
                    icon={"tag"}
                    value={editMode ? values.name : undefined}
                    iconSide={"left"}
                    required={true}
                    labelValue={"Name:"}
                    placeholder={"E.g. Health and Fitness"}
                  />
                </div>
                <div className="form-field">
                  <Field
                    component={TextAreaField}
                    name="description"
                    id="description"
                    labelValue={"Description:"}
                    placeholder={"E.g. I am aiming to run a marathon this year"}
                  />
                </div>
                <div className="form-field">
                  <Label id="image" labelValue="Symbol: ">
                    <Field defaultImage={params?.spin == 'negative' ? '/assets/icons/negative-spin.svg' : '/assets/icons/positive-spin.svg' } component={ImageUploadInput} defaultOptions={[
                      { src: '/assets/icons/sphere-symbol-1.svg', alt: 'Symbol 1' },
                      { src: '/assets/icons/sphere-symbol-2.svg', alt: 'Symbol 2' },
                      { src: '/assets/icons/sphere-symbol-3.svg', alt: 'Symbol 3' },
                      { src: '/assets/icons/sphere-symbol-4.svg', alt: 'Symbol 4' },
                      { src: '/assets/icons/sphere-symbol-5.svg', alt: 'Symbol 5' },
                    ]} noDefaultImage={false} name="image" id="image" />
                  </Label>
                </div>
                {SubmitButton}
              </Form>
            </div>
          </section>
        );
      }}
    </Formik>
  );
};

export default CreateSphere;
