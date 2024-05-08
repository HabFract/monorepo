import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"

import { Checkbox, Flex } from 'antd';
import DateInput from './input/DatePicker';
import { TextInput, Label, Select, Textarea } from 'flowbite-react';

import { Frequency, GetOrbitHierarchyDocument, GetOrbitsDocument, Orbit, OrbitCreateParams, Scale, useCreateOrbitMutation, useGetOrbitQuery, useGetOrbitsQuery, useUpdateOrbitMutation } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentOrbitCoords, currentSphere } from '../../state/currentSphereHierarchyAtom';
import { AppState } from '../../routes';
import { mapToCacheObject, nodeCache, store } from '../../state/jotaiKeyValueStore';
import { client } from '../../main';
import { TextAreaField, TextInputField, SelectInputField, HelperText } from 'habit-fract-design-system';
import { OrbitFetcher } from './utils';
import { OrbitSubdivisionList } from '../lists';


interface RefineOrbitProps {
  // refiningOrbitEh: string;
  refiningOrbitAh: string;

  submitBtn?: React.ReactNode;
  headerDiv?: React.ReactNode;

  // onCreateSuccess?: Function;
  // sphereEh: string; // Link to a sphere
  // parentOrbitEh: string | undefined; // Link to a parent Orbit to create hierarchies
}

enum Refinement {
  Update = 'update',
  Split = 'split',
  AddList = 'add-list',
}

const RefineOrbitOnboarding: React.FC<RefineOrbitProps> = ({ refiningOrbitAh, headerDiv, submitBtn }: RefineOrbitProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  console.log('refiningOrbitAh, refiningOrbitEh :>> ', refiningOrbitAh);
  const editMode : Refinement = Refinement.Update; 
  // const selectedSphere = store.get(currentSphere);
  // const {x, y} = store.get(currentOrbitCoords);
  // const inOnboarding = state.match('Onboarding');
  // // Used to dictate onward routing
  // const originPage : AppState = inOnboarding ? 'Onboarding2' : !!(parentOrbitEh || childOrbitEh) ? 'Vis' : 'ListOrbits';

  // const [addOrbit] = useCreateOrbitMutation({
  //   awaitRefetchQueries: !!(parentOrbitEh || childOrbitEh),
  //   refetchQueries: () => [
  //     {
  //       query: GetOrbitHierarchyDocument,
  //       variables: {
  //         params: { levelQuery: { sphereHashB64: selectedSphere.entryHash, orbitLevel: y } },
  //       },
  //     },
  //   ],
  //   async update(){
  //     const variables = { sphereEntryHashB64: sphereEh };
  //     let data;
  //     try {
  //       const gql = await client;
  //       data = await gql.query({ query: GetOrbitsDocument, variables, fetchPolicy: 'network-only'} )
  //       if(data?.data?.orbits) {
  //         const orbits = (extractEdges(data.data.orbits) as Orbit[]);
  //         const indexedOrbitData = Object.entries(orbits.map(mapToCacheObject))
  //           .map(([_idx, value]) => [value.eH, value]);
  //         store.set(nodeCache.set, selectedSphere.actionHash as ActionHashB64, Object.fromEntries(indexedOrbitData))
  //         console.log('Sphere orbits fetched and cached!')
  //       }

  //       if(typeof onCreateSuccess !== 'undefined') {
  //         onCreateSuccess!.call(this)
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // });
  // const [updateOrbit] = useUpdateOrbitMutation({
  //   refetchQueries: [
  //     'getOrbits',
  //   ],
  // });

  // const { data: orbits, loading: getAllLoading, error } = useGetOrbitsQuery({ variables: { sphereEntryHashB64: sphereEh } });
  // const loading = getAllLoading;

  // const [currentOrbitValues, _] = useState<OrbitCreateParams | any>({
  //   name: '',
  //   description: '',
  //   startTime: DateTime.now().ts,
  //   endTime: DateTime.now().ts,
  //   frequency: Frequency.Day,
  //   scale: !!parentOrbitEh && parentOrbitEh !== 'root' ? Scale.Atom : Scale.Astro, // TODO make helper for including childOrbitEh
  //   archival: false,
  //   parentHash: !!childOrbitEh ? 'root' : parentOrbitEh ||'',
  //   childHash: childOrbitEh ||''
  // });

  const loading = false;

  return (
    <Formik
      initialValues={{} as any}
      validationSchema={{} as any}
      onSubmit={async (values, { setSubmitting }) => {
        // try {
        //   if (!values.archival) delete values.endTime;
        //   delete values.archival;
        //   let response = editMode
        //     ? await updateOrbit({ variables: { orbitFields: { id: orbitToEditId, ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined } } })
        //     : await addOrbit({ variables: { variables: { ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined, childHash: values.childHash || undefined } } })
        //   setSubmitting(false);
        //   if(!response.data) return;
        //   if(originPage == 'Vis') {
        //     transition('Vis', { currentSphereEhB64: sphereEh, currentSphereAhB64: selectedSphere.actionHash}) 
        //   } else {
        //     transition(inOnboarding ? 'Onboarding3' : 'ListOrbits', { sphereAh: selectedSphere.actionHash })
        //   }
        // } catch (error) {
        //   console.error(error);
        // }
      }}
      >
      {({ values, errors, touched }) => {
console.log('values :>> ', values);
      return  (
        <>
          { headerDiv }
          <p className='form-description'>Make sure that you have chosen the <em>best specifics</em> for your orbit, before you are ready to start tracking!</p>
          <HelperText onClickInfo={() => console.log("clicked!")}>WHY THIS MATTERS: </HelperText>
          <Form noValidate={true}>
            {editMode.toString() == "update"
              ? <OrbitFetcher orbitToEditId={refiningOrbitAh} />
              : null
            }

            <div className="flex flex-col gap-2">
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

            <div className="flex flex-col gap-2">
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

            <OrbitSubdivisionList></OrbitSubdivisionList>
            { React.cloneElement(submitBtn as React.ReactElement, { loading, errors, touched }) }
          </Form>
        </>
      )}}
    </Formik>
  );
};

export default RefineOrbitOnboarding;
