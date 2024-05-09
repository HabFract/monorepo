import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"

import { Checkbox, Flex } from 'antd';
import DateInput from './input/DatePicker';
import { TextInput, Label, Select, Textarea } from 'flowbite-react';

import { Frequency, GetOrbitHierarchyDocument, GetOrbitsDocument, Orbit, OrbitCreateParams, Scale, useCreateOrbitMutation, useGetOrbitQuery, useGetOrbitsQuery, useUpdateOrbitMutation } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { ActionHashB64, EntryHashB64, decodeHashFromBase64 } from '@holochain/client';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentOrbitCoords, currentSphere } from '../../state/currentSphereHierarchyAtom';
import { AppState } from '../../routes';
import { mapToCacheObject, nodeCache, store } from '../../state/jotaiKeyValueStore';
import { client } from '../../main';
import { TextAreaField, TextInputField, SelectInputField, HelperText } from 'habit-fract-design-system';
import { OrbitSubdivisionList } from '../lists';
import { SubdivisionScale } from '../lists/OrbitSubdivisionList';
import { useAtom } from 'jotai';
import { subdivisionListAtom } from '../../state/subdivisionListAtom';

export const OrbitFetcher = ({orbitToEditId}) => {
  const { setValues } = useFormikContext();

  const {data: getData, error: getError, loading: getLoading } = useGetOrbitQuery({
    variables: {
      id: orbitToEditId as string
    },
  });

  useEffect(() => {
    console.log('getData :>> ', getData);
      if(typeof getData == "undefined") return;
      const {  name, sphereHash: parentHash, frequency, scale, metadata: {description, timeframe:  {startTime, endTime} }} = getData!.orbit as any;
      
      setValues({
        name, description, startTime, endTime: endTime || undefined, frequency, scale, archival: !!endTime, parentHash
      })
  }, [getLoading])

  return null;
};

interface RefineOrbitProps {
  // refiningOrbitEh: string;
  refiningOrbitAh: string;

  submitBtn?: React.ReactNode;
  headerDiv?: React.ReactNode;
}

enum Refinement {
  Update = 'update',
  Split = 'split',
  AddList = 'add-list',
}

const RefineOrbitOnboarding: React.FC<RefineOrbitProps> = ({ refiningOrbitAh, headerDiv, submitBtn }: RefineOrbitProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing
  const editMode : Refinement = Refinement.Update; 
 
  const loading = false;


  const [list, setList] = useAtom(subdivisionListAtom);
  
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
        return  (
        <>
          { refiningOrbitAh && <OrbitFetcher orbitToEditId={refiningOrbitAh} />}
          <div className='test'>
            { headerDiv }
            <p className='form-description'>Make sure that you have chosen the <em>best specifics</em> for your orbit, before you are ready to start tracking!</p>
            <HelperText onClickInfo={() => console.log("clicked!")}>WHY THIS MATTERS: </HelperText>
              <OrbitSubdivisionList listItemScale={SubdivisionScale.Atom}></OrbitSubdivisionList>
              { React.cloneElement(submitBtn as React.ReactElement, { loading, errors, touched }) }
          </div>
        </>
      )}}
    </Formik>
  );
};

export default RefineOrbitOnboarding;
