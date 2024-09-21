import "fake-indexeddb/auto";
import { mockAppState } from './integration/mocks/mockAppState';
import { vi } from "vitest";
import { atom } from "jotai";
import { SPHERE_ID } from "./integration/mocks/spheres";

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

// Mock the app state as a whole
vi.mock("../ui/src/state/store", () => ({
  appStateAtom: atom(mockAppState),
}));

// Mock the jotaiKeyValueStore
vi.mock("../ui/src/state/jotaiKeyValueStore", () => ({
  nodeCache: {
    entries: atom(mockAppState.orbitNodes.byHash),
    keys: atom(Object.keys(mockAppState.orbitNodes.byHash)),
    items: atom(Object.values(mockAppState.orbitNodes.byHash)),
  },
}));

// Mock the sphere state
vi.mock("../ui/src/state/sphere", async (importOriginal) => {
  const actual = await importOriginal() as object;
  return {
    ...actual,
    // Add any specific sphere state mocks here if needed
  };
});

// Mock the orbit state
vi.mock("../ui/src/state/orbit", async (importOriginal) => {
  const actual = await importOriginal() as object;
  return {
    ...actual,
    // Add any specific orbit state mocks here if needed
  };
});

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