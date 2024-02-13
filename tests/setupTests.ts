//@ts-ignore
window.ResizeObserver = require('resize-observer-polyfill')

function channelMock() {}
channelMock.prototype.onmessage = function () {}
channelMock.prototype.postMessage = function (data) {
  this.onmessage({ data })
}
//@ts-ignore
window.BroadcastChannel = channelMock

const mockUseStateTransitionResponse = ['Home', jest.fn(() => {}), {
  // orbitEh: 'R28gZm9yIGEgd2Fsay==',
  currentSphereHash: 'SGVhbHRoMQ==e',
}];

jest.mock('../app/src/hooks/useStateTransition.ts', () => {
  return {
    useStateTransition: () => {
      return mockUseStateTransitionResponse;
    },
  }
})

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