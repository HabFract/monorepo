import { useEffect } from 'react';
import { store } from '../state/jotaiKeyValueStore';
import { useStateTransition } from './useStateTransition';
import { useAtomValue } from 'jotai';
import { currentSphere } from '../state/currentSphereHierarchyAtom';
import { sphereHasCachedNodesAtom } from '../state/sphere';
import { useToast } from '../contexts/toast';

export const useRedirect = (bypass?: boolean) => {
  const [_state, transition, params] = useStateTransition();
  const sphere = useAtomValue(currentSphere);
  const sphereHasCachedOrbits = useAtomValue(sphereHasCachedNodesAtom);
  const { showToast } = useToast();

  if(!sphere?.actionHash && params?.currentSphereAhB64) {
    store.set(currentSphere, {
        actionHash: params.currentSphereAhB64,
        entryHash: params.currentSphereEhB64,
    })
  }

  useEffect(() => {
    if(bypass) return;
    showToast("You need to create an Orbit before you can Visualise!", 5000, sphereHasCachedOrbits)

    if (!sphereHasCachedOrbits) {
      transition("CreateOrbit", {
        editMode: false,
        forwardTo: "Vis",
        sphereEh: sphere.entryHash,
      });
    }
  }, [sphereHasCachedOrbits, sphere.actionHash]);
};