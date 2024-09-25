import { useCreateOrbitMutation as useCreateOrbitMutationGenerated } from "../../graphql/generated";
import { appStateAtom } from "../../state/store";
import { useSetAtom } from "jotai";
import { Orbit } from "../../graphql/generated";

export const useCreateOrbitMutation = () => {
  const setAppState = useSetAtom(appStateAtom);

  return useCreateOrbitMutationGenerated({
    refetchQueries: ["getOrbits"],
    update(_cache, { data }) {
      if (data?.createOrbit) {
        const newOrbit = data.createOrbit as Orbit;

        setAppState((prevState) => {
          const updatedState = { ...prevState };

          // Update orbitNodes
          updatedState.orbitNodes = {
            ...prevState.orbitNodes,
            currentOrbitHash: newOrbit.id,
            byHash: {
              ...prevState.orbitNodes.byHash,
              [newOrbit.id]: {
                id: newOrbit.id,
                eH: newOrbit.eH,
                name: newOrbit.name,
                scale: newOrbit.scale,
                frequency: newOrbit.frequency,
                startTime: newOrbit.startTime,
                endTime: newOrbit.endTime,
                description: newOrbit.description,
                parentEh: newOrbit.parentHash,
                path: "", // You might need to generate this path
              },
            },
          };

          // Update hierarchies if this is a root orbit
          if (!newOrbit.parentHash) {
            const sphereHash = newOrbit.sphereHash;
            updatedState.spheres.byHash[sphereHash].hierarchyRootOrbitEntryHashes.push(newOrbit.eH);

            updatedState.hierarchies.byRootOrbitEntryHash[newOrbit.eH] = {
              rootNode: newOrbit.eH,
              json: JSON.stringify({
                content: newOrbit.eH,
                name: newOrbit.name,
                children: [],
              }),
              bounds: { minBreadth: 0, maxBreadth: 0, minDepth: 0, maxDepth: 0 },
              indices: { x: 0, y: 0 },
              currentNode: newOrbit.eH,
              nodeHashes: [newOrbit.eH],
            };
          } else {
            // Update parent's children in hierarchy
            Object.values(updatedState.hierarchies.byRootOrbitEntryHash).forEach((hierarchy) => {
              const hierarchyJson = JSON.parse(hierarchy.json);
              const updateChildren = (node: any) => {
                if (node.content === newOrbit.parentHash) {
                  if (!node.children) node.children = [];
                  node.children.push({
                    content: newOrbit.eH,
                    name: newOrbit.name,
                  });
                  return true;
                }
                return node.children?.some(updateChildren);
              };
              if (updateChildren(hierarchyJson)) {
                hierarchy.json = JSON.stringify(hierarchyJson);
                hierarchy.nodeHashes.push(newOrbit.eH);
                // Update bounds and indices if necessary
              }
            });
          }

          return updatedState;
        });
      }
    },
  });
};