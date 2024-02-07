window.ResizeObserver = require('resize-observer-polyfill')

const mockUseStateTransitionResponse = ['Home', jest.fn(() => {}), {}];

jest.mock('../app/src/hooks/useStateTransition.ts', () => {
  return {
    useStateTransition: () => {
      return mockUseStateTransitionResponse;
    },
  }
})
