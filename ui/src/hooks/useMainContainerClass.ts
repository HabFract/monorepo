import { useState, useEffect } from 'react';
import { AppMachine } from '../main';

function getMainContainerClassString(state: string): string {
  switch (state) {
    case 'Home':
      return "home page-container";
    case 'Vis':
      return "vis page-container";
    case 'CreateSphere':
      return "create-form page-container form-container";
    case 'CreateOrbit':
      return "create-form page-container form-container";
    case 'ListOrbits':
      return "list page-container";
    case 'ListSpheres':
      return "list page-container";
    case 'Onboarding1':
      return "onboarding page-container";
    case 'Onboarding2':
      return "onboarding page-container";
    case 'Onboarding3':
      return "onboarding page-container";
    default:
      return "page-container";
  }
}

export function useMainContainerClass() {
  const [mainContainerClass, setMainContainerClass] = useState<string>("page-container");

  useEffect(() => {
    setMainContainerClass(getMainContainerClassString(AppMachine.state.currentState));
  }, [AppMachine.state.currentState]);

  return mainContainerClass;
}