import { mockedCacheEntries } from "./e2e/mocks/cache";
import { SPHERE_ID } from "./e2e/mocks/spheres";

import { atom } from "jotai";

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
  currentSphereHash: SPHERE_ID,
};
let mockUseStateTransitionResponse = [
  "Home",
  jest.fn(() => {}),
  initialState,
];
export function setMockUseStateTransitionResponse(params: typeof initialState) {
  mockUseStateTransitionResponse = ["Home", jest.fn(() => {}), params];
}

jest.mock("../app/src/hooks/useStateTransition", () => ({
  useStateTransition: () => mockUseStateTransitionResponse,
  setMockUseStateTransitionResponse,
}));

/* 
/ Mocking the jotai indexdb store for node details in the vis
*/
let mockNodeDetailsCache = mockedCacheEntries;
let mockNodeDetailsCacheKeys: string[] = Object.keys(Object.fromEntries(mockNodeDetailsCache));

export function setMockNodeDetailsCache(params: typeof mockedCacheEntries) {
  mockNodeDetailsCache = params;
  mockNodeDetailsCacheKeys = Object.keys(Object.fromEntries(mockNodeDetailsCache));
}
jest.mock("../app/src/state/jotaiKeyValueStore", () => ({
  entries: atom(mockNodeDetailsCache),
  keys: atom(mockNodeDetailsCacheKeys),
  setMany: atom(  null, // it's a convention to pass `null` for the first argument
  (get, set, update) => { mockNodeDetailsCache = mockedCacheEntries}),
}));

// Mock ES6 modules that cause problems

jest.mock("@dicebear/core", () => ({
  createAvatar: () => null,
}));
jest.mock("@dicebear/collection", () => ({
  icons: null,
}));

jest.mock("d3-scale", () => ({
  scaleLinear: () => ({
    domain: () => () => {}, // Chain other methods as needed
  }),
  scaleOrdinal: () => null,
}));
jest.mock("d3-svg-legend", () => ({
  legendColor: () => null,
}));
jest.mock("d3-zoom", () => ({
  zoom: () => ({
    apply: () => false,
    call: () => false,
    scaleExtent: () => ({
      on: () => () => {}, // Chain other methods as needed
    }),
    // Mock other D3 methods as needed
  }),
}));
