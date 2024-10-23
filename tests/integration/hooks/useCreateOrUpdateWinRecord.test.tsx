import React, { act, useMemo } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithJotai } from '../../utils-frontend';
import { useCreateOrUpdateWinRecord } from '../../../ui/src/hooks/gql/useCreateOrUpdateWinRecord';
import { cleanup, screen } from '@testing-library/react';
import { resetMocks } from '../../setup';
import userEvent from '@testing-library/user-event';
import { useAtom } from 'jotai';
import { winDataPerOrbitNodeAtom } from '../../../ui/src/state/win';
import { createMockClient } from 'mock-apollo-client';
import { clearCustomMocks } from '../../setupMockStore';
import { CreateWinRecordDocument } from '../../../ui/src/graphql/generated';
import { BASIC_DAILY_WIN_RECORD } from '../mocks/win-record';

describe('useCreateOrUpdateWinRecord Hook', () => {
  beforeEach(() => {
    resetMocks()
    clearCustomMocks();
    const mockClient = createMockClient();
    mockClient.setRequestHandler(
      CreateWinRecordDocument,
      () => { return Promise.resolve(BASIC_DAILY_WIN_RECORD![0]!.result) });
  });

  afterEach(() => {
    cleanup();
  });

  it('should update win record in app state after mutation', async () => {
    const TestComponent = ({ orbitHash }: { orbitHash: string }) => {
      const winDataAtomInstance = useMemo(() => winDataPerOrbitNodeAtom(orbitHash), [orbitHash]) as any;
      const [winData, _setWinData] = useAtom(winDataAtomInstance);
      const runMutation = useCreateOrUpdateWinRecord({
        variables: {
          winRecord: {
            orbitEh: 'aTestOrbitEh',
            winData: [
              {
                "date": "24/10/2024",
                "single": true
              },
              {
                "date": "23/10/2024",
                "single": true
              }
            ]
          },
        },
      }) as any;
      return (
        <div>
          <button
            onClick={() => {
              runMutation()
            }}
          >
            Update Win Record
          </button>
          <div data-testid="winState">{winData == null ? 'null' : JSON.stringify(winData)}</div>
        </div>
      );
    };

    renderWithJotai(<TestComponent orbitHash='aTestOrbitEh' />, { initialHierarchy: BASIC_DAILY_WIN_RECORD } as any);

    await act(async () => {
      await userEvent.click(screen.getByText('Update Win Record'));
    });

    const state = JSON.parse(screen.getByTestId('winState').textContent as string);
    expect(state).toStrictEqual({ "24/10/2024": true, "23/10/2024": true });
  });
});