import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"

import { Checkbox, Flex } from 'antd';
import DateInput from '../input/DatePicker';
import { TextInput, Label, Select, Textarea } from 'flowbite-react';

import { Frequency, GetOrbitHierarchyDocument, GetOrbitsDocument, Orbit, OrbitCreateParams, Scale, useCreateOrbitMutation, useGetOrbitQuery, useGetOrbitsQuery, useUpdateOrbitMutation } from '../../../graphql/generated';
import { extractEdges } from '../../../graphql/utils';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { useStateTransition } from '../../../hooks/useStateTransition';
import { currentOrbitCoords, currentSphere } from '../../../state/currentSphereHierarchyAtom';
import { AppState } from '../../../routes';
import { mapToCacheObject, nodeCache, store } from '../../../state/jotaiKeyValueStore';
import { client } from '../../../main';
import DefaultSubmitBtn from '../DefaultSubmitButton';
import { AlertOutlined } from '@ant-design/icons';

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
  childOrbitEh: string | undefined; // Link to a child Orbit to create hierarchies
  submitBtn?: React.ReactNode;
}

const CreateOrbitOnboarding: React.FC<CreateOrbitProps> = ({ editMode = false, inModal = false, orbitToEditId, sphereEh, parentOrbitEh, childOrbitEh, onCreateSuccess, submitBtn }: CreateOrbitProps) => {
  const [_state, transition] = useStateTransition(); // Top level state machine and routing
  const selectedSphere = store.get(currentSphere);
  const {x, y} = store.get(currentOrbitCoords);
  // Used to dictate onward routing
  const originPage : AppState = !!(parentOrbitEh || childOrbitEh) ? 'Vis' : 'ListOrbits';

  const [addOrbit] = useCreateOrbitMutation({
    awaitRefetchQueries: !!(parentOrbitEh || childOrbitEh),
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

  const [currentOrbitValues, _] = useState<OrbitCreateParams>({
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
    <div className="form-container">
      {!inModal && <h2 className="form-title">{editMode ? "Update" : "Create"} Orbit</h2>}
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
            originPage == 'Vis' 
              ? transition('Vis', { currentSphereEhB64: sphereEh, currentSphereAhB64: selectedSphere.actionHash}) 
              : transition('ListOrbits', { sphereAh: selectedSphere.actionHash })
          } catch (error) {
            console.error(error);
          }
        }}
        >
        {({ values, errors, touched, setFieldTouched, handleChange }) => {
        return  (
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
                    { !childOrbitEh && (extractEdges((orbits as any)?.orbits) as Orbit[]).map((orbit, i) =>
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
            { submitBtn || <DefaultSubmitBtn loading={loading} editMode={editMode} errors={errors} touched={touched}></DefaultSubmitBtn> }
          </Form>
        )}}
      </Formik>
    </div>
  );
};

export default CreateOrbitOnboarding;
