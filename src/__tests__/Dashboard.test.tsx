import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import Dashboard from '../pages/Admin/Dashboard';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

test('renders Dashboard component without crashing', () => {
  render(<BrowserRouter><Dashboard /></BrowserRouter>);
  expect(screen.getByRole('heading', { name: /Dashboard/i, level: 1 })).toBeInTheDocument();
});
