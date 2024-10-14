import { useEffect, useState } from "react";
import { store } from "../state/store";
import { useStateTransition } from "./useStateTransition";
import { useAtomValue } from "jotai";
import {
  currentSphereHasCachedNodesAtom,
  currentSphereHashesAtom,
} from "../state/sphere";
import { useToast } from "../contexts/toast";
import { Orbit, useGetOrbitsLazyQuery } from "../graphql/generated";
import { extractEdges } from "../graphql/utils";

/**
 * Hook to redirect if we don't have sufficient data to render the page.
 * @param bypass if we want to bypass the hook entirely
 *
 */
export const useRedirect = (bypass?: boolean) => {
  const [state, transition] = useStateTransition();
  const sphere = useAtomValue(currentSphereHashesAtom);
  const sphereHasCachedOrbits = useAtomValue(currentSphereHasCachedNodesAtom);
  useEffect(() => {
    if (bypass || sphereHasCachedOrbits) return;
    
    if (!sphere?.actionHash || !sphereHasCachedOrbits) {
      console.log('sphereHasCachedOrbits :>> ', sphereHasCachedOrbits);
      transition('PreloadAndCache');
    }
  }, [bypass, sphere, sphereHasCachedOrbits, transition]);

  // const sphereHasCachedOrbits = useAtomValue(currentSphereHasCachedNodesAtom);
  // const { showToast } = useToast();
  // const [hasFetched, setHasFetched] = useState<boolean>(false);
  // const [getOrbits, { data: orbits, loading: getAllLoading, error }] =
  //   useGetOrbitsLazyQuery({
  //     fetchPolicy: "network-only",
  //     variables: { sphereEntryHashB64: sphere.entryHash },
  //   });

  // // First check for a current Sphere context
  // if (!sphere?.actionHash && params?.currentSphereAhB64) {
  //   store.set(currentSphereHashesAtom, {
  //     actionHash: params.currentSphereAhB64,
  //     entryHash: params.currentSphereEhB64,
  //   });
  // }
  // // Then use orbits query if we have a Sphere
  // useEffect(() => {
  //   if (!sphere?.actionHash) return;
  //   getOrbits();
  //   setHasFetched(true);
  // }, [sphere?.actionHash]);

  // // Use orbits query to check if we have orbits we could cache, If so, redirect
  // useEffect(() => {
  //   if (bypass || !orbits || sphereHasCachedOrbits) return;

  //   const orbitEdges = extractEdges((orbits as any)?.orbits) as Orbit[];

  //   orbitEdges.length > 0 &&
  //     !sphereHasCachedOrbits &&
  //     transition("PreloadAndCache", {
  //       landingSphereEh: sphere.entryHash,
  //       landingSphereId: sphere.actionHash,
  //       landingPage: state,
  //     });
  // }, [bypass, sphereHasCachedOrbits, getOrbits]);

  // useEffect(() => {
  //   if (bypass || !hasFetched || error || getAllLoading) return;

  //   const firstVisit = !orbits;
  //   console.log("firstVisit :>> ", firstVisit);
  //   transition(firstVisit ? "FirstHome" : "Home");
  //   // showToast(
  //   //   "You need to create an Orbit before you can Visualise!",
  //   //   5000,
  //   //   sphereHasCachedOrbits
  //   // );
  //   // if (!sphereHasCachedOrbits) {
  //   //   transition("CreateOrbit", {
  //   //     editMode: false,
  //   //     forwardTo: "Vis",
  //   //     sphereEh: sphere.entryHash,
  //   //   });
  //   // }
  // }, [isSameSphere]);
};
