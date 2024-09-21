import "fake-indexeddb/auto";
import { mockAppState } from './integration/mocks/mockAppState';
import { vi } from "vitest";
import { atom } from "jotai";
import { SPHERE_ID } from "./integration/mocks/spheres";
import { createTestCache, createTestStore } from "./testUtils";

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

vi.mock('../ui/src/state/jotaiKeyValueStore', () => ({
  nodeCache: createTestCache(mockAppState.orbitNodes.byHash),
  store: {
    get: vi.fn(),
    set: vi.fn(),
    sub: vi.fn(),
  },
  mapToCacheObject: vi.fn(),
  nodeCacheItemsAtom: atom(Object.values(mockAppState.orbitNodes.byHash)),
}));


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