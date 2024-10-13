import { vi } from "vitest";
import mockAppState from "./integration/mocks/mockAppState";

import { ActionHashB64 } from "@holochain/client";
import { Frequency } from "../ui/src/state/types";
import { SPHERE_ID } from "./integration/mocks/mockAppState";

export const mockedCacheEntries = [
  [
    SPHERE_ID,
    {
      uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
        id: "uhCAkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        eH: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        name: "Be the best",
        scale: "Astro",
        description: "Focus on physical health, exercise, and nutrition.",
        startTime: 1617235100,
        endTime: undefined,
        frequency: Frequency.LESS_THAN_DAILY.QUARTERLY,
      },
      uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc: {
        id: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        eH: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        name: "Daily Exercise",
        scale: "Sub",
        description: "Engage in daily physical activities for better health.",
        startTime: 1617235150,
        endTime: 1617321600,
        frequency: Frequency.DAILY_OR_MORE.DAILY,
      },
      uhCEkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc: {
        id: "uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
        eH: "uhCEkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        name: "Weekly Gym Session",
        scale: "Sub",
        description:
          "Strength training to build muscle and increase metabolism.",
        startTime: 1617235200,
        endTime: 1617321600,
        frequency: Frequency.LESS_THAN_DAILY.WEEKLY,
      },
      uhCEkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
        id: "uhCAkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        eH: "uhCEkYpV9Xt7j5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc",
        name: "Daily Meditation",
        scale: "Atom",
        description:
          "Practice mindfulness and reduce stress through daily meditation.",
        startTime: 1617235250,
        endTime: 1617321650,
        frequency: Frequency.DAILY_OR_MORE.TWO,
      },
      uhCEkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc: {
        id: "uhCAkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        eH: "uhCEkZmN8Lk3Xj5ZDCj6oH8hpg9xgN9qNXKVK9EgLQxNoc",
        sphereHash: "uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX",
        parentEh: "uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj",
        name: "Monthly Health Check",
        scale: "Molecule",
        description: "Regular health check-ups to monitor overall well-being.",
        startTime: 1617235300,
        endTime: 1617321700,
        frequency: Frequency.LESS_THAN_DAILY.MONTHLY,
      },
    },
  ],
];
const customMocks = new Map<ActionHashB64, any>();

export const createTestIndexDBAtom = (initialCache?) => {
  const cache = Object.fromEntries(initialCache || []);

  return {
    items: {
      toString: vi.fn(),
      init: [],
      read: () => cache,
      write: () => {},
    },
    entries: {
      toString: () => {},
      init: [],
      read: () => Object.entries(cache),
      write: () => {},
    },
    keys: {
      toString: () => {},
      init: [],
      read: () => Object.keys(cache),
      write: () => {},
    },
    item: (sphereId: ActionHashB64) => {
      const customMock = customMocks.get("partial");
      if (customMock) {
        return {
          toString: vi.fn(() => {}),
          init: [],
          read: () => {
            return customMock?.[sphereId];
          },
          write: () => {},
        };
      }
      return {
        toString: vi.fn(() => {}),
        init: [],
        read: () => {
          return cache[sphereId];
        },
        write: () => {},
      };
    },
  };
};

// Function to add custom mocks
export const addCustomMock = (
  descriptor: string,
  mock: Partial<typeof mockedCacheEntries>
) => {
  customMocks.set(descriptor, Object.fromEntries(mock as any));
  console.log("new custommock :>> ", descriptor, customMocks.get(descriptor));
};

// Function to clear all custom mocks (useful in beforeEach or afterEach hooks)
export const clearCustomMocks = () => {
  customMocks.clear();
};

const currentSphereHash = mockAppState.spheres.currentSphereHash;
const currentSphere = mockAppState.spheres.byHash[currentSphereHash];
const currentHierarchyRootHash = currentSphere.hierarchyRootOrbitEntryHashes[0];
const currentHierarchy =
  mockAppState.hierarchies.byRootOrbitEntryHash[currentHierarchyRootHash];

const storeMock = {
  get: (atom) => {
    // Direct mapping of atoms to their mocked values
    const atomMappings = {
      currentSphereHashesAtom: {
        entryHash: currentSphere.details.entryHash,
        actionHash: currentSphereHash,
      },
      currentSphereDetailsAtom: currentSphere,
      currentSphereHasCachedNodesAtom: true,
      currentSphereHierarchyBounds: currentHierarchy.bounds,
      currentSphereHierarchyIndices: currentHierarchy.indices,
      currentSphereOrbitNodesAtom: mockAppState.orbitNodes.byHash,
    };
    return atomMappings[atom.toString()] || undefined;
  },
  set: vi.fn(),
  sub: vi.fn(),
};

const mockNodeCache = createTestIndexDBAtom(mockedCacheEntries);

export const mockStore = { store: storeMock, nodeCache: mockNodeCache };
