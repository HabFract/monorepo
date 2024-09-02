import { ReactNode, FC } from "react";
import Breadcrumbs from "../../navigation/Breadcrumbs";
import Home from "../../layouts/Home";
import Onboarding from "../../layouts/Onboarding";
import { AnimatePresence, motion } from "framer-motion";
import { Sphere } from "../../../graphql/generated";

function withPageTransition(page: ReactNode) {
  return (
    <AnimatePresence mode='wait'>
      <motion.div
        className='framer-motion'
        key={+(new Date)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {page}
      </motion.div>
    </AnimatePresence>
  )
}

interface WithLayoutProps {
  currentSphereDetails: Sphere,
  newUser: boolean
}

const withLayout = (component: ReactNode, state: any, transition: any, params: any): FC<WithLayoutProps> => {
  return (props: WithLayoutProps): ReactNode => {
    switch (true) {
      case !!(state.match("Onboarding")):
        return <Onboarding>
          {withPageTransition(component)}
        </Onboarding>;
      case ["Home", "PreloadAndCache"].includes(state):
        if (state == "Home" && props?.newUser) return <Home firstVisit={false}></Home>
        return withPageTransition(component)
      default:
        return <div className='p-1 w-full'>
          <Breadcrumbs state={state} transition={transition} currentSphere={props?.currentSphereDetails} isFormEditMode={params?.editMode}></Breadcrumbs>
          {component}
        </div>
    }
  }
}

export default withLayout;