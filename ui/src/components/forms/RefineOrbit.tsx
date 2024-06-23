import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';

import { Frequency, GetOrbitHierarchyDocument, GetOrbitsDocument, Orbit, OrbitCreateParams, Scale, useCreateOrbitMutation, useGetOrbitQuery, useGetOrbitsQuery, useUpdateOrbitMutation } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { ActionHashB64, EntryHashB64, decodeHashFromBase64 } from '@holochain/client';
import { useStateTransition } from '../../hooks/useStateTransition';
import { OrbitCard, TextAreaField, TextInputField, SelectInputField, HelperText } from 'habit-fract-design-system';
import { OrbitSubdivisionList } from '../lists';
import { SubdivisionScale } from '../lists/OrbitSubdivisionList';
import { OrbitFetcher } from './utils';
import { OrbitValidationSchema } from './CreateOrbit';

interface RefineOrbitProps {
  // refiningOrbitEh: string;
  refiningOrbitAh: string;

  submitBtn?: React.ReactNode;
  headerDiv?: React.ReactNode;
}

export enum Refinement {
  Update = 'update',
  Split = 'split',
  AddList = 'add-list',
}

const RefineOrbitOnboarding: React.FC<RefineOrbitProps> = ({ refiningOrbitAh, headerDiv, submitBtn }: RefineOrbitProps) => {
  const [state, transition] = useStateTransition(); // Top level state machine and routing

  return (
    <Formik
      style="max-width: 28rem;" 
      initialValues={{} as any}
      validationSchema={OrbitValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        // This doesn't actually need submitting, just using the context to use the Orbit Fetcher.
      }}
    >
      {({ values, errors, touched }) => {
        return  (
          <>
            {refiningOrbitAh && <OrbitFetcher orbitToEditId={refiningOrbitAh} />}
              { headerDiv }

              <h2 className='onboarding-subtitle'>Refine Your Orbit</h2>
              <p className='form-description'>
                {values.scale == Scale.Atom
                  ? <span>Make sure that you have been thoughtful about the best name for your Atomic Orbit before you continue</span>
                  : <span>Make sure that you have <em>broken down</em> your Orbit into smaller scales (as desired) before you are ready to start tracking!</span>
                }
              </p>
              
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
              <OrbitSubdivisionList submitBtn={submitBtn} currentOrbitValues={values} refinementType={values.scale == Scale.Atom ? Refinement.Update : Refinement.Split}></OrbitSubdivisionList>
          </>
      )}}
    </Formik>
  );
};

export default RefineOrbitOnboarding;
