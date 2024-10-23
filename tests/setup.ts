import "fake-indexeddb/auto";
import { SPHERE_ID } from "./integration/mocks/mockAppState";
import { vi } from "vitest";
import { mockStore } from "./setupMockStore";
import { linkVertical } from "d3-shape";

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

let mockUseStateTransitionResponse = [
  "Home",
  vi.fn(() => {}),
  initialStateMachineState,
];
export function setMockUseStateTransitionResponse(
  route: string,
  params?: typeof initialStateMachineState,
  client?: any
) {
  mockUseStateTransitionResponse = [
    route,
    vi.fn(() => {}),
    (params || {}) as any,
    client,
  ];
}

vi.mock("../ui/src/hooks/useStateTransition", () => ({
  useStateTransition: () => mockUseStateTransitionResponse,
}));

vi.mock("../ui/src/state/store", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    ...mockStore,
  };
});

export function resetMocks() {
  vi.resetAllMocks();
}

vi.mock("../ui/src/hooks/useRedirect", async () => {
  return { useRedirect: () => null };
});

// Mock vis helpers
vi.mock("../ui/src/components/vis/helpers", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    debounce: vi.fn((func) => func),
    renderVis: vi.fn(() => {}),
  };
});

// Mock hooks
vi.mock("../ui/src/hooks/gql/useFetchNextLevel", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return actual;
});
vi.mock(
  "../ui/src/hooks/useDeriveAndCacheHierarchyPaths",
  async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      useDeriveAndCacheHierarchyPaths: () => ({ cache: () => {} }),
    };
  }
);
vi.mock(
  "../ui/src/hooks/gql/useUpdateOrbitMutation",
  async (importOriginal) => {
    return {
      useUpdateOrbitMutation: vi.fn(() => {}),
    };
  }
);
vi.mock(
  "../ui/src/hooks/gql/useCreateOrbitMutation",
  async (importOriginal) => {
    return {
      useCreateOrbitMutation: vi.fn(() => {}),
    };
  }
);
vi.mock("../ui/src/graphql/connection", async (importOriginal) => {
  return {
    debounce: vi.fn(() => {}),
  };
});
vi.mock("../ui/src/hooks/gql/utils", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return actual;
});

// Mock app level constants
vi.mock("../ui/src/constants", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    NODE_ENV: "test",
    HAPP_ID: "test",
    APP_WS_PORT: 1234,
    ADMIN_WS_PORT: 4321,
    HAPP_DNA_NAME: "habits",
  };
});

// Mock the entry point
vi.mock("../ui/src/main", async (importOriginal) => ({
  AppMachine: {
    state: {
      currentState: mockUseStateTransitionResponse,
    },
  },
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
        appInfo: vi.fn(() => ({
          cell_info: { habits: [{ provisioned: true }] },
        })),
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

vi.mock("d3-ease", async (importOriginal) => {
  return {
    easeCubicOut: vi.fn(() => ({})),
  };
});
vi.mock("d3-shape", async (importOriginal) => {
  return {
    linkVertical: () => ({
      x: vi.fn(() => ({ y: vi.fn(() => {}) })),
    }),
  };
});

vi.mock("d3-selection", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
  };
});

vi.mock("d3-scale", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    scaleLinear: vi.fn(() => ({
      domain: vi.fn(() => vi.fn()),
    })),
    scaleOrdinal: vi.fn(() => null),
  };
});

vi.mock("d3-zoom", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
  };
});
