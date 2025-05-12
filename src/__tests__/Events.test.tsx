import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { test, expect } from 'vitest';
import EventsAdmin from '../pages/Admin/Events';
import { BrowserRouter } from 'react-router-dom';

test('renders EventsAdmin component without crashing', async () => {
  render(<BrowserRouter><EventsAdmin /></BrowserRouter>);
  await waitFor(() => expect(screen.getByText('Events Management')).toBeInTheDocument());
});
