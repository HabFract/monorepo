import { useCreateSphereMutation as useCreateSphereMutationGenerated } from "../../graphql/generated";
import { appStateAtom } from "../../state/store";
import { useSetAtom } from "jotai";

export const useCreateSphereMutation = () => {
  const setAppState = useSetAtom(appStateAtom);

  return useCreateSphereMutationGenerated({
    refetchQueries: ["getSpheres"],
    update(_cache, { data }) {
      if (data?.createSphere) {
        const newSphere = data.createSphere;

        setAppState((prevState) => ({
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
        }));

        console.warn('Cache update from useCreateSphere')
      }
    },
  });
};
