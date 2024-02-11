
window.ResizeObserver = require('resize-observer-polyfill')

const mockUseStateTransitionResponse = ['Home', jest.fn(() => {}), {
  orbitEh: 'uhCEkK4tYe6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu',
  currentSphereHash: 'abc',
}];

jest.mock('../app/src/hooks/useStateTransition.ts', () => {
  return {
    useStateTransition: () => {
      return mockUseStateTransitionResponse;
    },
  }
})

module.exports = {}
jest.mock('d3-scale', () => ({
  scaleLinear: () => null,
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