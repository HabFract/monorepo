import { atom } from "jotai";
import { vi } from "vitest";
import { mockedCacheEntries } from "./integration/mocks/mockNodeCache";
import mockAppState from "./integration/mocks/mockAppState";

import {
  currentSphereDetailsAtom,
  currentSphereHasCachedNodesAtom,
  currentSphereHashesAtom,
} from "../ui/src/state/sphere";
import {
  currentSphereHierarchyBounds,
  currentSphereHierarchyIndices,
} from "../ui/src/state/hierarchy";
import { currentSphereOrbitNodesAtom } from "../ui/src/state/orbit";

const currentSphereHash = mockAppState.spheres.currentSphereHash;
const currentSphere = mockAppState.spheres.byHash[currentSphereHash];
const currentHierarchyRootHash = currentSphere.hierarchyRootOrbitEntryHashes[0];
const currentHierarchy =
  mockAppState.hierarchies.byRootOrbitEntryHash[currentHierarchyRootHash];

/* 
/ Mocking jotai store functions
*/
const storeMock = {
  get: vi.fn((atom) => {
    // Direct mapping of atoms to their mocked values
    const atomMappings = {
      [currentSphereHashesAtom.toString()]: {
        entryHash: currentSphere.details.entryHash,
        actionHash: currentSphereHash,
      },
      [currentSphereDetailsAtom.toString()]: currentSphere,
      [currentSphereHasCachedNodesAtom.toString()]: true,
      [currentSphereHierarchyBounds.toString()]: currentHierarchy.bounds,
      [currentSphereHierarchyIndices.toString()]: currentHierarchy.indices,
      [currentSphereOrbitNodesAtom.toString()]: mockAppState.orbitNodes.byHash, // currently just mocking one sphere so no need to filter
    };
    return atomMappings[atom.toString()] || undefined;
  }),
  set: vi.fn(),
  sub: vi.fn(),
};

/* 
/ Mocking jotai indexDB atoms
*/
const nodeCacheMock = {
  item: vi.fn((sphereId) =>
    atom((get) => {
      // Return the mocked cache data for the given sphere
      return mockedCacheEntries[sphereId];
    })
  ),
  items: vi.fn((sphereId) =>
    atom((get) => {
      return mockedCacheEntries;
    })
  ),
  entries: vi.fn(() =>
    atom((get) => {
      return Object.entries(mockedCacheEntries);
    })
  ),
  setMany: vi.fn(() => atom((get, set) => {})),
  set: vi.fn(() => atom((get, set) => {})),
};

export const setupJotaiKeyValueStoreMock = () => {
  vi.mock("../../ui/src/state/jotaiKeyValueStore", () => ({
    store: storeMock,
    nodeCache: nodeCacheMock,
  }));
};
