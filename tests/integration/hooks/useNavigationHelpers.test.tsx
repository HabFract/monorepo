import React from 'react';
import { describe, expect, vi, it, beforeEach, afterEach } from 'vitest'
import { cleanup, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useNavigationHelpers } from '@ui/src/hooks/useNavigationHelpers';
import { renderWithJotai, TestProvider } from '../../utils-frontend';
import { appStateAtom } from '@ui/src/state/store';
import mockAppState from '../mocks/mockAppState';
import { AppState } from '@ui/src/state/store';

vi.mock("../../ui/src/hooks/useNavigationHelpers", () => ({
  useNavigationHelpers: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const createMockState = (overrides: Partial<AppState> = {}): AppState => {
  return {
    ...mockAppState,
    ...overrides,
  };
};

const MockComponent = () => {
  const { generateNavigationFlags } = useNavigationHelpers({} as any);
  const flags = generateNavigationFlags({ x: 0, y: 0 }, { id: 'uhCAkR7c5d8bkvV6tqpekQ3LpMpXj2Ej6QNUBEjoBNPXc', parentEh: 'uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj' });
  return (
    <>
      {flags.canTraverseUp && <div data-testid="vis-go-up" />}
      {flags.canTraverseDown && <div data-testid="vis-go-down" />}
      {flags.canTraverseLeft && <div data-testid="vis-go-left" />}
      {flags.canTraverseRight && <div data-testid="vis-go-right" />}
    </>
  );
};

describe('Navigation Helpers with Global App State', () => {
  beforeEach(() => {
    vi.mocked(useNavigationHelpers).mockReturnValue({
      generateNavigationFlags: vi.fn(),
      generateNavigationActions: vi.fn(),
      createConsolidatedActions: vi.fn(),
    });
  });

  // it('tests traverse up condition', async () => {
  //   const mockState = createMockState({
  //     hierarchies: {
  //       byRootOrbitEntryHash: {
  //         ...mockAppState.hierarchies.byRootOrbitEntryHash,
  //         uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
  //           ...mockAppState.hierarchies.byRootOrbitEntryHash.uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj,
  //           indices: { x: 0, y: 1 },
  //         },
  //       },
  //     },
  //   });

  //   vi.mocked(useNavigationHelpers).mockReturnValue({
  //     generateNavigationFlags: () => ({
  //       canTraverseUp: true,
  //       canTraverseDown: false,
  //       canTraverseLeft: false,
  //       canTraverseRight: false,
  //     }),
  //     generateNavigationActions: vi.fn(),
  //     createConsolidatedActions: vi.fn(),
  //   });

  //   const { getByTestId } = renderWithJotai(
  //     <MockedProvider>
  //       <MockComponent />
  //     </MockedProvider>,
  //     { initialState: mockState }
  //   );

  //   await waitFor(() => {
  //     expect(getByTestId('vis-go-up')).toBeTruthy();
  //   });
  // });

  // it('tests traverse down condition', async () => {
  //   const mockState = createMockState({
  //     hierarchies: {
  //       byRootOrbitEntryHash: {
  //         ...mockAppState.hierarchies.byRootOrbitEntryHash,
  //         uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
  //           ...mockAppState.hierarchies.byRootOrbitEntryHash.uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj,
  //           indices: { x: 0, y: 0 },
  //         },
  //       },
  //     },
  //   });

  //   vi.mocked(useNavigationHelpers).mockReturnValue({
  //     generateNavigationFlags: () => ({
  //       canTraverseUp: false,
  //       canTraverseDown: true,
  //       canTraverseLeft: false,
  //       canTraverseRight: false,
  //     }),
  //     generateNavigationActions: vi.fn(),
  //     createConsolidatedActions: vi.fn(),
  //   });

  //   const { getByTestId } = renderWithJotai(
  //     <MockedProvider>
  //       <MockComponent />
  //     </MockedProvider>,
  //     { initialState: mockState }
  //   );

  //   await waitFor(() => {
  //     expect(getByTestId('vis-go-down')).toBeTruthy();
  //   });
  // });

  // it('tests traverse left condition', async () => {
  //   const mockState = createMockState({
  //     hierarchies: {
  //       byRootOrbitEntryHash: {
  //         ...mockAppState.hierarchies.byRootOrbitEntryHash,
  //         uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
  //           ...mockAppState.hierarchies.byRootOrbitEntryHash.uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj,
  //           indices: { x: 1, y: 0 },
  //         },
  //       },
  //     },
  //   });

  //   vi.mocked(useNavigationHelpers).mockReturnValue({
  //     generateNavigationFlags: () => ({
  //       canTraverseUp: false,
  //       canTraverseDown: false,
  //       canTraverseLeft: true,
  //       canTraverseRight: false,
  //     }),
  //     generateNavigationActions: vi.fn(),
  //     createConsolidatedActions: vi.fn(),
  //   });

  //   const { getByTestId } = renderWithJotai(
  //     <MockedProvider>
  //       <MockComponent />
  //     </MockedProvider>,
  //     { initialState: mockState }
  //   );

  //   await waitFor(() => {
  //     expect(getByTestId('vis-go-left')).toBeTruthy();
  //   });
  // });

  // it('tests traverse right condition', async () => {
  //   const mockState = createMockState({
  //     hierarchies: {
  //       byRootOrbitEntryHash: {
  //         ...mockAppState.hierarchies.byRootOrbitEntryHash,
  //         uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj: {
  //           ...mockAppState.hierarchies.byRootOrbitEntryHash.uhCEkNqU8jN3kLnq3xJhxqDO1qNmyYHnS5k0d7j3Yk9Uj,
  //           indices: { x: 0, y: 0 },
  //         },
  //       },
  //     },
  //   });

  //   vi.mocked(useNavigationHelpers).mockReturnValue({
  //     generateNavigationFlags: () => ({
  //       canTraverseUp: false,
  //       canTraverseDown: false,
  //       canTraverseLeft: false,
  //       canTraverseRight: true,
  //     }),
  //     generateNavigationActions: vi.fn(),
  //     createConsolidatedActions: vi.fn(),
  //   });

  //   const { getByTestId } = renderWithJotai(
  //     <MockedProvider>
  //       <MockComponent />
  //     </MockedProvider>,
  //     { initialState: mockState }
  //   );

  //   await waitFor(() => {
  //     expect(getByTestId('vis-go-right')).toBeTruthy();
  //   });
  // });
});