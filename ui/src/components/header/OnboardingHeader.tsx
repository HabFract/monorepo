import { Button, ProgressBar } from "habit-fract-design-system";
import { currentOrbitIdAtom } from '../../state/orbit';

import { store } from "../../state/jotaiKeyValueStore";
import BackCaret from "../icons/BackCaret";
import { ForwardedRef, forwardRef } from "react";
import { isSmallScreen } from "../vis/helpers";
import { currentSphereHashesAtom } from "../../state/sphere";

const OnboardingHeader: React.ForwardRefExoticComponent<React.PropsWithoutRef<{state: any, transition: any} & unknown>> = forwardRef(({state, transition}, ref: ForwardedRef<HTMLDivElement>) => {
  if (!state.match("Onboarding")) return <></>
  const onboardingStageNumber = +(state.match(/Onboarding(\d+)/)?.[1]) || 0;
  return <>
    <div className={"flex w-full justify-between gap-2"}>
      <Button
        type={"icon"}
        icon={<BackCaret />}
        onClick={() => {
          const sphere = store.get(currentSphereHashesAtom);
          const orbit = store.get(currentOrbitIdAtom);
          const props = getLastOnboardingState(onboardingStageNumber).match("Onboarding1")
            ? { sphereToEditId: sphere?.actionHash }
            : getLastOnboardingState(onboardingStageNumber).match("Onboarding2")
              ? { sphereEh: sphere.entryHash, orbitToEditId: orbit?.id }
              : { orbitToEditId: orbit?.id };

          return transition(getLastOnboardingState(onboardingStageNumber), { editMode: true, ...props });
        }}>
      </Button>
      <h1 className={"onboarding-title"}>Make a Positive Habit</h1>
    </div>
    <div ref={ref}>
      <ProgressBar
        stepNames={isSmallScreen() ? ['Welcome', 'Create Sphere', 'Create Orbit', 'Refine Orbit', 'Visualize'] : ['Create Profile (N/A)', 'Create Sphere', 'Create Orbit', 'Refine Orbit', 'Visualize']}
        currentStep={onboardingStageNumber} />
    </div>
  </>;
});

function getLastOnboardingState(onboardingStageNumber: string) {
  if (+onboardingStageNumber == 1) return 'Home';
  return `Onboarding${(+onboardingStageNumber - 1)}`
};
const getNextOnboardingState = (onboardingStageNumber: string) => {
  if (+onboardingStageNumber == 3) return 'PreloadAndCache';
  return `Onboarding${(+onboardingStageNumber + 1)}`
};

export {getNextOnboardingState}

export default OnboardingHeader;