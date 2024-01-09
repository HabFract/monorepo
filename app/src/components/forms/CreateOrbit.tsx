import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"

import { Checkbox, Flex } from 'antd';
import DateInput from './input/DatePicker';
import { Button, TextInput, Label, Select, Textarea } from 'flowbite-react';

import { Frequency, Orbit, Scale, useCreateOrbitMutation, useGetOrbitsQuery } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';
import { CustomErrorLabel } from './CreateSphere';

// Define the validation schema using Yup
const OrbitValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  startTime: Yup.number().min(0).required("Start date/time is required"),
  endTime: Yup.number().min(0),
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
  sphereEh: string; // Link to a sphere
  parentOrbitEh: string | undefined; // Link to a parent Orbit to create hierarchies
}

const CreateOrbit: React.FC<CreateOrbitProps> = ({ sphereEh, parentOrbitEh }: CreateOrbitProps) => {
  const [addOrbit] = useCreateOrbitMutation({
    refetchQueries: [
      'getOrbits',
    ]
  });
  const { data: orbits, loading, error } = useGetOrbitsQuery({ variables: { sphereEntryHashB64: sphereEh } });

  return (
    <div className="form-container">
      <h2 className="form-title">Create Orbit</h2>
      <Formik
        initialValues={{
          name: '',
          description: '',
          startTime: DateTime.now().ts,
          endTime: DateTime.now().ts,
          frequency: Frequency.Day,
          scale: Scale.Astro,
          archival: false,
          parentHash: ''
        }}
        validationSchema={OrbitValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (!values.archival) delete values.endTime;
            delete values.archival;
            await addOrbit({ variables: { variables: { ...values, sphereHash: sphereEh, parentHash: parentOrbitEh ? parentOrbitEh : values.parentHash || undefined } } });
            setSubmitting(false);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {({ values, errors, touched }) => (
          <Form noValidate={true} className='gap-2'>
            <div className="field">
              <Label htmlFor='name'>Name: <span className="reqd">*</span></Label>

              <div className="flex flex-col gap-2">
                <Field as={TextInput} color={"default"} sizing="lg" autoComplete={'off'} type="text" name="name" id="name" required />
                {CustomErrorLabel('name', errors, touched)}
              </div>
            </div>

            <div className="field">
              <Label htmlFor='description'>Description:</Label>
              <div className="flex flex-col gap-2">
                <Field as={Textarea} color={"default"} autoComplete={'off'} type="text" name="description" id="description" />
                {CustomErrorLabel('description', errors, touched)}
              </div>
            </div>


            <div className="field">
              <Label htmlFor='name'>Parent Orbit: <span className="reqd">*</span></Label>

              <div className="flex flex-col gap-2">
                <Field name="parentHash">
                  {({ field }) => {
                    const innerOrbits = extractEdges((orbits as any)?.orbits) as Orbit[];
                    return <Select
                      {...field}
                      color={errors.parentHash && touched.parentHash ? "invalid" : "default"}
                    >
                      <option value={'root'}>{'None'}</option>
                      {
                        innerOrbits.length == 0
                          ? <></>
                          : innerOrbits.map((orbit, i) =>
                            <option key={i} value={orbit.eH}>{orbit.name}</option>
                          )
                      }
                    </Select>
                  }}
                </Field>
                {CustomErrorLabel('parentHash', errors, touched)}
              </div>
            </div>

            <div className="field">
              <Label htmlFor='name'>Frequency: <span className="reqd">*</span></Label>
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
              <Label htmlFor='name'>Scale: <span className="reqd">*</span></Label>
              <div className="flex flex-col gap-2">
                <Field name="scale" >
                  {({ field }) => (
                    <Select
                      {...field}
                      color={errors.scale && touched.scale ? "invalid" : "default"}
                    >
                      {Object.values(Scale).map((scale, i) =>
                        <option key={i} value={scale}>{scale}</option>
                      )
                      }
                    </Select>
                  )}
                </Field>
                {CustomErrorLabel('scale', errors, touched)}
              </div>
            </div>

            <Flex className={"field"} vertical={true}>
              <Flex justify='space-around'>
                <Label htmlFor='startTime'>Start<span className="reqd">*</span>/
                </Label>
                <Label htmlFor='endTime'>&nbsp; End:
                </Label>
              </Flex>
              <div className="flex flex-col gap-2 flex-1">
                <Field
                  name="startTime"
                  type="date"
                  component={DateInput}
                  defaultValue={values.startTime}
                  />
              </div>
              <div className="flex gap-4 justify-around flex-1">
                <Field
                  name="endTime"
                  type="date"
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
            </Flex>

            <Button type="submit" disabled={!!Object.values(errors).length} className="btn-primary">Create</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateOrbit;
