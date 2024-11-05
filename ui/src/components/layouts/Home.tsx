import { Field, Formik } from 'formik';
import './common.css'
import { useStateTransition } from '../../hooks/useStateTransition';
import { useState } from 'react';
import { string } from 'yup';
import { TextInputField } from 'habit-fract-design-system';

function HomeLayout({ startBtn, firstVisit = true }: any) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing
  const [currentPassword, setCurrentPassword] = useState<String>("");
  const passwordValidationSchema = string().min(8).max(18);

  return (
    <section className="home-layout">
      <header className="welcome-cta">
        <img
          className="logo"
          src="assets/new-logo.png"
          alt='Plannit logo'
        />
        <h3>Let's put a plan in motion!</h3>
        <div className="flex gap-4 items-center justify-center w-full">
          {[1, 2, 3, 4, 5].map(num => <img key={num} src={`/assets/icons/sphere-symbol-${num}.svg`}></img>)}
        </div>
      </header>
      <div className="login-options">
        <Formik
          initialValues={currentPassword}
          validationSchema={passwordValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setSubmitting(false);

              transition(firstVisit ? "Onboarding1" : "Vis");
            } catch (error) {
              console.error(error);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue }) => {
            return <div className="form-field">
            <Field
              component={TextInputField}
              size="base"
              name="name"
              id="name"
              icon={"tag"}
              iconSide={"left"}
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
          }}
        </Formik>
      </div>
    </section>
  );
}

export default HomeLayout;
