
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
// jest.mock('d3', () => ({
//   select: () => ({
//     empty: () => false, // Assuming the error is because of this, return false to indicate the selection is not empty
//     append: () => ({
//       attr: () => ({}), // Chain other methods as needed
//       style: () => ({}),
//     }),
//     // Mock other D3 methods as needed
//   }),
//   scaleOrdinal: () => null,
//   scaleLinear: () => null,
//   zoom: () => null,
//   linkVertical: () => null,
//   linkRadial: () => null,
//   linkHorizontal: () => null,
//   tree: () => null,
//   cluster: () => null,
//   easeCubic: () => null,
//   easePolyIn: () => null,
//   easeLinear: () => null,
//   hierarchy: () => null,
//   TreeLayout: () => null,
//   }));