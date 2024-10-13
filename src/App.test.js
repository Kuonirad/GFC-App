import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ image: 'mocked-image-url' }),
  });
});

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
  sequential: jest.fn().mockReturnValue({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({}),
    predict: jest.fn().mockReturnValue({
      dataSync: jest.fn().mockReturnValue([0.5]),
      dispose: jest.fn(),
    }),
  }),
  layers: {
    dense: jest.fn(),
  },
}));

// Increase the default timeout
jest.setTimeout(10000);

test('renders FluxImageRenderer component', async () => {
  render(<App />);
  await waitFor(() => {
    const fluxImageRenderer = screen.getByTestId('flux-image-container');
    expect(fluxImageRenderer).toBeInTheDocument();
  }, { timeout: 10000 });
});
