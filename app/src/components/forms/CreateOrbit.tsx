import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"

import { Checkbox, Flex } from 'antd';
import DateInput from './input/DatePicker';
import { Button, TextInput, Label, Select, Textarea } from 'flowbite-react';

import { Frequency, GetOrbitHierarchyDocument, GetOrbitsDocument, Orbit, OrbitCreateParams, Scale, useCreateOrbitMutation, useGetOrbitQuery, useGetOrbitsQuery, useUpdateOrbitMutation } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { CustomErrorLabel } from './CreateSphere';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentOrbitCoords, currentSphere } from '../../state/currentSphereHierarchyAtom';
import { AppState } from '../../routes';
import { mapToCacheObject, nodeCache, store } from '../../state/jotaiKeyValueStore';
import { client } from '../../main';

// Define the validation schema using Yup
const OrbitValidationSchema = Yup.object().shape({
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

const OrbitFetcher = ({orbitToEditId}) => {
  const { setValues } = useFormikContext();

  const {data: getData, error: getError, loading: getLoading } = useGetOrbitQuery({
    variables: {
      id: orbitToEditId as string
    },
  });

  useEffect(() => {
      const {  name, sphereHash: parentHash, frequency, scale, metadata: {description, timeframe:  {startTime, endTime} }} = getData!.orbit as any;
      
      setValues({
        name, description, startTime, endTime: endTime || undefined, frequency, scale, archival: !!endTime, parentHash
      })
  }, [getData])
  return null;
};

interface CreateOrbitProps {
  editMode: boolean;
  inModal: boolean;
  onCreateSuccess?: Function;
  orbitToEditId?: ActionHashB64;
  sphereEh: string; // Link to a sphere
  parentOrbitEh: string | undefined; // Link to a parent Orbit to create hierarchies
}

const CreateOrbit: React.FC<CreateOrbitProps> = ({ editMode = false, inModal = false, orbitToEditId, sphereEh, parentOrbitEh, onCreateSuccess }: CreateOrbitProps) => {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing
  const selectedSphere = store.get(currentSphere);

  const {x, y} = store.get(currentOrbitCoords);

  // Used to dictate onward routing
  const originPage : AppState = !!parentOrbitEh ? 'Vis' : 'ListOrbits';

  const [addOrbit] = useCreateOrbitMutation({
    awaitRefetchQueries: !!parentOrbitEh,
    refetchQueries: () => [
      {
        query: GetOrbitHierarchyDocument,
        variables: {
          params: { levelQuery: { sphereHashB64: selectedSphere.entryHash, orbitLevel: y } },
        },
      },
    ],
    async update(){
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

  const [orbitValues, _] = useState<OrbitCreateParams & any>({
    name: '',
    description: '',
    startTime: DateTime.now().ts,
    endTime: DateTime.now().ts,
    frequency: Frequency.Day,
    scale: !!parentOrbitEh && parentOrbitEh !== 'root' ? Scale.Atom : Scale.Astro,
    archival: false,
    parentHash: parentOrbitEh ||''
  });
  console.log('sphereEh :>> ', sphereEh);
  return (
    <div className="form-container">
      {!inModal && <h2 className="form-title">{editMode ? "Update" : "Create"} Orbit</h2>}
      <Formik
        initialValues={orbitValues}
        validationSchema={OrbitValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (!values.archival) delete values.endTime;
            delete values.archival;
            editMode
              ? await updateOrbit({ variables: { orbitFields: { id: orbitToEditId, ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined } } })
              : await addOrbit({ variables: { variables: { ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined } } })
            setSubmitting(false);
            originPage == 'Vis' ? transition('Vis', { currentSphereEhB64: selectedSphere.entryHash, currentSphereAhB64: selectedSphere.actionHash }) : transition('ListOrbits', { sphereAh: selectedSphere.actionHash })
          } catch (error) {
            console.error(error);
          }
        }}
        >
        {({ values, errors, touched, setFieldTouched, handleChange }) => (
          <Form noValidate={true}>
            {editMode && <OrbitFetcher orbitToEditId={orbitToEditId} />}
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
                onChange={(e) => { setFieldTouched(e.target.name); handleChange(e) }} />
                {CustomErrorLabel('description', errors, touched)}
              </div>
            </div>


            {!parentOrbitEh && <div className="field">
              <Label htmlFor='parentHash'>Parent Orbit: <span className="reqd">*</span></Label>

              <div className="flex flex-col gap-2">
                <Field type="text" name="parentHash">
                {({ field }) => (
                  <Select 
                  {...field}
                  disabled={!!editMode}
                    color={errors.parentHash && touched.parentHash ? "invalid" : "default"}
                  >
                    <option value={'root'}>{'None'}</option>
                    {(extractEdges((orbits as any)?.orbits) as Orbit[]).map((orbit, i) =>
                      <option key={i} value={orbit.eH}>{orbit.name}</option>
                    )
                    }
                  </Select>
                )}
              </Field>
                {CustomErrorLabel('parentHash', errors, touched)}
              </div>
            </div>}

            <div className="field">
              <Label htmlFor='frequency'>Frequency: <span className="reqd">*</span>
              </Label>
              <div className="flex flex-col gap-2">
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
            </div>

            <div className="field">
              <Label htmlFor='scale'>Scale: <span className="reqd">*</span></Label>
              <div className="flex flex-col gap-2">
                <Field name="scale" >
                  {({ field }) => {
                    const cannotBeAstro = values.parentHash !== '' && values.parentHash !== 'root';
                    return (
                    <Select
                      {...field}
                      color={errors.scale && touched.scale ? "invalid" : "default"}
                    >
                      {Object.values(Scale).sort((a: any, b: any) => a - b).map((scale, i) => {
                        return cannotBeAstro && scale == 'Astro'
                          ? null
                          : <option key={scale} value={scale}>{scale}</option>
                        }
                      )
                      }
                    </Select>
                  )}}
                </Field>
                {CustomErrorLabel('scale', errors, touched)}
              </div>
            </div>

            <Flex className={"field"} vertical={true}>
              <Flex justify='space-around'>
                <Label htmlFor='startTime'>Start<span className="reqd">*</span><span className="hidden-sm">/</span>
                </Label>
                <Label htmlFor='endTime'>&nbsp; End:
                </Label>
              </Flex>
              <div className="flex flex-wrap items-start">
                <div className="flex flex-col gap-2 flex-1">
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
                      // onChange={async (e) => {  setFieldValue('archival', e.target.checked) }}
                      >Archival?</Checkbox>
                    )}
                  </Field>
                </div>
              </div>
            </Flex>

            <Button type="submit" disabled={loading || !!Object.values(errors).length || !!(Object.values(touched).filter(value => value).length < 1)} className={editMode ? "btn-warn" : "btn-primary"}>
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
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateOrbit;
