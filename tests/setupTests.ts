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
}));