import "fake-indexeddb/auto";
import { mockAppState } from './integration/mocks/mockAppState';
import { vi } from "vitest";
import { atom } from "jotai";
import { SPHERE_ID } from "./integration/mocks/spheres";
import { createTestCache, createTestStore } from "./testUtils";
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
/ Mocking the top level state machine for routing and page params
*/
const initialStateMachineState = {
  currentSphereEhB64: SPHERE_ID,
  currentSphereAhB64: SPHERE_ID,
};

let mockUseStateTransitionResponse = ["Home", vi.fn(() => {}), initialStateMachineState];
export function setMockUseStateTransitionResponse(params: typeof initialStateMachineState) {
  mockUseStateTransitionResponse = ["Home", vi.fn(() => {}), params];
}

vi.mock("../ui/src/hooks/useStateTransition", () => ({
  useStateTransition: () => mockUseStateTransitionResponse,
  setMockUseStateTransitionResponse,
}));

/* 
/ Mocking the overall AppState (not routing)
*/
vi.mock('../ui/src/state/store', () => ({
  appStateAtom: createTestStore(),
}));

/* 
/ Mocking jotai store functions
*/
vi.mock("../ui/src/state/jotaiKeyValueStore", (importOriginal) => ({
  ...importOriginal,
  // nodeCache: {
  //   entries: atom(mockNodeDetailsCache),
  //   keys: atom(mockNodeDetailsCacheKeys),
  //   items: atom(mockNodeDetailsCacheItems),
  // },
  store: {
    sub: (atom) => {
    },
    get: (atom) => {
      // Use a switch to selectively mock different store.get responses by atom type default value
      switch (true) {
        // currentSphereHashesAtom
        case !!(atom.init && atom.init?.entryHash == ''):
          return { entryHash: SPHERE_ID, actionHash: SPHERE_ID }

        // currentSphereOrbitNodesAtom
        // case !!(atom.init && atom.init?.entryHash == ''):
        //   return { [SPHERE_ID]:  Object.values(mockAppState.orbitNodes.byHash)}

        // currentDayAtom
        case !!(atom.init && atom.init?.zone):
          return { toISODate() { return "04/09/2024"} }

        // currentOrbitDetailsAtom
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
          
        // currentSphereHasCachedNodesAtom
        case !!(atom.init && atom.init == true): // Current orbit id
          return { id: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc" }
              
        // currentOrbitHash (dep)
        case !!(atom.init && atom.init?.id !== undefined): // Current orbit id
          return { id: "uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc" }
    
          
        // getCurrentSphereOrbitByIdAtom
        case !!(atom.init && atom.init?.id !== undefined): // Current orbit id
          return {}     
        //currentOrbitCoords (dep)
        case !!(atom.init && typeof atom.init?.x !== 'undefined'): // Current node coordinates
          return { x:0, y:0 }
        
        //  Nodecache.items
        case !!(atom.init && atom.init?.[SPHERE_ID] !== undefined): // Node cache items
          return {}//mockNodeDetailsCacheItems


        // UI - sort criteria
        case !!(atom.init && atom.init.sortCriteria):
          return {
            sortCriteria: SortCriteria.Name,
            sortOrder: SortOrder.GreatestToLowest,
          }
        default:
        console.log('atom debug for when no mock present ------------------', atom)
      }
    }, // Chain other methods as needed
    set: (val) => {
        // mockNodeDetailsCache = mockedCacheEntries
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
  nodeCacheItemsAtom: atom(Object.values(mockAppState.orbitNodes.byHash))
}));
// vi.mock('../ui/src/state/jotaiKeyValueStore', () => ({
//   nodeCache: createTestCache(mockAppState.orbitNodes.byHash),
//   store: {
//     get: vi.fn(),
//     set: vi.fn(),
//     sub: vi.fn(),
//   },
//   nodeCacheItemsAtom: atom(Object.values(mockAppState.orbitNodes.byHash)),
// }));


// Mock redirect hook
vi.mock("../ui/src/hooks/useRedirect", async () => {
  return { useRedirect : () => null}
})

// Mock app level constants
vi.mock("../ui/src/constants", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    NODE_ENV: 'test',
    HAPP_ID: 'test',
    APP_WS_PORT: 1234,
    ADMIN_WS_PORT: 4321,
    HAPP_DNA_NAME: "habits",
  };
});

// Mock the main client
vi.mock("../ui/src/main", () => ({
  client: () => ({
    query: vi.fn(),
  }),
}));

// Mock Holochain client
vi.mock("@holochain/client", () => ({
  AdminWebsocket: {
    appInfo: vi.fn(),
    connect: vi.fn(() =>
      Promise.resolve({
        authorizeSigningCredentials: vi.fn(),
      })
    ),
  },
  AppWebsocket: {
    appInfo: vi.fn(),
    connect: vi.fn(() =>
      Promise.resolve({
        appInfo: vi.fn(() => ({ cell_info: { habits: [{ provisioned: true }] } })),
      })
    ),
  },
  AppSignalCb: null,
}));

// Mock problematic ES6 modules
vi.mock("@holochain-open-dev/utils", () => ({
  EntryRecord: null,
}));

vi.mock("@msgpack/msgpack", () => ({
  decode: {
    TextEncoder: vi.fn(() => ({})),
  },
}));

vi.mock("antd", () => ({
  DatePicker: {
    generatePicker: vi.fn(() => ({})),
  },
  Form: {
    Item: vi.fn(() => ({})),
  },
}));

vi.mock("antd/es/menu/menu", () => ({
  default: vi.fn(() => null),
  MenuProps: vi.fn(() => null),
}));

vi.mock("@dicebear/core", () => ({
  createAvatar: vi.fn(() => null),
}));

vi.mock("@dicebear/collection", () => ({
  icons: null,
}));

vi.mock("d3-scale", () => ({
  scaleLinear: vi.fn(() => ({
    domain: vi.fn(() => vi.fn()),
  })),
  scaleOrdinal: vi.fn(() => null),
}));

vi.mock("d3-zoom", () => ({
  zoom: vi.fn(() => ({
    apply: vi.fn(() => false),
    call: vi.fn(() => false),
    scaleExtent: vi.fn(() => ({
      on: vi.fn(() => vi.fn()),
    })),
  })),
}));