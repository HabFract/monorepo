
import { Field, Form, Formik } from 'formik';
import './common.css';

import { HelperText, TextInputField } from 'habit-fract-design-system';
import { useState } from 'react';
import { array, object } from 'yup';
import List from '../icons/List';

enum SubdivisionScale {
  Micro = "Micro",
  Atom = "Atom",
}

interface OrbitSubdivisionListProps {
  listItemScale: SubdivisionScale
}

const ListValidationSchema = object().shape({
  list: array(),
});

const OrbitSubdivisionList: React.FC<OrbitSubdivisionListProps> = () => {
  const [listSize, setListSize] = useState<number>(1);

  return (
    <div className='layout orbit-subdivision-list'>
      <Formik
      initialValues={{list: [""]}}
      validationSchema={ListValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
      }}
      >
      {({ values, errors, touched }) => {
        
      return  (
        <>
          <HelperText
            title={"Define Micro Orbits"}
            titleIcon={<List />}
            onClickInfo={() => console.log("clicked!")}
          >Since you have chosen the MICRO scale for your orbit, you can now<em> add 1-4 micro-steps</em> which can be ticked off on completion (a procees we call a <em>WIN</em>).
          </HelperText>
          <Form noValidate={true}>
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
          </Form>
        </>
      )}}
    </Formik>
    </div>
  );
}

export default OrbitSubdivisionList;
