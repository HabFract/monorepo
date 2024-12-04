import { Field, Form, Formik, FieldArray } from "formik";
import "./common.css";
import * as Yup from "yup";
import {
  Button,
  HelperText,
  TextInputField,
  SelectInputField,
  getIconForPlanetValue,
} from "habit-fract-design-system";
import Split from "../icons/Split";
import Pencil from "../icons/Pencil";
import { MinusCircleFilled, PlusCircleFilled } from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import {
  Frequency,
  Orbit,
  Scale,
  useUpdateOrbitMutation,
} from "../../graphql/generated";
import { useCreateOrbitMutation } from "../../hooks/gql/useCreateOrbitMutation";
import { Label } from "flowbite-react";
import { serializeAsyncActions } from "../../graphql/utils";
import { store } from "../../state/store";
import { Refinement } from "../forms/RefineOrbit";
import { OrbitFetcher } from "../forms/utils";
import { getScaleDisplayName, isSmallScreen } from "../vis/helpers";
import { currentSphereHashesAtom } from "../../state/sphere";
import OnboardingContinue from "../forms/buttons/OnboardingContinueButton";
import { DataLoadingQueue } from "../PreloadAllData";

interface OrbitSubdivisionListProps {
  currentOrbitValues: Orbit;
  refinementType: Refinement;
  submitBtn?: React.ReactNode;
}

export const sleep = (ms: number) =>
  new Promise((r) => setTimeout(() => r(null), ms));

const OrbitSubdivisionList: React.FC<OrbitSubdivisionListProps> = ({
  submitBtn,
  refinementType,
  currentOrbitValues: { scale: currentScale, eH: currentHash, id },
}) => {
  const ListValidationSchema = Yup.object().shape({
    list: Yup.array().of(
      Yup.object().shape({
        name: Yup.string()
          .matches(/(?!^\d+$)^.+$/, "Name must contain letters.")
          .min(3, "Must be 4 characters or more")
          .max(55, "Must be 55 characters or less")
          .required("Required"),
      }),
    ),
    scale: Yup.mixed().oneOf(Object.values(Scale)).required("Choose a scale"),
  });

  const [addOrbit] = useCreateOrbitMutation({});
  const [updateOrbit] = useUpdateOrbitMutation({});
  const [submitRefineBtnIsLoading, setSubmitRefineBtnIsLoading] = useState<boolean>(false);
  const dataLoadingQueue = useMemo(() => new DataLoadingQueue(), []);

  return (
    <div className="layout orbit-subdivision-list">
      <Formik
        initialValues={
          refinementType == Refinement.Update
            ? { name: "" }
            : { list: [{ name: "" }], scale: Scale.Atom }
        }
        validationSchema={ListValidationSchema}
        onSubmit={async (values: any, { setSubmitting }) => {
          setSubmitting(false);
          delete values.childHash;
          const sphere = store.get(currentSphereHashesAtom);
          if (!sphere?.entryHash || !currentHash) {
            throw new Error("No sphere set or parent hash, cannot refine orbits");
          }
          setSubmitRefineBtnIsLoading(true);
  
          try {
            if (refinementType == Refinement.Update) {
              await updateOrbit({
                variables: {
                  orbitFields: {
                    name: values.name,
                    id: values.id,
                    startTime: values.startTime,
                    endTime: values.endTime,
                    frequency: values.frequency,
                    scale: values.scale,
                    parentHash: values.parentHash,
                    sphereHash: sphere?.entryHash,
                  },
                },
              });
              (submitBtn as any).props.onClick.call(null);
            } else {
              const { list, scale } = values;
              
              // Queue up all orbit creation tasks
              for (const orbit of list!) {
                await dataLoadingQueue.enqueue(async () => {
                  await addOrbit({
                    variables: {
                      variables: {
                        name: orbit.name,
                        scale,
                        frequency: Frequency.DailyOrMore_1d,
                        startTime: +new Date(),
                        sphereHash: sphere.entryHash as string,
                        parentHash: currentHash as string,
                      },
                    },
                  });
                  await sleep(500);
                });
              }
  
              // Queue final completion tasks
              await dataLoadingQueue.enqueue(async () => {
                console.log("New orbit subdivisions created! :>> ");
                (submitBtn as any).props.onClick.call(null);
              });
            }
          } catch (error) {
            setSubmitRefineBtnIsLoading(false);
            console.error(error);
          }
        }}
      >
        {({ values, touched, errors, submitForm, isSubmitting }) => {
          const SubmitButton = <OnboardingContinue
            loading={submitRefineBtnIsLoading}
            errors={errors}
            touched={touched}
            onClick={() => submitForm()}
          />

          const refineTitle =
            refinementType == Refinement.Update
              ? "Refine Planitt Name"
              : "Choose Sub-Planitt Scale";
          const refineMessage =
            refinementType == Refinement.Update
              ? "Since you have chosen the Atomic scale for your Orbit, it's best to make sure it is named in a way that is an <em>incremental action</em> - one that is quantifiable and achievable:"
              : "Since you have chosen a big scale for your Orbit (shooting for the stars!) you can now break it up into smaller actions - so start by subdividing into Orbits of a smaller scale.";
          return (
            <>
              {refinementType == Refinement.Update && (
                <OrbitFetcher orbitToEditId={id}></OrbitFetcher>
              )}
              <HelperText
                title={refineTitle}
                titleIcon={
                  refinementType == Refinement.Update ? <Pencil /> : <Split />
                }
                withInfo={isSmallScreen()}
                onClickInfo={() => ({
                  title: refineTitle,
                  body: refineMessage,
                })}
              >
                {!isSmallScreen() &&
                  (refinementType == Refinement.Update ? (
                    <span>
                      Since you have chosen the Atomic scale for your Orbit,
                      it's best to make sure it is named in a way that is an{" "}
                      <em>incremental action</em> - one that is quantifiable and
                      achievable:
                    </span>
                  ) : (
                    <span>
                      Since you have chosen a big scale for your Orbit (shooting
                      for the stars!) you can now <em>break it up</em> into{" "}
                      <em>smaller actions</em> - so start by{" "}
                      <em>subdividing</em> into Orbits of a smaller scale.
                    </span>
                  ))}
              </HelperText>

              {!isSmallScreen() &&
                refinementType == Refinement.Split &&
                values.scale == Scale.Atom &&
                RenamingHelperText()}

              <Form
                noValidate={true}
                style={{ gridColumn: "-2/-1", gridRow: "1/-1" }}
              >
                <div className="md:gap-4 flex flex-col gap-2">
                  {refinementType == Refinement.Update ? (
                    <Field
                      component={TextInputField}
                      size="base"
                      name="name"
                      id="atomic-name"
                      icon={"tag"}
                      value={values.name}
                      iconSide={"left"}
                      withInfo={false}
                      required={true}
                      labelValue={"Refined Name:"}
                      placeholder={"E.g. Run for 10 minutes"}
                    />
                  ) : (
                    <>
                      <Field
                        component={SelectInputField}
                        size="base"
                        name="scale"
                        id="scale"
                        icon={getIconForPlanetValue(values.scale)}
                        iconSide={"left"}
                        withInfo={false}
                        options={chooseLowerScales(currentScale)
                          ?.sort((a: any, b: any) => a - b)
                          .map((scale) => {
                            return (
                              <option key={scale} value={scale}>
                                {getScaleDisplayName(scale)}
                              </option>
                            );
                          })}
                        required={true}
                        labelValue={"Scale:"}
                      />
                      {isSmallScreen() &&
                        refinementType == Refinement.Split &&
                        values.scale == Scale.Atom &&
                        RenamingHelperText()}
                      <Label htmlFor="list">
                        New Planitt Names: <span className="reqd">*</span>
                      </Label>
                      <FieldArray
                        name="list"
                        render={(arrayHelpers) => (
                          <>
                            {values!.list!.map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <Field
                                  component={TextInputField}
                                  size="base"
                                  name={`list[${index}].name`}
                                  value={item.name}
                                  id={`list[${index}].name`}
                                  icon={
                                    index == values!.list!.length - 1
                                      ? "pencil"
                                      : "save"
                                  }
                                  iconSide={"right"}
                                  withInfo={false}
                                  required={false}
                                  isListItem={true}
                                  labelValue={`${index + 1}: `}
                                  placeholder={"E.g. Run for 10 minutes"}
                                />
                                <button
                                  style={{ opacity: index > 0 ? 1 : 0 }}
                                  className="text-danger hover:text-danger-500 flex justify-center flex-1 w-full"
                                  type="button"
                                  onClick={() => arrayHelpers.remove(index)}
                                >
                                  <MinusCircleFilled />
                                </button>
                              </div>
                            ))}

                            {errors.list && (
                              <Label className="text-warn my-1">
                                All names must be a valid length
                              </Label>
                            )}
                            {values!.list!.length <= 3 && (
                              <button
                                className="dark:text-accent-dark hover:text-primary flex justify-center flex-1 w-8 mx-auto"
                                type="button"
                                onClick={() => arrayHelpers.push({ name: "" })}
                                disabled={values!.list!.length >= 4}
                              >
                                <PlusCircleFilled />
                              </button>
                            )}
                          </>
                        )}
                      />
                    </>
                  )}
                </div>
                
                {SubmitButton}
              </Form>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

export default OrbitSubdivisionList;

function RenamingHelperText() {
  return (
    <HelperText
      title={"Refine Planitt Name"}
      titleIcon={<Pencil />}
      withInfo={false}
    >
      <span>
        Since you have chosen the Dwarf scale for your new Planitts, it's best to
        make sure they are named in a way that is an <em>incremental action</em>{" "}
        - one that is easily quantifiable and achievable.
      </span>
    </HelperText>
  );
}

function chooseLowerScales(scale: Scale): Scale[] {
  switch (scale) {
    case Scale.Astro:
      return [Scale.Sub, Scale.Atom];
    case Scale.Sub:
      return [Scale.Atom];
    case Scale.Atom:
      return [];
    default:
      return [];
  }
}
