import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Label } from "flowbite-react";
import {
  SphereCreateParams,
  useGetSphereQuery,
  useUpdateSphereMutation,
} from "../../graphql/generated";
import { ImageUpload } from "./input";
import { useStateTransition } from "../../hooks/useStateTransition";
import { ActionHashB64 } from "@holochain/client";
import DefaultSubmitBtn from "./buttons/DefaultSubmitButton";
import { TextAreaField, TextInputField } from "habit-fract-design-system";
import { useCreateSphereMutation } from "../../hooks/gql/useCreateSphereMutation";

// Define the validation schema using Yup
const SphereValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is a required field"),
  description: Yup.string().min(
    5,
    "A description needs to be at least 5 characters",
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

const SphereFetcher = ({ sphereToEditId, setValues }) => {
  const {
    data: getData,
    error: getError,
    loading: getLoading,
  } = useGetSphereQuery({
    variables: {
      id: sphereToEditId as string,
    },
    skip: !sphereToEditId,
  });

  useEffect(() => {
    if (!getData) return;

    const {
      name,
      metadata: { description, image },
    } = getData?.sphere as any;
    setValues({
      name,
      description,
      image,
    });
  }, [getData]);
  return null;
};

const CreateSphere: React.FC<CreateSphereProps> = ({
  editMode = false,
  sphereToEditId,
  headerDiv,
  submitBtn,
}) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing

  const [currentSphereValues, setCurrentSphereValues] =
    useState<SphereCreateParams>({
      name: "",
      description: "",
      image: "",
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
                },
              },
            })
            : await addSphere({
              variables: {
                variables: {
                  name: values.name,
                  description: values.description,
                  image: values.image,
                },
              },
            });
          setSubmitting(false);
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
            state == "Onboarding1" ? "Onboarding2" : "ListSpheres",
            props,
          );
        } catch (error) {
          console.error(error);
        }
      }}
    >
      {({ values, errors, touched, isSubmitting }) => {
        const SubmitButton = submitBtn ? (
          React.cloneElement(submitBtn as React.ReactElement, {
            loading: (loading || isSubmitting),
            errors,
            touched,
          })
        ) : (
          <DefaultSubmitBtn
            loading={loading || isSubmitting}
            editMode={editMode}
            errors={errors}
            touched={touched}
          />
        );
        return (
          <div className="px-1">
            {headerDiv}

            {<h2 className="onboarding-subtitle">Create a Sphere</h2>}
            <p className="form-description">
              A sphere is an <em>area of your life</em> where you want to track
              repeated actions.
            </p>
            <Form noValidate={true}>
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

              <div className="field row sphere-image">
                <Label htmlFor="image">Image:</Label>
                <div className="form-field">
                  <Field component={ImageUpload} name="image" id="image" />
                </div>
              </div>

              {SubmitButton}
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default CreateSphere;
