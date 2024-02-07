import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react';
import H from '../../app/src/components/PageHeader';
import React from 'react';

test('renders a header', () => {
  render(<H title='test'></H>);
  const headings = screen.getAllByRole('heading');
  expect(headings.length).toBe(2);
});