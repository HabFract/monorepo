import React, { useMemo, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { DateTime } from "luxon";
import {
  Frequency,
  GetOrbitHierarchyDocument,
  Orbit,
  OrbitCreateParams,
  OrbitUpdateParams,
  Scale,
  useGetOrbitsQuery,
} from "../../graphql/generated";
import { extractEdges } from "../../graphql/utils";
import { useCreateOrbitMutation } from "../../hooks/gql/useCreateOrbitMutation";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { useStateTransition } from "../../hooks/useStateTransition";
import { currentOrbitIdAtom, decodeFrequency, getOrbitNodeDetailsFromEhAtom } from "../../state/orbit";

import { AppState } from "../../routes";
import { store } from "../../state/store";
import DefaultSubmitBtn from "./buttons/DefaultSubmitButton";
import {
  TextAreaField,
  TextInputField,
  SelectInputField,
  getIconForPlanetValue,
  HelperText,
  getFrequencyDisplayNameLong,
} from "habit-fract-design-system";
import { OrbitFetcher } from "./utils";
import { currentSphereDetailsAtom, currentSphereHashesAtom } from "../../state/sphere";
import { currentSphereHierarchyIndices, newTraversalLevelIndexId } from "../../state/hierarchy";
import { useUpdateOrbitMutation } from "../../hooks/gql/useUpdateOrbitMutation";
import { getScaleDisplayName } from "../vis/helpers";
import { ONBOARDING_FORM_DESCRIPTIONS } from "../../constants";
import Collapse from "antd/es/collapse";

// Define the validation schema using Yup
export const OrbitValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Must be 4 characters or more")
    .max(55, "Must be 55 characters or less")
    .matches(/(?!^\d+$)^.+$/, "Name must contain letters.")
    .required("Name is required"),
  description: Yup.string().matches(
    /(?!^\d+$)^.+$/,
    "Description must contain letters.",
  ),
  startTime: Yup.number().min(0).required("Start date/time is required"),
  endTime: Yup.number(),
  frequency: Yup.mixed()
    .oneOf(Object.values(Frequency))
    .required("Choose a frequency"),
  scale: Yup.mixed().oneOf(Object.values(Scale)).required("Choose a scale"),
  parentHash: Yup.string().nullable("Can be null"),
  childHash: Yup.string().nullable("Can be null"),
  archival: Yup.boolean(),
});

interface CreateOrbitProps {
  editMode: boolean;
  inModal: boolean;
  onCreateSuccess?: Function;
  orbitToEditId?: ActionHashB64;
  sphereEh: string; // Link to a sphere
  parentOrbitEh: string | undefined; // Link to a parent Orbit to create hierarchies
  childOrbitEh?: string | undefined; // Link to a child Orbit to create hierarchies
  headerDiv?: React.ReactNode;
  submitBtn?: React.ReactNode;
  forwardTo?: string;
}

const CreateOrbit: React.FC<CreateOrbitProps> = ({
  editMode = false,
  inModal = false,
  orbitToEditId,
  sphereEh,
  parentOrbitEh,
  childOrbitEh,
  onCreateSuccess,
  headerDiv,
  submitBtn,
}: CreateOrbitProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const selectedSphere = store.get(currentSphereHashesAtom);
  const selectedSphereDetails = store.get(currentSphereDetailsAtom);
  const { _x, y } = store.get(currentSphereHierarchyIndices);
  const inOnboarding = state.match("Onboarding");
  // Used to dictate onward routing
  const originPage: AppState = inOnboarding
    ? "Onboarding2"
    : !!(parentOrbitEh || childOrbitEh)
      ? "Vis"
      : "ListOrbits";

  const [addOrbit] = useCreateOrbitMutation({
    awaitRefetchQueries: !inOnboarding && !!(parentOrbitEh || childOrbitEh),
    refetchQueries: () => [
      {
        query: GetOrbitHierarchyDocument,
        variables: {
          params: { levelQuery: { sphereHashB64: sphereEh, orbitLevel: y } },
        },
      },
    ],
    update() {
      if (typeof onCreateSuccess !== "undefined") {
        onCreateSuccess!.call(this);
      }
    },
  });
  const [updateOrbit] = useUpdateOrbitMutation({
    refetchQueries: inOnboarding ? [] : ["getOrbits"],
  });
  const {
    data: orbits,
    loading: getAllLoading,
    error,
  } = useGetOrbitsQuery({
    fetchPolicy: "network-only",
    variables: { sphereEntryHashB64: sphereEh },
  });
  const loading = getAllLoading;

  const [currentOrbitValues, _] = useState<
    Partial<OrbitCreateParams> & { archival: boolean }
  >({
    name: "",
    description: "",
    startTime: DateTime.now().toMillis(),
    endTime: DateTime.now().toMillis(),
    frequency: Frequency.DailyOrMore_1d,
    scale: undefined,
    archival: false,
    parentHash: !!childOrbitEh ? "root" : parentOrbitEh || null,
    childHash: childOrbitEh || null,
  });
  const orbitEdges = extractEdges((orbits as any)?.orbits) as Orbit[];

  const parentNodeAtom = useMemo(() => getOrbitNodeDetailsFromEhAtom(currentOrbitValues?.parentHash as EntryHashB64), [currentOrbitValues.parentHash]);

  const parentNodeDetails =
    !(editMode && state.match("Onboarding")) &&
    currentOrbitValues.parentHash !== null &&
    store.get(parentNodeAtom);


  const descriptionParts = ONBOARDING_FORM_DESCRIPTIONS[1].split('[em]')
  return (
    <Formik
      initialValues={currentOrbitValues}
      validationSchema={OrbitValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          if (!values.archival) delete values.endTime;
          delete (values as any).archival;
          delete (values as any).eH;
          if (editMode) delete (values as any).childHash;

          let response = editMode
            ? await updateOrbit({
              variables: {
                orbitFields: {
                  id: orbitToEditId as string,
                  ...values,
                  sphereHash: sphereEh,
                  parentHash: parentOrbitEh
                    ? parentOrbitEh
                    : values.parentHash || undefined,
                } as OrbitUpdateParams,
              },
            })
            : await addOrbit({
              variables: {
                variables: {
                  ...values,
                  sphereHash: sphereEh,
                  parentHash: parentOrbitEh
                    ? parentOrbitEh
                    : values.parentHash || undefined,
                  childHash: values.childHash || undefined,
                } as OrbitCreateParams,
              },
            });
          setSubmitting(false);
          if (!response.data) return;

          const payload = response.data as any;
          if (originPage == "Vis" && !editMode) {
            store.set(newTraversalLevelIndexId, { id: payload.createOrbit.eH, direction: "new" });
            transition("Vis", {
              currentSphereEhB64: sphereEh,
              currentSphereAhB64: selectedSphere.actionHash,
              currentSphereDetails: selectedSphereDetails
            });
          } else {
            const orbitAh = editMode
              ? payload.updateOrbit.id
              : payload.createOrbit.id;

            const props = inOnboarding
              ? { refiningOrbitAh: orbitAh }
              : { sphereAh: selectedSphere.actionHash, currentSphereDetails: selectedSphereDetails };

            store.set(currentOrbitIdAtom, orbitAh);
            transition(inOnboarding ? "Onboarding3" : "ListOrbits", props);
          }
        } catch (error) {
          console.error(error);
        }
      }}
    >
      {({ values, errors, touched, setFieldValue }) => {
          const submitButton = (submitBtn &&
            React.cloneElement(submitBtn as React.ReactElement, {
              loading,
              errors,
              touched,
            })) || (
              <DefaultSubmitBtn
                loading={loading}
                editMode={editMode}
                errors={errors}
                touched={touched}
              ></DefaultSubmitBtn>
            );

        const cannotBeAstro =
          !(editMode && state.match("Onboarding")) &&
          values.parentHash !== null &&
          values.parentHash !== "root";
        const cannotBeSub =
          parentNodeDetails && parentNodeDetails.scale == Scale.Atom;
        // Rules which dictate which scale planet can be a child of another scale - may change the possible scale options dyamically
        const scaleDefault = cannotBeSub
          ? Scale.Atom
          : cannotBeAstro
            ? Scale.Sub
            : Scale.Astro;
        if (!values?.scale) {
          setFieldValue("scale", scaleDefault);
        }
        return (
          <section>
            {!inModal ? headerDiv : null}
            <div className="content">
              {state.match("Onboarding") && <>
                <div className="form-description">{descriptionParts[0]}&nbsp;
                  <Collapse
                    size="small"
                    items={[{ key: '1', label: <em>{descriptionParts[1]}</em>, children: <><p>{descriptionParts[2]}<em>{descriptionParts[3]}</em>.</p><p>{descriptionParts[4]}</p></> }]}
                  />
                </div>
                <figure>
                  <div className="figure-images">
                    {['sun', 'planet', 'moon'].map(scale => <div className="figure-image-container" key={scale}><img key={scale} src={`assets/${scale}.svg`} alt={`${scale} figure`} style={{ width: "100%" }} /></div>)}
                  </div>
                  <figcaption className="figure-captions">
                    {['Star', 'Giant', 'Dwarf'].map(scale => <HelperText key={scale} withInfo={true} onClickInfo={() => ({ title: `Plannit Scales`, label: `${scale}`, body: scale })}>{scale}</HelperText>)}
                  </figcaption>
                </figure>
              </>
              }
              <Form noValidate={true}>

              {!parentOrbitEh && !inOnboarding && (
                  <div className="form-field flex">
                    <Field
                      component={SelectInputField}
                      size="base"
                      name="parentHash"
                      id="parent-hash"
                      withInfo={true}
                      onClickInfo={() => ({
                        title: "Good Parenting",
                        body: "Choose the parent which describes behaviour of a bigger scope. //For instance, if the name of your Plannit is 'Run a 10k', maybe the parent is the Plannet with the scope 'Run a 20k'. //Setting your parent to 'None' will make it the top of a new hierarchy.",
                      })}
                      onBlur={() => {
                        setFieldValue("scale", scaleDefault);
                      }}
                      options={[
                        <option value={"root"}>{"None"}</option>,
                        ...(childOrbitEh
                          ? []
                          : orbitEdges.map((orbit, i) => (
                            <option key={i} value={orbit.eH}>
                              {orbit.name}
                            </option>
                          ))),
                      ]}
                      required={true}
                      disabled={!!editMode}
                      labelValue={"Parent Plannit:"}
                    />
                  </div>
                )}
                {editMode && <OrbitFetcher orbitToEditId={orbitToEditId} />}
                <div className="form-field flex">
                  <Field
                    component={SelectInputField}
                    size="base"
                    name="scale"
                    value={values?.scale || scaleDefault}
                    id="scale"
                    icon={(() => {
                      const currentValue = values.scale || scaleDefault;
                      return getIconForPlanetValue(
                        cannotBeAstro && cannotBeSub
                          ? Scale.Atom
                          : currentValue == Scale.Astro && cannotBeAstro
                            ? Scale.Sub
                            : currentValue,
                      );
                    })()}
                    iconSide={"left"}
                    disabled={
                      !editMode &&
                      !parentOrbitEh &&
                      !state.match("Onboarding") &&
                      !(touched?.parentHash || touched?.childHash) &&
                      parentOrbitEh !== null
                    }
                    withInfo={true}
                    onClickInfo={() => ({
                      title: "Scales, Explained",
                      body: "This refers to the magnitude of your tracked behaviour. //We like to think of the three scales in terms of Plans, Agreements, and Actions. // Make an over-arching Plan (a star).// Link it to a number of Agreements - sometimes these are the biggest milestones - the Giants! // Then, make the whole thing easy to carry out: write down a number of small Actions (Dwarves, in our language), ready to be ticked off.",
                    })}
                    options={[
                      // values?.scale ? null : <option value={undefined}>{'Select:'}</option>,
                      ...Object.values(Scale).map((scale) => {
                        return (cannotBeAstro && scale == Scale.Astro) ||
                          (cannotBeSub && scale == Scale.Sub) ? null : (
                          <option key={scale} value={scale}>
                            {getScaleDisplayName(scale)}
                          </option>
                        );
                      }),
                    ].filter((el) => el !== null)}
                    required={true}
                    labelValue={"Scale:"}
                  />
                </div>

                {state.match("Onboarding") && <p style={{alignSelf: 'flex-start'}}>{descriptionParts[5]}<em>{descriptionParts[6]}</em>{descriptionParts[7]}</p>}
                <div className="form-field flex">
                  <Field
                    component={TextInputField}
                    size="base"
                    name="name"
                    id="name"
                    icon={"tag"}
                    iconSide={"left"}
                    withInfo={true}
                    onClickInfo={() => ({
                      title: "The name should be scale-appropriate",
                      body: "Try to make the name to fit with the scale of the Plannit. //For example, a Giant Plannit might be called 'Run 5km' or 'Write a business plan'. //A Dwarf Plannit would be more like 'Run for 10 minutes' or  'Read 40 pages of my book'.",
                    })}
                    required={true}
                    value={editMode ? values.name : undefined}
                    labelValue={"Name:"}
                    placeholder={"E.g. Run for 10 minutes"}
                  />
                </div>

                <div className="form-field flex">
                  <Field
                    component={TextAreaField}
                    size="base"
                    name="description"
                    id="description"
                    required={false}
                    labelValue={"Details:"}
                    placeholder={"E.g. Give some more details..."}
                  />
                </div>
                <div className="form-field flex">
                  <Field
                    component={SelectInputField}
                    size="base"
                    name="frequency"
                    value={values?.frequency}
                    id="frequency"
                    icon={(() => {
                      const currentValue = values.frequency || 1;
                      return currentValue;
                    })()}
                    iconSide={"left"}
                    disabled={false}
                    // withInfo={true}
                    // onClickInfo={() => ({
                    //   title: "Scales, Explained",
                    //   body: "This refers to the magnitude of your behaviour. Astronomic goes well with anything vast, like running a marathon. Atomic is for small, incremental actions, like putting on your running shoes. Sub-astronomic is anything inbetween!",
                    // })}
                    options={[
                      ...Object.values(Frequency).map((frequency) => {
                        return (
                          <option key={frequency} value={frequency}>
                            {getFrequencyDisplayNameLong(decodeFrequency(frequency))}
                          </option>
                        );
                      }),
                    ].filter((el) => el !== null)}
                    required={true}
                    labelValue={"Frequency:"}
                  />
                </div>
                {/* {!inOnboarding && <Flex className={"field"} vertical={true}>
                <Flex justify='space-around'>
                  <Label htmlFor='startTime'>Start<span className="reqd">*</span><span className="hidden-sm">/</span>
                  </Label>
                  <Label htmlFor='endTime'>&nbsp; End:
                  </Label>
                </Flex>
                <div className="flex flex-wrap items-start">
                  <div className="form-field flex flex-1">
                    <Field
                      name="startTime"
                      id="startTime"
                      type="date"
                      placeholder={"Select:"}
                      component={DateInput}
                      defaultValue={values.startTime}
                    />
                  </div>
                  <div className="md:flex-row flex flex-col justify-around flex-1 gap-2 mb-4">
                    <Field
                      name="endTime"
                      id="endTime"
                      type="date"
                      placeholder={"Select:"}
                      component={DateInput}
                      disabled={(!values.archival)}
                      defaultValue={values.endTime}
                    />
                    <Field name="archival">
                      {({ field }) => (
                        <Checkbox
                          className="text-light-gray text-sm"
                          {...field}
                        >Archival?</Checkbox>
                      )}
                    </Field>
                  </div>
                </div>
              </Flex>} */}
              {inModal
                ? <div className="modal-submit-btn bottom-4 absolute">
                  {submitButton}
                </div>
                : <>{submitButton}</>
              }
                
              </Form>
            </div>
          </section>
        );
      }}
    </Formik>
  );
};

export default CreateOrbit;