import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"

import { Checkbox, Flex } from 'antd';
import DateInput from './input/DatePicker';
import { Label, Select } from 'flowbite-react';

import { Frequency, GetOrbitHierarchyDocument, GetOrbitsDocument, Orbit, OrbitCreateParams, Scale, useCreateOrbitMutation, useGetOrbitQuery, useGetOrbitsQuery, useUpdateOrbitMutation } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { ActionHashB64 } from '@holochain/client';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentOrbitCoords, currentSphere } from '../../state/currentSphereHierarchyAtom';
import { AppState } from '../../routes';
import { mapToCacheObject, nodeCache, store } from '../../state/jotaiKeyValueStore';
import { client } from '../../main';
import DefaultSubmitBtn from './DefaultSubmitButton';
import { TextAreaField, TextInputField, SelectInputField } from 'habit-fract-design-system';
import { OrbitFetcher } from './utils';

// Define the validation schema using Yup
export const OrbitValidationSchema = Yup.object().shape({
  name: Yup.string().matches(/(?!^\d+$)^.+$/, 'Name must contain letters.').required('Name is required'),
  description: Yup.string().matches(/(?!^\d+$)^.+$/, 'Description must contain letters.'),
  startTime: Yup.number().min(0).required("Start date/time is required"),
  endTime: Yup.number(),
  frequency: Yup.mixed()
    .oneOf(Object.values(Frequency))
    .required('Choose a frequency'),
  scale: Yup.mixed()
    .oneOf(Object.values(Scale))
    .required('Choose a scale'),
  parentHash: Yup.string(),
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
}

const CreateOrbit: React.FC<CreateOrbitProps> = ({ editMode = false, inModal = false, orbitToEditId, sphereEh, parentOrbitEh, childOrbitEh, onCreateSuccess, headerDiv, submitBtn }: CreateOrbitProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const selectedSphere = store.get(currentSphere);
  const {x, y} = store.get(currentOrbitCoords);
  const inOnboarding = state.match('Onboarding');
  // Used to dictate onward routing
  const originPage : AppState = inOnboarding ? 'Onboarding2' : !!(parentOrbitEh || childOrbitEh) ? 'Vis' : 'ListOrbits';

  const [addOrbit] = useCreateOrbitMutation({
    awaitRefetchQueries: !inOnboarding && !!(parentOrbitEh || childOrbitEh),
    refetchQueries: () => inOnboarding ? [] : [
      {
        query: GetOrbitHierarchyDocument,
        variables: {
          params: { levelQuery: { sphereHashB64: selectedSphere.entryHash, orbitLevel: y } },
        },
      },
    ],
    async update(){
      if(inOnboarding) return;
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
    refetchQueries: [
      'getOrbits',
    ],
  });

  const { data: orbits, loading: getAllLoading, error } = useGetOrbitsQuery({ variables: { sphereEntryHashB64: sphereEh } });
  const loading = getAllLoading;

  const [currentOrbitValues, _] = useState<OrbitCreateParams | any>({
    name: '',
    description: '',
    startTime: DateTime.now().ts,
    endTime: DateTime.now().ts,
    frequency: Frequency.Day,
    scale: !!parentOrbitEh && parentOrbitEh !== 'root' ? Scale.Atom : Scale.Astro, // TODO make helper for including childOrbitEh
    archival: false,
    parentHash: !!childOrbitEh ? 'root' : parentOrbitEh ||'',
    childHash: childOrbitEh ||''
  });

  return (
    <Formik
      initialValues={currentOrbitValues}
      validationSchema={OrbitValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          if (!values.archival) delete values.endTime;
          delete values.archival;
          let response = editMode
            ? await updateOrbit({ variables: { orbitFields: { id: orbitToEditId, ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined } } })
            : await addOrbit({ variables: { variables: { ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined, childHash: values.childHash || undefined } } })
          setSubmitting(false);
          if(!response.data) return;
          const payload = response.data as any;
          if(originPage == 'Vis') {
            transition('Vis', { currentSphereEhB64: sphereEh, currentSphereAhB64: selectedSphere.actionHash}) 
          } else {
            const props = inOnboarding
              ? { refiningOrbitAh: payload.createOrbit.actionHash }
              : { sphereAh: selectedSphere.actionHash }
            transition(inOnboarding ? 'Onboarding3' : 'ListOrbits', props)
          }
        } catch (error) {
          console.error(error);
        }
      }}
      >
      {({ values, errors, touched }) => {

      return  (
        <>
          {!inModal ? headerDiv : null}
          <p className='form-description'>An orbit is a <em>specific life</em> action that your wish to track over time.</p>
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
                  required={true}
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

            {!parentOrbitEh && !inOnboarding && <div className="field">
              <Label htmlFor='parentHash'>Parent Orbit: <span className="reqd">*</span></Label>

              <div className="flex form-field">
                <Field type="text" name="parentHash">
                  {({ field }) => (
                    <Select 
                    {...field}
                    disabled={!!editMode}
                      color={errors.parentHash && touched.parentHash ? "invalid" : "default"}
                    >
                      <option value={'root'}>{'None'}</option>
                      { !childOrbitEh && (extractEdges((orbits as any)?.orbits) as Orbit[]).map((orbit, i) =>
                        <option key={i} value={orbit.eH}>{orbit.name}</option>
                      )
                      }
                    </Select>
                  )}
                </Field>
              </div>
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

            <div className="flex form-field">
              <Field
                component={SelectInputField}
                size="base"
                name="scale"
                id="scale"
                icon={"scale-planets"}
                iconSide={"left"}
                withInfo={true}
                options={Object.values(Scale).sort((a: any, b: any) => a - b).map((scale, i) => {
                  const cannotBeAstro = values.parentHash !== '' && values.parentHash !== 'root';
                  return cannotBeAstro && scale == 'Astro'
                    ? null
                    : <option key={scale} value={scale}>{scale}</option>
                  }
                )}
                required={true}
                labelValue={"Scale:"}
              />
            </div>

            {!inOnboarding && <Flex className={"field"} vertical={true}>
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
            </Flex>}
            { React.cloneElement(submitBtn as React.ReactElement, { loading, errors, touched }) || <DefaultSubmitBtn loading={loading} editMode={editMode} errors={errors} touched={touched}></DefaultSubmitBtn> }
          </Form>
        </>
      )}}
    </Formik>
  );
};

export default CreateOrbit;
