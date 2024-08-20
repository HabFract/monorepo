import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"
import { Frequency, GetOrbitHierarchyDocument, GetOrbitsDocument, Orbit, OrbitCreateParams, OrbitUpdateParams, Scale, useCreateOrbitMutation, useGetOrbitQuery, useGetOrbitsQuery, useUpdateOrbitMutation } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { ActionHashB64 } from '@holochain/client';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentOrbitCoords, currentOrbitId, currentSphere } from '../../state/currentSphereHierarchyAtom';
import { AppState } from '../../routes';
import { mapToCacheObject, nodeCache, store } from '../../state/jotaiKeyValueStore';
import { client } from '../../graphql/client';
import DefaultSubmitBtn from './DefaultSubmitButton';
import { TextAreaField, TextInputField, SelectInputField } from 'habit-fract-design-system';
import { OrbitFetcher } from './utils';

// Define the validation schema using Yup
export const OrbitValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Must be 4 characters or more')
    .max(55, 'Must be 55 characters or less')
    .matches(/(?!^\d+$)^.+$/, 'Name must contain letters.')
    .required('Name is required'),
  description: Yup.string().matches(/(?!^\d+$)^.+$/, 'Description must contain letters.'),
  startTime: Yup.number().min(0).required("Start date/time is required"),
  endTime: Yup.number(),
  frequency: Yup.mixed()
    .oneOf(Object.values(Frequency))
    .required('Choose a frequency'),
  scale: Yup.mixed()
    .oneOf(Object.values(Scale))
    .required('Choose a scale'),
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
  childOrbitEh: string | undefined; // Link to a child Orbit to create hierarchies
  headerDiv?: React.ReactNode;
  submitBtn?: React.ReactNode;
  forwardTo?: string;
}

const CreateOrbit: React.FC<CreateOrbitProps> = ({ editMode = false, inModal = false, orbitToEditId, sphereEh, forwardTo, parentOrbitEh, childOrbitEh, onCreateSuccess, headerDiv, submitBtn }: CreateOrbitProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const selectedSphere = store.get(currentSphere);
  const {x, y} = store.get(currentOrbitCoords);
  const inOnboarding = state.match('Onboarding');
  // Used to dictate onward routing
  const originPage : AppState = inOnboarding ? 'Onboarding2' : !!(parentOrbitEh || childOrbitEh) ? 'Vis' : 'ListOrbits';

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
    
    async update(){
      if(!!inOnboarding) return;
      const variables = { sphereEntryHashB64: sphereEh };
      let data;
      try {
        const gql = await client;
        data = await gql.query({ query: GetOrbitsDocument, variables, fetchPolicy: 'network-only'} )
        if(data?.data?.orbits) {
          const orbits = (extractEdges(data.data.orbits) as Orbit[]);
          const indexedOrbitData = Object.entries(orbits.map(mapToCacheObject))
            .map(([_idx, value]) => [value.eH, value]);
          store.set(nodeCache.set, selectedSphere.actionHash as ActionHashB64, Object.fromEntries(indexedOrbitData))
          console.log('Sphere orbits fetched and cached!')
          if(originPage == 'Vis' || forwardTo == 'Vis') {
            transition('Vis', { currentSphereEhB64: sphereEh, currentSphereAhB64: selectedSphere.actionHash}) 
          }
        }

        if(typeof onCreateSuccess !== 'undefined') {
          onCreateSuccess!.call(this)
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
  const [updateOrbit] = useUpdateOrbitMutation({
    refetchQueries: inOnboarding ? [] : [
      'getOrbits',
    ],
  });

  const { data: orbits, loading: getAllLoading, error } = useGetOrbitsQuery({ variables: { sphereEntryHashB64: sphereEh } });
  const loading = getAllLoading;

  const [currentOrbitValues, _] = useState<Partial<OrbitCreateParams> & {archival: boolean}>({
    name: '',
    description: '',
    startTime: DateTime.now().ts,
    endTime: DateTime.now().ts,
    frequency: Frequency.Day,
    scale: !!parentOrbitEh && parentOrbitEh !== 'root' ? Scale.Atom : Scale.Astro, // TODO make helper for including childOrbitEh
    archival: false,
    parentHash: !!childOrbitEh ? 'root' : parentOrbitEh || null,
    childHash: childOrbitEh ||null
  });

  return (
    <Formik
      initialValues={currentOrbitValues}
      validationSchema={OrbitValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          if (!values.archival) delete values.endTime;
          delete (values as any).archival;
          delete (values as any).eH;
          if(editMode) delete (values as any).childHash;

          let response = editMode
            ? await updateOrbit({ variables: { orbitFields: { id: orbitToEditId as string, ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined } as OrbitUpdateParams } })
            : await addOrbit({ variables: { variables: { ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined, childHash: values.childHash || undefined } as OrbitCreateParams } })
          setSubmitting(false);
          if(!response.data) return;
  
          const payload = response.data as any;
          if(originPage == 'Vis') {
            transition('Vis', { currentSphereEhB64: sphereEh, currentSphereAhB64: selectedSphere.actionHash}) 
          } else {
            const orbitAh = editMode ? payload.updateOrbit.actionHash : payload.createOrbit.actionHash
            const props = inOnboarding
              ? { refiningOrbitAh: orbitAh }
              : { sphereAh: selectedSphere.actionHash }

            store.set(currentOrbitId, { id: orbitAh })
            transition(inOnboarding ? 'Onboarding3' : 'ListOrbits', props)
          }
        } catch (error) {
          console.error(error);
        }
      }}
      >
      {({ values, errors, touched }) => {
      return  (
        <div className={inModal ? 'px-2 w-full' : ''}>
          {!inModal ? headerDiv : null}

          {!inModal && <h2 className='onboarding-subtitle'>{ editMode ? "Edit Orbit Details" : "Create an Orbit"}</h2>}
          <p className='form-description'>An orbit is a <em>specific life action</em> that your wish to track over time.</p>
          <Form noValidate={true}>
            {editMode && <OrbitFetcher orbitToEditId={orbitToEditId} />}

            <div className="flex form-field">
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
                    body: "Try to make the name in line with the scale of the Orbit. For example, an Atomic Orbit might be called 'Meditate for 10 minutes'",
                  })}
                  required={true}
                  value={editMode ? values.name : undefined}
                  labelValue={"Name:"}
                  placeholder={"E.g. Run for 10 minutes"}
                />
            </div>

            <div className="flex form-field">
              <Field
                component={TextAreaField}
                size="base"
                name="description"
                id="description"
                required={false}
                labelValue={"Description:"}
                placeholder={"E.g. Give some more details..."}
              />
            </div>

            <div className="flex form-field">
              <Field
                component={SelectInputField}
                size="base"
                name="scale"
                id="scale"
                icon={"scale-planets"}
                iconSide={"left"}
                withInfo={true}
                onClickInfo={() => ({
                  title: "Scales, Explained",
                  body: "This refers to the magnitude of your behaviour. Astronomic goes well with anything vast, like running a marathon. Atomic is for small, incremental actions, like putting on your running shoes. Sub-astronomic is anything inbetween!",
                })}
                options={Object.values(Scale).map((scale) => {
                  const cannotBeAstro = !(editMode && state.match("Onboarding")) && values.parentHash !== null && values.parentHash !== 'root';
                  return cannotBeAstro && scale == 'Astro'
                    ? null
                    : <option key={scale} value={scale}>{getDisplayName(scale)}</option>
                  }
                )}
                required={true}
                labelValue={"Scale:"}
              />
            </div>

            {!parentOrbitEh && !inOnboarding && <div className="flex form-field">
              <Field
                component={SelectInputField}
                size="base"
                name="parentHash"
                id="parent-hash"
                withInfo={true}
                onClickInfo={() => ({
                  title: "Good Parenting",
                  body: "Choose the parent which describes behaviour of a bigger scope. For instance, if the name of your Orbit is 'Run a 10k', maybe the next biggest scope is 'Run a 20k'. Setting your parent to 'None' will make it the top of a new hierarchy.",
                })}
                options={[
                  <option value={'root'}>{'None'}</option>,
                  ...(childOrbitEh ? [] : (extractEdges((orbits as any)?.orbits) as Orbit[]).map((orbit, i) =>
                    <option key={i} value={orbit.eH}>{orbit.name}</option>
                  ))
                ]}
                required={true}
                disabled={!!editMode}
                labelValue={"Parent Orbit:"}
              />
            </div>}

            {/* FIELD STRIPPED OUT OF MVP: <div className="field">
              <Label htmlFor='frequency'>Frequency: <span className="reqd">*</span>
              </Label>
              <div className="flex form-field">
                <Field name="frequency" >
                  {({ field }) => (
                    <Select
                      {...field}
                      color={errors.frequency && touched.frequency ? "invalid" : "default"}
                    >
                      {Object.values(Frequency).map((freq, i) =>
                        <option key={i} value={freq}>{freq}</option>
                      )
                      }
                    </Select>
                  )}
                </Field>
                {CustomErrorLabel('frequency', errors, touched)}
              </div>
            </div> */}


            {/* {!inOnboarding && <Flex className={"field"} vertical={true}>
              <Flex justify='space-around'>
                <Label htmlFor='startTime'>Start<span className="reqd">*</span><span className="hidden-sm">/</span>
                </Label>
                <Label htmlFor='endTime'>&nbsp; End:
                </Label>
              </Flex>
              <div className="flex flex-wrap items-start">
                <div className="flex form-field flex-1">
                  <Field
                    name="startTime"
                    id="startTime"
                    type="date"
                    placeholder={"Select:"}
                    component={DateInput}
                    defaultValue={values.startTime}
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-2 mb-4 justify-around flex-1">
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
                        className="text-sm text-light-gray"
                        {...field}
                      >Archival?</Checkbox>
                    )}
                  </Field>
                </div>
              </div>
            </Flex>} */}
            { submitBtn && React.cloneElement(submitBtn as React.ReactElement, { loading, errors, touched }) || <DefaultSubmitBtn loading={loading} editMode={editMode} errors={errors} touched={touched}></DefaultSubmitBtn> }
          </Form>
        </div>
      )}}
    </Formik>
  );
};

export default CreateOrbit;

export function getDisplayName(scale: Scale) {
  switch (scale) {
    case Scale.Astro:
      return "Astronomic"
    case Scale.Sub:
      return "Sub-astronomic"
    case Scale.Atom:
      return "Atomic"
  }
}