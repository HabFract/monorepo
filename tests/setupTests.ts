import { vi } from 'vitest';
import "fake-indexeddb/auto";

import indexedDB from 'fake-indexeddb';

window.indexedDB = indexedDB;

import '@testing-library/react/dont-cleanup-after-each';
import { mockedCacheEntries } from "./integration/mocks/cache";
import { SPHERE_ID } from "./integration/mocks/spheres";

import { atom } from "jotai";
import { SortCriteria, SortOrder } from "../ui/src/state/listSortFilterAtom";

/* 
/ Mocking the jotai indexdb store atoms for node details in the vis
*/
let mockNodeDetailsCache = mockedCacheEntries;
let mockNodeDetailsCacheKeys: string[] = Object.keys(
  Object.fromEntries(mockNodeDetailsCache)
);
let mockNodeDetailsCacheItems = Object.fromEntries(mockNodeDetailsCache);

export function setMockNodeDetailsCache(params: typeof mockedCacheEntries) {
  mockNodeDetailsCache = params;
  mockNodeDetailsCacheKeys = Object.keys(
    Object.fromEntries(mockNodeDetailsCache)
  );
  mockNodeDetailsCacheItems = Object.fromEntries(params);
}

vi.mock("../ui/src/state/jotaiKeyValueStore", (importOriginal) => ({
  ...importOriginal,
  nodeCache: {
    entries: atom(mockNodeDetailsCache),
    keys: atom(mockNodeDetailsCacheKeys),
    items: atom(mockNodeDetailsCacheItems),
  },
  store: {
    sub: (atom) => {
      // switch (true) {
      //   case !!(atom.init && typeof atom.init?.x !== 'undefined'): // Current node coordinates
      //     return
      //   default: 
      //   console.log('atom------------------', atom)
      // }
    }, // Chain other methods as needed
    get: (atom) => {
      switch (true) {
        case !!(atom.init && atom.init.sortCriteria):
          return {
            sortCriteria: SortCriteria.Name,
            sortOrder: SortOrder.GreatestToLowest,
          }
        case !!(atom.init && atom.init?.entryHash == ''): // Current Sphere
          return { entryHash: SPHERE_ID, actionHash: SPHERE_ID }
        case !!(atom.init && atom.init?.zone): // Current Date in ISO string
          return { toISODate() { return "04/09/2024"} }
        case !!(atom.init && typeof atom.init?.x !== 'undefined'): // Current node coordinates
          return { x:0, y:0 }
        case !!(atom.init && atom.init?.[SPHERE_ID] !== undefined): // Node cache items
          return mockNodeDetailsCacheItems
        case !!(atom.init && atom.init?.id !== undefined): // Current orbit id
          return { id: "UHJhY3RpY2UR28gZm9yIGEgd2Fsay==eW9nYQ==" }
        case !!(atom.init && typeof atom.init?.wins != 'undefined'): // Current Node details
          return {
            id: 'ActionHashB64',
            eH: 'EntryHashB64',
            description: 'string',
            name: 'string',
            scale: 'Scale',
            startTime: 232434,
            endTime: null,
            wins: {}
          }
        default: 
        console.log('atom------------------', atom)
      }
    }, // Chain other methods as needed
    set: (val) => {
        mockNodeDetailsCache = mockedCacheEntries
    }, // Chain other methods as needed
  },
  mapToCacheObject: (orbit) => ({
    id: orbit.id,
    eH: orbit.eH,
    name: orbit.name,
    scale: orbit.scale,
    description: orbit.metadata?.description,
    startTime: orbit.metadata?.timeframe.startTime,
    endTime: orbit.metadata?.timeframe.endTime,
    wins: {},
  }),
  nodeCacheItemsAtom: atom(mockNodeDetailsCacheItems)
}));

vi.mock("../ui/src/state/sphere", async (importOriginal) => {
  const actual = await importOriginal()
  return actual
})

vi.mock("../ui/src/state/orbit", async (importOriginal) => {
  const actual = await importOriginal()
  return actual
})

// Mock app level constants
vi.mock("../ui/src/constants", async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
      ...actual,
    NODE_ENV: 'test',
    HAPP_ID: 'test',
    APP_WS_PORT: 1234,
    ADMIN_WS_PORT: 4321,
    HAPP_DNA_NAME: "habits",
  }
});

vi.mock("../ui/src/main", () => ({
  client: () => ({
    query: () => {},
  }),
}));

vi.mock("@holochain/client", () => ({
  AdminWebsocket: {
    appInfo: () => {},
    connect: () =>
      Promise.resolve({
        authorizeSigningCredentials: () => {},
      }),
  },
  AppWebsocket: {
    appInfo: () => {},
    connect: () =>
      Promise.resolve({
        appInfo: () => ({ cell_info: { habits: [{ provisioned: true }] } }),
      }), // Chain other methods as needed
  },
  AppSignalCb: null,
}));

// Mock ES6 modules that cause problems

vi.mock("@holochain-open-dev/utils", () => ({
  EntryRecord: null,
}));

vi.mock("@msgpack/msgpack", () => ({
  decode: {
    TextEncoder: () => ({}), // Chain other methods as needed
  },
}));

vi.mock("antd", () => ({
  DatePicker: {
    generatePicker: () => ({}), // Chain other methods as needed
  },
  Form: {
    Item: () => ({}), // Chain other methods as needed
  },
}));

vi.mock("antd/es/menu/menu", () => ({
  default: () => null,
  MenuProps: () => null,
}));

vi.mock("@dicebear/core", () => ({
  createAvatar: () => null,
}));
vi.mock("@dicebear/collection", () => ({
  icons: null,
}));

vi.mock("d3-scale", () => ({
  scaleLinear: () => ({
    domain: () => () => {}, // Chain other methods as needed
  }),
  scaleOrdinal: () => null,
}));
vi.mock("d3-zoom", () => ({
  zoom: () => ({
    apply: () => false,
    call: () => false,
    scaleExtent: () => ({
      on: () => () => {}, // Chain other methods as needed
    }),
    // Mock other D3 methods as needed
  }),
}));
