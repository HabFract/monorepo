import { useEffect } from "react";
import { store } from "../state/jotaiKeyValueStore";
import { useStateTransition } from "./useStateTransition";
import { useAtomValue } from "jotai";
import {
  currentSphereAtom,
  currentSphereHasCachedNodesAtom,
  currentSphereHashesAtom,
} from "../state/sphere";
import { useToast } from "../contexts/toast";
import { Orbit, useGetOrbitsQuery } from "../graphql/generated";
import { extractEdges } from "../graphql/utils";
import { currentSphereOrbitNodesAtom } from "../state/orbit";

export const useRedirect = (bypass?: boolean) => {
  const [_state, transition, params] = useStateTransition();
  const sphere = useAtomValue(currentSphereHashesAtom);
  const isSameSphere =
    (params?.landingSphereId &&
      sphere.actionHash &&
      params.landingSphereId !== sphere.actionHash) ||
    (params?.currentSphereAhB64 &&
      sphere.actionHash &&
      params.currentSphereAhB64 !== sphere.actionHash);
  if (isSameSphere) return;

  const sphereHasCachedOrbits = useAtomValue(currentSphereHasCachedNodesAtom);
  const { showToast } = useToast();
  // First check for a current Sphere context
  if (!sphere?.actionHash && params?.currentSphereAhB64) {
    store.set(currentSphereHashesAtom, {
      actionHash: params.currentSphereAhB64,
      entryHash: params.currentSphereEhB64,
    });
  }
  const {
    data: orbits,
    loading: getAllLoading,
    error,
  } = useGetOrbitsQuery({
    fetchPolicy: "network-only",
    variables: { sphereEntryHashB64: sphere.entryHash },
  });
  // Use orbits query to check if we have orbits (but might still need to cache, so redirect)
  useEffect(() => {
    if (!orbits || bypass || sphereHasCachedOrbits) return;
    const orbitEdges = extractEdges((orbits as any)?.orbits) as Orbit[];
    console.log(
      "orbitEdges.length > 0 && !sphereHasCachedOrbits :>> ",
      orbitEdges.length > 0 && !sphereHasCachedOrbits,
    );
    orbitEdges.length > 0 &&
      !sphereHasCachedOrbits &&
      transition("PreloadAndCache", {
        landingSphereEh: sphere.entryHash,
        landingSphereId: sphere.actionHash,
      });
  }, [sphereHasCachedOrbits, orbits]);

  useEffect(() => {
    if (bypass) return;
    showToast(
      "You need to create an Orbit before you can Visualise!",
      5000,
      sphereHasCachedOrbits,
    );
    if (!sphereHasCachedOrbits) {
      transition("CreateOrbit", {
        editMode: false,
        forwardTo: "Vis",
        sphereEh: sphere.entryHash,
      });
    }
  }, [isSameSphere]);
};
