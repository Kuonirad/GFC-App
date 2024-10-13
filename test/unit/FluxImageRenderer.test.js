import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as tf from '@tensorflow/tfjs';
import FluxImageRenderer from './FluxImageRenderer';

// Mock fetch
global.fetch = jest.fn();

jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({}),
    predict: jest.fn(() => ({
      data: jest.fn().mockResolvedValue([42]),
      dispose: jest.fn(),
    })),
    dispose: jest.fn(),
  })),
  layers: {
    dense: jest.fn(),
  },
  randomNormal: jest.fn(() => ({
    mul: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    dispose: jest.fn(),
  })),
  tensor2d: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  scalar: jest.fn(),
}));

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas-mock">{children}</div>,
}));

const mockAudioContext = {
  createAnalyser: jest.fn(),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
  })),
  close: jest.fn().mockResolvedValue(undefined),
};

global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({}),
};

describe('FluxImageRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ image: 'test-image-url' }),
    });
  });

  test('renders loading state initially', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('API Error'));
    await act(async () => {
      render(<FluxImageRenderer />);
    });
    await waitFor(() => {
      const errorElement = screen.getByTestId('error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Error: Failed to fetch image: API Error');
    });
  });

  test('renders image when API call succeeds', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });
    await waitFor(() => {
      expect(screen.getByAltText('Flux')).toBeInTheDocument();
      expect(screen.getByAltText('Flux')).toHaveAttribute('src', 'test-image-url');
    });
  });

  test('generates AI animation', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });

    await waitFor(() => {
      expect(tf.sequential).toHaveBeenCalled();
      expect(tf.layers.dense).toHaveBeenCalled();
    });

    const mockSequentialInstance = tf.sequential();
    expect(mockSequentialInstance.compile).toHaveBeenCalled();
    expect(mockSequentialInstance.predict).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId('ai-animation')).toBeInTheDocument();
      expect(screen.getByTestId('ai-animation')).toHaveTextContent('AI Animation Output: 42');
    }, { timeout: 5000 });
  });

  test('sets up audio context', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });

    await waitFor(() => {
      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });
  });

  test('renders flux-image-container when API call succeeds', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('flux-image-container')).toBeInTheDocument();
    });
  });
});
