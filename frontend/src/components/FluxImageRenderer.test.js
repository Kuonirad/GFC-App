import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';

jest.mock('axios');
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({}),
    predict: jest.fn(() => ({
      data: jest.fn().mockResolvedValue([42]),
    })),
  })),
  layers: {
    dense: jest.fn(),
  },
  tensor2d: jest.fn(),
}));

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas-mock">{children}</div>,
}));

import FluxImageRenderer from './FluxImageRenderer';

global.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: jest.fn(),
}));
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({}),
};

describe('FluxImageRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { url: 'test-image-url' } });
  });

  test('renders flux image when loaded', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('flux-image-container')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('flux-image')).toBeInTheDocument();
    expect(screen.getByTestId('flux-image')).toHaveAttribute('src', 'test-image-url');
  });

  test('shows loading state', async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    await act(async () => {
      render(<FluxImageRenderer />);
    });

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('shows error state on API error', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<FluxImageRenderer />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByTestId('error')).toHaveTextContent('Error: API Error');
    });
  });

  test('generates AI animation', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });

    await waitFor(() => {
      expect(tf.ready).toHaveBeenCalled();
      expect(tf.sequential).toHaveBeenCalled();
      expect(tf.layers.dense).toHaveBeenCalled();
    });

    const mockSequentialInstance = tf.sequential();
    expect(mockSequentialInstance.add).toHaveBeenCalled();
    expect(mockSequentialInstance.compile).toHaveBeenCalled();
    expect(mockSequentialInstance.fit).toHaveBeenCalled();
    expect(mockSequentialInstance.predict).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId('ai-animation')).toBeInTheDocument();
      expect(screen.getByTestId('ai-animation')).toHaveTextContent('AI Animation Output: 42');
    });
  });

  test('handles TensorFlow.js initialization failure', async () => {
    tf.sequential.mockImplementationOnce(() => {
      throw new Error('TensorFlow.js model initialization failed');
    });

    await act(async () => {
      render(<FluxImageRenderer />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByTestId('error')).toHaveTextContent('Error: TensorFlow.js model initialization failed');
    });
  });

  test('responds to audio input', async () => {
    await act(async () => {
      render(<FluxImageRenderer />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('flux-image-container')).toBeInTheDocument();
    });

    expect(global.AudioContext).toHaveBeenCalled();
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId('audio-initialized')).toBeInTheDocument();
    });
  });
});
