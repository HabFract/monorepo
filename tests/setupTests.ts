import { describe, expect, it, vi } from 'vitest';
import { TextDecoder } from "util";
import "fake-indexeddb/auto";
//@ts-ignore
global.TextDecoder = TextDecoder;

import '@testing-library/react/dont-cleanup-after-each';
import { mockedCacheEntries } from "./e2e/mocks/cache";
import { SPHERE_ID } from "./e2e/mocks/spheres";

import { atom } from "jotai";
import { SortCriteria, SortOrder } from "../ui/src/state/listSortFilterAtom";

//@ts-ignore
window.ResizeObserver = require("resize-observer-polyfill");

function channelMock() {}
channelMock.prototype.onmessage = function () {};
channelMock.prototype.postMessage = function (data) {
  this.onmessage({ data });
};
//@ts-ignore
window.BroadcastChannel = channelMock;

/* 
/ Mocking the top level state machine for component params
*/
const initialState = {
  // orbitEh: 'R28gZm9yIGEgd2Fsay==',
  currentSphereEhB64: SPHERE_ID,
  currentSphereAhB64: SPHERE_ID,
};

let mockUseStateTransitionResponse = ["Home", vi.fn(() => {}), initialState];
export function setMockUseStateTransitionResponse(params: typeof initialState) {
  mockUseStateTransitionResponse = ["Home", vi.fn(() => {}), params];
}

vi.mock("../ui/src/hooks/useStateTransition", () => ({
  useStateTransition: () => mockUseStateTransitionResponse,
  setMockUseStateTransitionResponse,
}));

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

vi.mock("../ui/src/state/jotaiKeyValueStore", () => ({
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
        case !!(atom.init && typeof atom.init?.x !== 'undefined'): // Current node coordinates
          return { x:0, y:0 }
        case !!(atom.init && atom.init?.[SPHERE_ID] !== undefined): // Node cache items
          return mockNodeDetailsCacheItems
        case !!(atom.init && atom.init?.details == null): // Current Node details
          return {
            id: 'ActionHashB64',
            eH: 'EntryHashB64',
            description: 'string',
            name: 'string',
            scale: 'Scale',
            startTime: 232434,
            endTime: null,
            checked: false,
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
    checked: false
  }),
}));

// Mock app level constants
vi.mock("../ui/src/constants", () => ({
  HAPP_ID: 'test',
  APP_WS_PORT: 1234,
  ADMIN_WS_PORT: 4321,
  HAPP_DNA_NAME: "habits",
}));

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
vi.mock("d3-svg-legend", () => ({
  legendColor: () => null,
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
