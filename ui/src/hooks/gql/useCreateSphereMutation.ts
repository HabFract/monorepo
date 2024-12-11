import { useCreateSphereMutation as useCreateSphereMutationGenerated } from "../../graphql/generated";
import { appStateChangeAtom, store } from "../../state/store";
import { useAtom, useSetAtom } from "jotai";

export const useCreateSphereMutation = () => {
  const setAppState = useSetAtom(appStateChangeAtom);

  return useCreateSphereMutationGenerated({
    refetchQueries: ["getSpheres"],
    update(_cache, { data }) {
      if (data?.createSphere) {
        const newSphere = data.createSphere;
        const prevState = store.get(appStateChangeAtom);
        const updatedState = {
          ...prevState,
          spheres: {
            ...prevState.spheres,
            currentSphereHash: newSphere.actionHash,
            byHash: {
              ...prevState.spheres.byHash,
              [newSphere.actionHash]: {
                details: {
                  entryHash: newSphere.entryHash,
                  name: newSphere.name,
                },
                hierarchyRootOrbitEntryHashes: [],
              },
            },
          },
        };
        setAppState(updatedState);

        console.warn("Cache update from useCreateSphere");
      }
    },
  });
};
