import { Field, Form, Formik, FieldArray } from 'formik';
import './common.css';
import * as Yup from 'yup';
import { Button, HelperText, TextInputField, SelectInputField } from 'habit-fract-design-system';
import Split from '../icons/Split';
import Pencil from '../icons/Pencil';
import { MinusCircleFilled, PlusCircleFilled } from '@ant-design/icons';
import React, { useState } from 'react';
import { Frequency, Orbit, Scale, useCreateOrbitMutation, useUpdateOrbitMutation } from '../../graphql/generated';
import { getDisplayName } from '../forms/CreateOrbit';
import { Label } from 'flowbite-react';
import { serializeAsyncActions } from '../../graphql/utils';
import { store } from '../../state/jotaiKeyValueStore';
import { currentSphere } from '../../state/currentSphereHierarchyAtom';
import { Refinement } from '../forms/RefineOrbit';
import { OrbitFetcher } from '../forms/utils';

interface OrbitSubdivisionListProps {
  currentOrbitValues: Orbit;
  refinementType: Refinement;
  submitBtn?: React.ReactNode;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(() => r(null), ms));

const OrbitSubdivisionList: React.FC<OrbitSubdivisionListProps> = ({ submitBtn, refinementType, currentOrbitValues: { scale: currentScale, eH: currentHash, id } }) => {
  const ListValidationSchema = Yup.object().shape({
    list: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().min(3, 'Must be 4 characters or more').max(55, 'Must be 55 characters or less').required('Required'),
      }),
    ),
    scale: Yup.mixed()
      .oneOf(Object.values(Scale))
      .required('Choose a scale'),
  });

  const [addOrbit] = useCreateOrbitMutation({});
  const [updateOrbit] = useUpdateOrbitMutation({});
  const [submitRefineBtnIsLoading, setSubmitRefineBtnIsLoading] = useState<boolean>(false);
  return (
    <div className='layout orbit-subdivision-list'>
      <Formik
        initialValues={refinementType == Refinement.Update ? { name: "" } : { list: [{ name: "" }], scale: Scale.Atom }}
        validationSchema={ListValidationSchema}
        onSubmit={async (values: any, { setSubmitting }) => {
          setSubmitting(false);
          const sphere = store.get(currentSphere);
          if(!sphere?.entryHash || !currentHash) throw new Error("No sphere set or parent hash, cannot refine orbits")
          setSubmitRefineBtnIsLoading(true)
          try {
            if(refinementType == Refinement.Update) {
              await updateOrbit({ variables: {orbitFields: {
                name: values.name,
                id: values.id,
                startTime: values.startTime,
                endTime: values.endTime,
                frequency: values.frequency,
                scale: values.scale,
                parentHash: values.parentHash,
                sphereHash: sphere?.entryHash,
              }}});

              (submitBtn as any).props.onClick.call(null)
            } else {
              const { list, scale } = values;
              serializeAsyncActions<any>(
                [
                  ...list!.map(
                    (orbit) => 
                      async () => {
                        addOrbit(
                          { variables: {variables: {name: orbit.name, scale, frequency: Frequency.Day, startTime: +(new Date()), sphereHash: sphere.entryHash as string, parentHash: currentHash as string } } }
                        );
                        await sleep(500);
                    }
                  ),
                  async() => Promise.resolve(console.log('New orbit subdivisions created! :>> ')),
                  async() => ((submitBtn as any).props).onClick.call(null) // Complete the onboarding transition
                ]
              );
            }
          } catch (error) {
            setSubmitRefineBtnIsLoading(false)
            console.error(error)
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, submitForm }) => {
          return (
            <>
              { refinementType == Refinement.Update && <OrbitFetcher orbitToEditId={id}></OrbitFetcher>}
              <HelperText
                title={refinementType == Refinement.Update ? "Refine Atomic Orbit Name" : "Break Up High Scale Orbits"}
                titleIcon={refinementType == Refinement.Update ? <Pencil /> : <Split />}
                withInfo={false}
              >
                {refinementType == Refinement.Update
                  ? <span>Since you have chosen the Atomic scale for your Orbit, it's best to make sure it is named in a way that is an <em>incremental action</em> - one that is quantifiable and achievable:</span>
                  : <span>Since you have chosen a big scale for your Orbit (shooting for the stars!) you can now <em>break it up</em> into incremental actions - so start by <em>subdividing into Orbits of a smaller scale</em>:</span>
                }
              </HelperText>

              { refinementType == Refinement.Split && values.scale == Scale.Atom && <HelperText
                title={"Refine Atomic Orbit Names"}
                titleIcon={<Pencil />}
                withInfo={false}
              >
                <span>Since you have chosen the Atomic scale for your new Orbits, it's best to make sure the new Orbits are named in a way that is an <em>incremental action</em> - one that is quantifiable and achievable.</span>
              </HelperText>}

              <Form noValidate={true} style={{gridColumn: "-2/-1", gridRow: "1/-1", }}>
                <div className="flex flex-col gap-0">
                  {refinementType == Refinement.Update
                    ? <Field
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
                    : <>
                      <Field
                        component={SelectInputField}
                        size="base"
                        name="scale"
                        id="scale"
                        icon={"scale-planets"}
                        iconSide={"left"}
                        withInfo={false}
                        options={chooseLowerScales(currentScale)?.sort((a: any, b: any) => a - b).map((scale) => {
                            return <option key={scale} value={scale}>{getDisplayName(scale)}</option>
                          }
                        )}
                        required={true}
                        labelValue={"Scale for New Orbits:"}
                      />
                      <Label htmlFor='list'>New Orbit Names: <span className="reqd">*</span></Label>
                      <FieldArray
                        name="list"
                        render={arrayHelpers => (
                          <>
                            {values!.list!.map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <Field
                                  component={TextInputField}
                                  size="base"
                                  name={`list[${index}].name`}
                                  value={item.name}
                                  id={`list[${index}].name`}
                                  icon={index == values!.list!.length -1 ? "pencil" : "save"}
                                  iconSide={"right"}
                                  withInfo={false}
                                  required={false}
                                  isListItem={true}
                                  labelValue={`${index + 1}: `}
                                  placeholder={"E.g. Run for 10 minutes"}
                                />
                                <button style={{opacity: index > 0 ? 1 : 0}} className="flex flex-1 text-danger w-full flex justify-center hover:text-danger-500" type="button" onClick={() => arrayHelpers.remove(index)}>
                                  <MinusCircleFilled />
                                </button>
                              </div>
                            ))}

                            { errors.list && <Label className='my-1 text-warn'>All names must be a valid length</Label>}
                            {values!.list!.length <= 3 && <button
                              className="flex flex-1 text-link w-8 mx-auto flex justify-center hover:text-primary"
                              type="button"
                              onClick={() => arrayHelpers.push({ name: "" })}
                              disabled={values!.list!.length >= 4}
                            >
                              <PlusCircleFilled />
                            </button>}
                          </>
                        )}
                      />
                    </>
                  }
                </div>
                <span><Button type={'onboarding'} loading={submitRefineBtnIsLoading} onClick={() => submitForm()}>{refinementType == Refinement.Update ? "Update Name" : "Create Orbits"}</Button></span> </Form>
            </>
          )
        }}
      </Formik>
    </div>
  );
}

export default OrbitSubdivisionList;

function chooseLowerScales(scale: Scale) : Scale[] {
  switch (scale) {
    case Scale.Astro:
      return [Scale.Sub, Scale.Atom]
    case Scale.Sub:
      return [Scale.Atom]
    case Scale.Atom:
      return []
  default:
      return []
  }
}