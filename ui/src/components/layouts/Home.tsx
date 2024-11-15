import { Field, Form, Formik } from 'formik';
import './common.css'
import { useStateTransition } from '../../hooks/useStateTransition';
import { useState } from 'react';
import { object, string } from 'yup';
import { Button, SwipeUpTab, TextInputField } from 'habit-fract-design-system';
import { ListSpheres } from '../lists';
import { motion } from 'framer-motion';

function HomeLayout({ startBtn, firstVisit = true }: any) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing
  const validationSchema = object({
    password: string().min(8).max(18)
  });

  const initialValues = {
    password: ""
  };

  return (
    <section className="home-layout">
      {firstVisit
        ? <header className="welcome-cta">
          <img
            className="logo"
            src="assets/new-logo.png"
            alt='Plannit logo'
          />
          <h2>Let's put a plan in motion!</h2>
          <div className="flex items-center justify-center w-full gap-4">
            {[1, 2, 3, 4, 5].map(num => <img key={num} src={`/assets/icons/sphere-symbol-${num}.svg`}></img>)}
          </div>
        </header>
        : <header className="returning-cta">
            <div>
              <img
                className="logo"
                src="assets/new-logo.png"
                alt='Plannit logo'
              />
              <img
                className="avatar-placeholder"
                src="assets/icons/avatar-placeholder.svg"
                alt='Avatar Placeholder'
              />
            </div>
            <span>
              <h1>Welcome back! 👋</h1>
              <h2>Let's put a plan in motion! <em>I plan...</em></h2>
            </span>
            <div className="text-text dark:text-text-dark flex justify-around h-12 gap-4">
              <Button onClick={() => { transition("CreateSphere")}} type="button" variant="primary responsive"><img src="assets/icons/positive-spin.svg" className='w-8 h-8 my-1 mr-2 opacity-75'/>To Do</Button>
              <Button onClick={() => { transition("CreateSphere")}} type="button" variant="primary responsive"><img src="assets/icons/negative-spin.svg" className='w-8 h-8 my-1 mr-2 opacity-75'/>Not To Do</Button>
            </div>
          </header>
      }
      {firstVisit
        ? <div className="login-options">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                setSubmitting(false);
                if (!values.password) return;
                transition("Onboarding1");
              } catch (error) {
                console.error(error);
              }
            }}
          >
            {({ values, errors, touched, setFieldValue }) => {
              return <Form noValidate={true}>
                <div className="form-field">
                  <Field
                    component={TextInputField}
                    size="base"
                    name="password"
                    id="password"
                    withInfo={true}
                    isPassword={true}
                    onClickInfo={() => ({
                      title: "Why don't I have traditional login options?",
                      body: "This is what we call a Web 3 application - congratulations on being a part of the next web! //As a consequence there is no corporate cloud login, and all you need to be secure is a safe password.//Entering it again here is how you activate your public and private keys - your digital signature in the Planitt universe.// Write it somewhere and store it securely, since there is no password retrieval: you are responsible for your own keys.",
                    })}
                    required={true}
                    labelValue={"Password:"}
                    placeholder={"Enter your password"}
                  />
                </div>
              </Form>
            }}
          </Formik>
          {startBtn}
        </div>
        :
        <SwipeUpTab relativeElements={<></>} verticalOffset={-75} useViewportHeight={true}>
          {({ bindDrag }) => (
            <motion.div className="spaces-tab">
              <motion.div className="handle" {...bindDrag} style={{ touchAction: 'none', cursor: 'grab' }}>
                <span></span>
              </motion.div>

              <ListSpheres></ListSpheres>
            </motion.div>
          )}
        </SwipeUpTab>
      }
    </section>
  );
}

export default HomeLayout;
