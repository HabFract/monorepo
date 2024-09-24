// tests/integration/testWrapper.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'jotai/react';
import { createTestStore, createTestCache } from '../testUtils';
import { RenderResult } from '@testing-library/react';

export const renderWithJotai = (
  ui: React.ReactElement,
  { initialState = {}, initialCache = {} } = {}
) : RenderResult => {
  const testStore = createTestStore(initialState);
  const testCache = createTestCache(initialCache);

  return render(
    <Provider store={testStore}>
      {React.cloneElement(ui, { nodeCache: testCache })}
    </Provider>
  );
};