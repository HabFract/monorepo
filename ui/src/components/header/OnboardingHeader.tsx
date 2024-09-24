import { Button, ProgressBar } from "habit-fract-design-system";
import { currentSphere } from "../../state/currentSphereHierarchyAtom";
import { currentOrbitId } from '../../state/orbit';

import { store } from "../../state/jotaiKeyValueStore";
import BackCaret from "../icons/BackCaret";
import { ForwardedRef, forwardRef } from "react";
import { isSmallScreen } from "../vis/helpers";
import { currentSphereHashesAtom } from "../../state/sphere";

const OnboardingHeader: React.ForwardRefExoticComponent<React.PropsWithoutRef<{state: any, transition: any} & unknown>> = forwardRef(({state, transition}, ref: ForwardedRef<HTMLDivElement>) => {
  if (!state.match("Onboarding")) return <></>

  return <>
    <div className={"flex w-full justify-between gap-2"}>
      <Button
        type={"icon"}
        icon={<BackCaret />}
        onClick={() => {
          const sphere = store.get(currentSphereHashesAtom);
          const orbit = store.get(currentOrbitId);
          const props = getLastOnboardingState(state).match("Onboarding1")
            ? { sphereToEditId: sphere?.actionHash }
            : getLastOnboardingState(state).match("Onboarding2")
              ? { sphereEh: sphere.entryHash, orbitToEditId: orbit?.id }
              : { orbitToEditId: orbit?.id };

          return transition(getLastOnboardingState(state), { editMode: true, ...props });
        }}>
      </Button>
      <h1 className={"onboarding-title"}>Make a Positive Habit</h1>
    </div>
    <div ref={ref}>
      <ProgressBar
        stepNames={isSmallScreen() ? ['Welcome', 'Create Sphere', 'Create Orbit', 'Refine Orbit', 'Visualize'] : ['Create Profile (N/A)', 'Create Sphere', 'Create Orbit', 'Refine Orbit', 'Visualize']}
        currentStep={+(state.match(/Onboarding(\d+)/)?.[1])} />
    </div>
  </>;
});

function getLastOnboardingState(state: string) {
  if (state == 'Onboarding1') return 'Home';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) - 1}`
};
const getNextOnboardingState = (state: string) => {
  if (state == 'Onboarding3') return 'PreloadAndCache';
  return `Onboarding${+(state.match(/Onboarding(\d+)/)![1]) + 1}`
};

export {getNextOnboardingState}

export default OnboardingHeader;