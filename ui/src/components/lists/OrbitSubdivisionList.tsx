
import { Field, Form, Formik, FieldArray } from 'formik';
import './common.css';
import * as Yup from 'yup';
import { HelperText, TextInputField } from 'habit-fract-design-system';
import List from '../icons/List';
import { MinusCircleFilled, PlusCircleFilled } from '@ant-design/icons';
import React from 'react';

export enum SubdivisionScale {
  Rename = "Rename",
  Atom = "Atom",
}

interface OrbitSubdivisionListProps {
  listItemScale: SubdivisionScale;
  submitBtn?: React.ReactNode;
}

const OrbitSubdivisionList: React.FC<OrbitSubdivisionListProps> = ({ submitBtn, listItemScale }) => {
  const ListValidationSchema = Yup.object().shape({
    list: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().max(255, 'Must be 255 characters or less').required('Required')
      })
    )
  });

  return (
    <div className='layout orbit-subdivision-list'>
      <Formik
        initialValues={{ list: [{ name: "" }] }}
        validationSchema={ListValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          // console.log(values);
          setSubmitting(false);
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => {
          return (
            <>
              <HelperText
                title={listItemScale == SubdivisionScale.Rename ? "Rename Atomic Orbit" : "Break Up High Scale Orbits"}
                titleIcon={<List />}
                onClickInfo={() => console.log("clicked!")}
              >
                {listItemScale == SubdivisionScale.Rename
                  ? <span>Since you have chosen the Atomic scale for your Orbit, it's best to make sure it is named in a way that is an incremental action - one that is quantifiable and achievable:</span>
                  : <span>Since you have chosen a big scale for your Orbit (shooting for the stars!), you can now <em>break it up</em> into incremental actions - so start by <em>subdividing into Orbits of a smaller scale</em>:</span>
                }
              </HelperText>

              <Form noValidate={true}>
                <div className="flex flex-col gap-2">
                  <FieldArray
                    name="list"
                    render={arrayHelpers => (
                      <>
                        {values.list.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Field
                              component={TextInputField}
                              size="base"
                              name={`list[${index}].name`}
                              value={item.name}
                              id={`list[${index}].name`}
                              icon={index == values.list.length -1 ? "pencil" : "save"}
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
                        {values.list.length <= 3 && <button
                          className="flex flex-1 text-link w-8 mx-auto flex justify-center hover:text-primary"
                          type="button"
                          onClick={() => arrayHelpers.push({ name: "" })}
                          disabled={values.list.length >= 4}
                        >
                          <PlusCircleFilled />
                        </button>}
                      </>
                    )}
                  />
                </div>
                {React.cloneElement(submitBtn as React.ReactElement, { errors, touched })}
              </Form>
            </>
          )
        }}
      </Formik>
    </div>
  );
}

export default OrbitSubdivisionList;
