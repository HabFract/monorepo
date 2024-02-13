import { QueryParamsLevel } from "../app/src/graphql/generated"
import { SPHERE_ID } from "./e2e/mocks/spheres"


//@ts-ignore
window.ResizeObserver = require('resize-observer-polyfill')

function channelMock() {}
channelMock.prototype.onmessage = function () {}
channelMock.prototype.postMessage = function (data) {
  this.onmessage({ data })
}
//@ts-ignore
window.BroadcastChannel = channelMock


// Mocking the top level state machine for component params
const initialState = {
  // orbitEh: 'R28gZm9yIGEgd2Fsay==',
  currentSphereHash: SPHERE_ID,
}
let mockUseStateTransitionResponse = ['Home', jest.fn(() => {}), {
  // orbitEh: 'R28gZm9yIGEgd2Fsay==',
  currentSphereHash: SPHERE_ID,
}];
export function setMockUseStateTransitionResponse(params: typeof initialState) {
  mockUseStateTransitionResponse = ['Home', jest.fn(() => {}), params];
}

jest.mock('../app/src/hooks/useStateTransition.ts', () => ({
  useStateTransition: () => mockUseStateTransitionResponse,
  setMockUseStateTransitionResponse,
}));

jest.mock('d3-scale', () => ({
  scaleLinear: () => ({
    domain: () => (() => {}), // Chain other methods as needed
  }),
  scaleOrdinal: () => null,
  
  }));
jest.mock('d3-svg-legend', () => ({
  legendColor: () => null,
}));
jest.mock('d3-zoom', () => ({
  zoom: () => ({
    apply: () => false,
    call: () => false,
    scaleExtent: () => ({
      on: () => (() => {}), // Chain other methods as needed
    }),
    // Mock other D3 methods as needed
  }),
}));import { atom } from 'jotai';

// Mock atoms for setting hierarchy bounds
const mockBreadthBoundsAtom = atom({});
const mockDepthBoundsAtom = atom({});

// Mock setters for hierarchy bounds
const mockSetBreadthBounds = jest.fn();
const mockSetDepthBounds = jest.fn();

jest.mock('../app/src/state/currentSphereHierarchyAtom.ts', () => ({
  setBreadths: (sphereHash: string, bounds: number[]) => mockSetBreadthBounds(sphereHash, bounds),
  setDepths: (sphereHash: string, bounds: number[]) => mockSetDepthBounds(sphereHash, bounds),
  currentSphereHierarchyBounds: atom((get) => {
    const sphereHash = get(mockBreadthBoundsAtom);
    return {
      [sphereHash]: {
        minDepth: 0,
        maxDepth: 2,
        minBreadth: 0,
        maxBreadth: 1,
      },
    };
  }),
}));
