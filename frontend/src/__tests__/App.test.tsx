import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Mock the auth store
jest.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    token: null,
    user: null,
    setUser: jest.fn(),
    logout: jest.fn()
  })
}));

// Mock API client
jest.mock('../api/client', () => ({
  get: jest.fn().mockResolvedValue({ data: { data: null } })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('App Component', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  test('renders landing page for unauthenticated user', async () => {
    render(
      <AppWrapper>
        <App />
      </AppWrapper>
    );

    // Wait for the component to load
    await screen.findByText(/loading application/i, {}, { timeout: 3000 });
  });

  test('handles loading state correctly', () => {
    render(
      <AppWrapper>
        <App />
      </AppWrapper>
    );

    expect(screen.getByText(/loading application/i)).toBeInTheDocument();
  });
});