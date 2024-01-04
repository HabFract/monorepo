import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { DateTime } from "luxon"

import { Checkbox, Flex } from 'antd';
import DateInput from './input/DatePicker';
import { Button, TextInput, Label, Select } from 'flowbite-react';

import { Frequency, Orbit, Scale, useCreateOrbitMutation, useGetOrbitsQuery } from '../../graphql/generated';
import { extractEdges } from '../../graphql/utils';

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
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Create Orbit</h2>
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
          <Form>
            <Label>
              <span>Name:</span>
              <Field as={TextInput} type="text" name="name" required />
            </Label>
            {errors.name && touched.name ? <div>{errors.name}</div> : null}

            <Label>
              <span>Description:</span>
              <Field as={TextInput} type="text" name="description" />
            </Label>
            {errors.description && touched.description ? <div>{errors.description}</div> : null}

            <Label>
              <span>Parent Orbit:</span>

              <Field name="parentHash">
                {({ field }) => {
                  const innerOrbits = extractEdges((orbits as any)?.orbits) as Orbit[];
                  return <Select
                    {...field}
                    color={errors.parentHash && touched.parentHash ? "failure" : ""}
                  >
                    {
                      innerOrbits.length == 0
                        ? <option value={'root'}>{'None'}</option>
                        : innerOrbits.map((orbit, i) =>
                          <option key={i} value={orbit.eH}>{orbit.name}</option>
                        )
                    }
                  </Select>
                }}
              </Field>
            </Label>
            {errors.description && touched.description ? <div>{errors.description}</div> : null}

            <Label>
              <span>Frequency:</span>
              <Field name="frequency" >
                {({ field }) => (
                  <Select
                    {...field}
                    color={errors.frequency && touched.frequency ? "failure" : ""}
                  >
                    {Object.values(Frequency).map((freq, i) =>
                      <option key={i} value={freq}>{freq}</option>
                    )
                    }
                  </Select>
                )}
              </Field>
            </Label>
            {errors.frequency && touched.frequency ? <div>{errors.frequency}</div> : null}

            <Label>
              <span>Scale:</span>
              <Field name="scale" >
                {({ field }) => (
                  <Select
                    {...field}
                    color={errors.scale && touched.scale ? "failure" : ""}
                  >
                    {Object.values(Scale).map((scale, i) =>
                      <option key={i} value={scale}>{scale}</option>
                    )
                    }
                  </Select>
                )}
              </Field>
            </Label>
            {errors.scale && touched.scale ? <div>{errors.scale}</div> : null}

            <Flex vertical={true}>
              <Flex justify='space-around' align='center'>
                <Label htmlFor='startTime'>
                  <span>Start:</span>
                </Label>
                <Label htmlFor='startTime'>
                  <span>End (archival):</span>
                </Label>
              </Flex>
              <Flex justify='space-around' align='center'>
                <Field
                  name="startTime"
                  type="date"
                  component={DateInput}
                  defaultValue={values.startTime}
                />

                <Field
                  name="endTime"
                  type="date"
                  component={DateInput}
                  disabled={(!values.archival)}
                  defaultValue={values.endTime}
                />
              </Flex>
              <Flex justify='space-around' align='center'>
                <div></div>
                <Field name="archival" >
                  {({ field }) => (
                    <Checkbox
                      {...field}
                    // onChange={async (e) => {  setFieldValue('archival', e.target.checked) }}
                    >Archival?</Checkbox>
                  )}
                </Field>
              </Flex>
              <Flex justify='space-around' align='center'>
                {errors.startTime && touched.startTime ? <div>{errors.startTime}</div> : <div></div>}
                {errors.endTime && touched.endTime ? <div>{errors.endTime}</div> : <div></div>}
              </Flex>
            </Flex>

            <Button type="submit" className="mt-4">Create Orbit</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateOrbit;
