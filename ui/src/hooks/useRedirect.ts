import { useEffect } from 'react';
import { SphereOrbitNodes } from '../state/jotaiKeyValueStore';
import { useStateTransition } from './useStateTransition';
import { useAtomValue } from 'jotai';
import { currentSphere } from '../state/currentSphereHierarchyAtom';
import { sphereNodesAtom } from '../state/sphere';
import { useToast } from '../contexts/toast';

export const useRedirect = () => {
  const [_state, transition, params] = useStateTransition();
  const sphereNodeDetails = useAtomValue(sphereNodesAtom);
  const sphere = useAtomValue(currentSphere);
  const { showToast } = useToast();
console.log('used RedirecT!')
  useEffect(() => {
    const redirectToCreatePage = sphereNodeDetails && Object.values(sphereNodeDetails).length === 0;
    // showToast("You need to create an Orbit before you can Visualise!", redirectToCreatePage ? 5000 : 0)
    if (redirectToCreatePage) {
      transition("CreateOrbit", {
        editMode: false,
        forwardTo: "Vis",
        sphereEh: sphere.entryHash,
      });
    }
  }, [sphere]);
};