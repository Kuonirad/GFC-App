import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Canvas } from '@react-three/fiber';
import FluxImageRenderer from './components/FluxImageRenderer';

// Mock the APIs and functions
jest.mock('axios');

jest.mock('three', () => {
  const three = jest.requireActual('three');
  return {
    ...three,
    TextureLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn((url, onLoad) => {
        // Simulate successful texture loading
        const texture = new three.Texture();
        onLoad(texture);
      }),
    })),
    DataTexture: jest.fn().mockImplementation(() => {
      const texture = new three.Texture();
      texture.needsUpdate = true;
      return texture;
    }),
  };
});

jest.mock('@tensorflow/tfjs', () => {
  const tf = {
    sequential: jest.fn(() => ({
      add: jest.fn(),
      predict: jest.fn(() => ({
        add: jest.fn(() => ({
          div: jest.fn(() => ({
            dispose: jest.fn(),
            dataSync: jest.fn(() => new Float32Array(32 * 32 * 3).fill(0)),
          })),
          dispose: jest.fn(),
        })),
        dispose: jest.fn(),
      })),
    })),
    layers: {
      dense: jest.fn(),
      leakyReLU: jest.fn(),
      reshape: jest.fn(),
    },
    randomNormal: jest.fn(() => ({
      dispose: jest.fn(),
    })),
    browser: {
      toPixels: jest.fn(() => Promise.resolve(new Uint8ClampedArray(32 * 32 * 4).fill(0))),
    },
  };
  return tf;
});

describe('FluxImageRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <Canvas>
        <FluxImageRenderer />
      </Canvas>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders flux image when loaded', async () => {
    const axios = require('axios');
    axios.get.mockResolvedValue({
      data: [{ url: 'mock-url' }],
    });

    render(
      <Canvas>
        <FluxImageRenderer />
      </Canvas>
    );

    // Wait for the image to load
    const meshElement = await screen.findByTestId('flux-image-mesh');
    expect(meshElement).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('handles errors gracefully', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const axios = require('axios');
    axios.get.mockRejectedValue(new Error('API Error'));

    render(
      <Canvas>
        <FluxImageRenderer />
      </Canvas>
    );

    const errorMessage = await screen.findByText(/Error: API Error/i);
    expect(errorMessage).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  test('responds to gesture controls', async () => {
    const axios = require('axios');
    axios.get.mockResolvedValue({
      data: [{ url: 'mock-url' }],
    });

    render(
      <Canvas>
        <FluxImageRenderer />
      </Canvas>
    );

    const meshElement = await screen.findByTestId('flux-image-mesh');
    fireEvent.pointerMove(meshElement, { clientX: 100, clientY: 100 });
    // Since we cannot directly access shader uniforms, we check if no errors are thrown
    expect(meshElement).toBeInTheDocument();
  });

  test('generates AI animation', async () => {
    jest.useFakeTimers();
    const axios = require('axios');
    axios.get.mockResolvedValue({
      data: [{ url: 'mock-url' }],
    });

    render(
      <Canvas>
        <FluxImageRenderer />
      </Canvas>
    );

    await screen.findByTestId('flux-image-mesh');
    act(() => {
      jest.advanceTimersByTime(10000); // Advance time to trigger GAN generation
    });

    const tf = require('@tensorflow/tfjs');
    expect(tf.sequential().mock.results[0].value.predict).toHaveBeenCalled();
  });

  test('responds to audio input', async () => {
    const mockAudioContext = {
      createAnalyser: jest.fn(() => ({
        fftSize: 256,
        frequencyBinCount: 128,
        getByteFrequencyData: jest.fn(),
      })),
      createMediaStreamSource: jest.fn(() => ({
        connect: jest.fn(),
      })),
      close: jest.fn(),
    };
    global.AudioContext = jest.fn(() => mockAudioContext);
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue('mock-stream'),
    };

    const axios = require('axios');
    axios.get.mockResolvedValue({
      data: [{ url: 'mock-url' }],
    });

    render(
      <Canvas>
        <FluxImageRenderer />
      </Canvas>
    );

    expect(global.AudioContext).toHaveBeenCalled();
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });
});