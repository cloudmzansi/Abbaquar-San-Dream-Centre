import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import ActivitiesAdmin from '../pages/Admin/Activities';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

test('renders ActivitiesAdmin component without crashing', () => {
  render(<BrowserRouter><ActivitiesAdmin /></BrowserRouter>);
  expect(screen.getByText(/Activities Management/i)).toBeInTheDocument();
});
