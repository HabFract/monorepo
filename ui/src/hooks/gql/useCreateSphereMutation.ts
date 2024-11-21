import { useCreateSphereMutation as useCreateSphereMutationGenerated } from "../../graphql/generated";
import { appStateAtom, store } from "../../state/store";
import { useAtom, useSetAtom } from "jotai";

export const useCreateSphereMutation = () => {
  const setAppState = useSetAtom(appStateAtom);

  return useCreateSphereMutationGenerated({
    refetchQueries: ["getSpheres"],
    update(_cache, { data }) {
      if (data?.createSphere) {
        const newSphere = data.createSphere;
        const prevState = store.get(appStateAtom);
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
