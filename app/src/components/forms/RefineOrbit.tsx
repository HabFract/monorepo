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
import { OrbitCard, TextAreaField, TextInputField, SelectInputField, HelperText } from 'habit-fract-design-system';
import { OrbitSubdivisionList } from '../lists';
import { SubdivisionScale } from '../lists/OrbitSubdivisionList';
import { useAtom } from 'jotai';
import { subdivisionListAtom } from '../../state/subdivisionListAtom';
import { OrbitFetcher } from './utils';
import { OrbitValidationSchema } from './CreateOrbit';

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


  return (
    <Formik
      initialValues={{} as any}
      validationSchema={OrbitValidationSchema}
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
          {refiningOrbitAh && <OrbitFetcher orbitToEditId={refiningOrbitAh} />}
          <div className='test'>
            { headerDiv }
            <p className='form-description'>Make sure that you have chosen the <em>best specifics</em> for your orbit, before you are ready to start tracking!</p>
            <HelperText onClickInfo={() => console.log("clicked!")}>WHY THIS MATTERS: </HelperText>

            {values?.name && 
              <OrbitCard
                displayOnly={true}
                sphereEh={values.sphereHash}
                orbit={{
                  name: values.name,
                  scale: values.scale,
                  frequency: values.frequency,
                  metadata:
                    {
                      description:values.description,
                      timeframe: {
                        startTime: values.startTime,
                        endTime: values.endTime,
                      }
                    }
                }} 
            ></OrbitCard>}
            <OrbitSubdivisionList submitBtn={submitBtn} listItemScale={SubdivisionScale.Atom}></OrbitSubdivisionList>
          </div>
        </>
      )}}
    </Formik>
  );
};

export default RefineOrbitOnboarding;
