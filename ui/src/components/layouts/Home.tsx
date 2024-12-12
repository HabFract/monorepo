import { Field, Form, Formik } from 'formik';
import './common.css'
import { useStateTransition } from '../../hooks/useStateTransition';
import { object, string } from 'yup';
import { Button, getIconSvg, SwipeUpScreenTab, TextInputField } from 'habit-fract-design-system';
import { ListSpheres } from '../lists';
import { motion } from 'framer-motion';
import { Popover, ListGroup } from 'flowbite-react';
import { BUTTON_ACTION_TEXT, ERROR_MESSAGES, INPUT_INFO_MODALS, PAGE_COPY } from '../../constants';

function HomeLayout({ firstVisit = true }: any) {
  const [_, transition] = useStateTransition(); // Top level state machine and routing
  const validationSchema = object({
    password: string()
      .min(8, ERROR_MESSAGES['password-short'])
      .max(18, ERROR_MESSAGES['password-long'])
      .required(ERROR_MESSAGES['password-empty'])
  });

  const routeToSettings = () => transition("Settings");

  return (
    <section className="home-layout">
      {firstVisit
        ? <header className="welcome-cta">
          <img
            className="logo"
            src="assets/logo.svg"
            alt='Planitt logo'
          />
          <h2>{PAGE_COPY['slogan']}</h2>
          <div className="flex items-center justify-center w-full gap-4">
            {[1, 2, 3, 4, 5].map(num => <img key={num} src={`/assets/icons/sphere-symbol-${num}.svg`}></img>)}
          </div>
        </header>
        : <header className="returning-cta">
          <div>
            <img
              className="logo"
              src="assets/logo.svg"
              alt='Planitt logo'
            />
            <div className="avatar-menu mt-2">
              <Popover
                content={<ListGroup
                  className="list-group-override w-32">
                  <ListGroup.Item disabled={true} onClick={() => { }} icon={getIconSvg('user')}>Profile</ListGroup.Item>
                  <ListGroup.Item onClick={routeToSettings} icon={getIconSvg('settings')}>Settings</ListGroup.Item>
                </ListGroup>
                }
              >
                <Button type='button' variant='circle-icon-lg'>
                  <img
                    src="assets/icons/avatar-placeholder.svg"
                    alt='Avatar Placeholder'
                  />
                </Button>
              </Popover>
            </div>
          </div>
          <span>
            <h1>Welcome back! 👋</h1>
            <h2>{PAGE_COPY['slogan']} <em>Plan to...</em></h2>
          </span>
          <div className="text-text dark:text-text-dark flex justify-around h-12 gap-4">
            <Button onClick={() => { transition("Onboarding1", { spin: 'positive' }) }} type="button" variant="primary responsive">
              <svg
                className="w-6 h-6 my-1 mr-2" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.3333 9C17.3333 13.6024 13.6024 17.3333 8.99999 17.3333C4.39762 17.3333 0.666656 13.6024 0.666656 9C0.666656 4.39763 4.39762 0.666666 8.99999 0.666666C13.6024 0.666666 17.3333 4.39763 17.3333 9ZM8.99999 4.91667C9.4142 4.91667 9.74999 5.25245 9.74999 5.66667V8.25H12.3333C12.7475 8.25 13.0833 8.58579 13.0833 9C13.0833 9.41421 12.7475 9.75 12.3333 9.75H9.74999V12.3333C9.74999 12.7475 9.4142 13.0833 8.99999 13.0833C8.58578 13.0833 8.24999 12.7475 8.24999 12.3333V9.75H5.66666C5.25244 9.75 4.91666 9.41421 4.91666 9C4.91666 8.58579 5.25244 8.25 5.66666 8.25H8.24999V5.66667C8.24999 5.25245 8.58578 4.91667 8.99999 4.91667Z" fill="white" />
              </svg>
              {BUTTON_ACTION_TEXT['positive-spin-cta']}</Button>
            <Button
              isDisabled={true}
              onClick={() => { transition("CreateSphere", { spin: 'negative' }) }}
              type="button"
              variant="secondary responsive"
            >
              <svg className='w-6 h-6 my-1 mr-2' width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.99998 17.3333C13.6024 17.3333 17.3333 13.6023 17.3333 8.99997C17.3333 4.39758 13.6024 0.666615 8.99998 0.666615C4.39759 0.666615 0.666626 4.39758 0.666626 8.99997C0.666626 13.6023 4.39759 17.3333 8.99998 17.3333ZM12.3333 9.74994C12.7475 9.74994 13.0833 9.41415 13.0833 8.99994C13.0833 8.58573 12.7475 8.24994 12.3333 8.24994L5.66666 8.24994C5.25245 8.24994 4.91666 8.58573 4.91666 8.99994C4.91666 9.41415 5.25245 9.74994 5.66666 9.74994L12.3333 9.74994Z" fill="white" />
              </svg>
              {BUTTON_ACTION_TEXT['negative-spin-cta']}
            </Button>
          </div>
        </header>
      }
      {firstVisit
        ? <div className="login-options">
          <Formik
            initialValues={{ password: "password" }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              try {
                if (values.password) {
                  transition("Onboarding1");
                }
              } catch (error) {
                console.error(error);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, submitForm }) => {
              return <Form noValidate>
                <div className="form-field gap-8">
                  <Field
                    disabled
                    component={TextInputField}
                    size="base"
                    name="password"
                    id="password"
                    withInfo={true}
                    isPassword={true}
                    onClickInfo={() => INPUT_INFO_MODALS['password']}
                    required={true}
                    labelValue={"Password:"}
                    placeholder={INPUT_INFO_MODALS['password'].placeholder}
                  />
                  <Button type={"button"} isDisabled={isSubmitting} variant={"primary responsive"} onClick={() => submitForm()}>
                    Sign In
                  </Button>

                </div>

                <div className="text-text dark:text-text-dark opacity-80 flex items-center justify-center gap-8 mt-2 text-base text-center">
                  <div>
                    <h3>Powered by</h3>
                    <img
                      className="w-80"
                      src="assets/holochain-logo.png"
                      alt='Holochain logo'
                    />
                  </div>
                  <p>{PAGE_COPY['password-notice']}</p>
                </div>
              </Form>
            }}
          </Formik>
        </div>
        :
        <SwipeUpScreenTab verticalOffset={(12 * 16) + 8} useViewportHeight={false}>
          {({ bindDrag }) => (
            <motion.div {...bindDrag} className="spaces-tab">
              <motion.div className="handle" {...bindDrag} style={{ touchAction: 'none', cursor: 'grab' }}>
                <span></span>
              </motion.div>

              <ListSpheres></ListSpheres>
            </motion.div>
          )}
        </SwipeUpScreenTab>
      }
    </section>
  );
}

export default HomeLayout;
