
import { Field, Form, Formik } from 'formik';
import './common.css';

import { HelperText, TextInputField } from 'habit-fract-design-system';
import { useRef, useState } from 'react';
import { array, object } from 'yup';
import List from '../icons/List';
import { PlusCircleFilled } from '@ant-design/icons';

export enum SubdivisionScale {
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
  const [listItems, setListItems] = useState<string[]>([]);
  const [currentListItem, setCurrentListItem] = useState<string>("");

  const currentInputReference = useRef(null);

  return (
    <div className='layout orbit-subdivision-list'>
      <Formik
      initialValues={{list: listItems}}
      validationSchema={ListValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
      }}
      >
      {({ values, errors, touched }) => {
        console.log(listItems)
      return  (
        <>
          <HelperText
            title={"Define Micro Orbits"}
            titleIcon={<List />}
            onClickInfo={() => console.log("clicked!")}
          >Since you have chosen the MICRO scale for your orbit, you can now<em> add 1-4 micro-steps</em> which can be ticked off on completion (this is what we call a <em>WIN</em>).
          </HelperText>
          <Form noValidate={true}>{
          listItems.map((value, idx) => {
            return <div className="flex flex-col gap-2" key={idx}>
                <Field
                  component={TextInputField}
                  size="base"
                  name="name"
                  value={value}
                  id="name"
                  icon={"save"}
                  iconSide={"right"}
                  withInfo={false}
                  required={false}
                  isListItem={true}
                  labelValue={`${idx + 1}: `}
                  placeholder={"E.g. Run for 10 minutes"}
                />
            </div>})}
            <div ref={currentInputReference} className="flex flex-col gap-2">
                <Field
                  component={TextInputField}
                  size="base"
                  name="name"
                  onBlur={({target, currentTarget}) => {
                    if(listItems.length > 3) return; // TODO: inform user
                    target.value !== "" && setListItems([...listItems, target.value]);
                    target.value = "";
                    currentTarget.focus()
                  }}
                  id="name"
                  icon={"pencil"}
                  iconSide={"right"}
                  withInfo={false}
                  required={false}
                  isListItem={true}
                  labelValue={"Add:"}
                  placeholder={"E.g. Run for 10 minutes"}
                />
            </div>
            <div className="text-link w-full flex justify-center hover:text-gray-300">
              <PlusCircleFilled onClick={() => { 
                const currentValue = (currentInputReference.current as any).querySelector("input")?.value;
                if(currentValue && currentValue !== "") setListItems([...listItems, currentValue])}
                }
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
