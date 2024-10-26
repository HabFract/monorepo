import { useCreateSphereMutation as useCreateSphereMutationGenerated } from "../../graphql/generated";
import { appStateAtom } from "../../state/store";
import { useAtom, useSetAtom } from "jotai";

export const useCreateSphereMutation = () => {
  const [prevState, setAppState] = useAtom(appStateAtom);

  return useCreateSphereMutationGenerated({
    refetchQueries: ["getSpheres"],
    update(_cache, { data }) {
      if (data?.createSphere) {
        const newSphere = data.createSphere;

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
