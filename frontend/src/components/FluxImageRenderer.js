import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import * as THREE from 'three';
// eslint-disable-next-line no-unused-vars
import { useFrame, useThree } from '@react-three/fiber';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import { useGesture } from '@use-gesture/react';

// Mock AudioContext for testing
if (process.env.NODE_ENV === 'test') {
  global.AudioContext = jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn().mockReturnValue({
      fftSize: 0,
      getByteFrequencyData: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    }),
    createMediaStreamSource: jest.fn().mockReturnValue({
      connect: jest.fn(),
    }),
    close: jest.fn(),
  }));
}

// Updated ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Audio context and analyzer setup
const AudioContext = window.AudioContext || window.webkitAudioContext;

const FluxImageRenderer = () => {
  const meshRef = useRef();
  const shaderRef = useRef();
  const analyserRef = useRef();
  const audioContextRef = useRef();

  const [isLoading, setIsLoading] = useState(true);
  const [texture, setTexture] = useState(null);
  const [ganTexture, setGanTexture] = useState(null);
  const [error, setError] = useState(null);
  const [audioData, setAudioData] = useState(null);

  // Use audioData in a useEffect to demonstrate its usage
  useEffect(() => {
    if (audioData) {
      console.log('Audio data updated:', audioData);
      // You can perform additional actions with audioData here
    }
  }, [audioData]);

  // Check WebGL support
  const isWebGLSupported = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isWebGLSupported) {
      setError(new Error('WebGL is not supported on this device'));
      setIsLoading(false);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  }, [isWebGLSupported]);

  // Updated GAN model creation
  const gan = useMemo(() => {
    if (!isWebGLSupported) return null;
    try {
      const generator = tf.sequential();
      generator.add(tf.layers.dense({ units: 256, inputShape: [100] }));
      generator.add(tf.layers.leakyReLU());
      generator.add(tf.layers.dense({ units: 512 }));
      generator.add(tf.layers.leakyReLU());
      generator.add(tf.layers.dense({ units: 1024 }));
      generator.add(tf.layers.leakyReLU());
      generator.add(tf.layers.dense({ units: 32 * 32 * 3, activation: 'tanh' }));
      generator.add(tf.layers.reshape({ targetShape: [32, 32, 3] }));
      return generator;
    } catch (error) {
      console.error('Error creating GAN model:', error);
      setError(error);
      return null;
    }
  }, [isWebGLSupported]);

  // Updated fetchFluxImage function
  const fetchFluxImage = useCallback(async () => {
    if (!isWebGLSupported) return;
    try {
      const response = await axios.get('https://api.blackforestlabs.com/v1/flux-images', {
        headers: { Authorization: `Bearer ${process.env.REACT_APP_BLACK_FOREST_LABS_API_KEY}` },
      });
      const imageUrl = response.data[0].url; // Assuming the API returns an array of images

      // Load the flux image as a texture
      const loader = new THREE.TextureLoader();
      loader.load(
        imageUrl,
        (loadedTexture) => {
          setTexture(loadedTexture);
          setIsLoading(false);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          setError(error);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching flux image:', error);
      setError(error);
      setIsLoading(false);
    }
  }, [isWebGLSupported]);

  const generateGanTexture = useCallback(async () => {
    let noise, generatedImage, imageTensor, imageData;
    try {
      // Generate new image using GAN
      noise = tf.randomNormal([1, 100]);
      if (!gan) {
        throw new Error('GAN model not initialized');
      }
      generatedImage = gan.predict(noise);

      // Convert generated image to pixels
      imageTensor = generatedImage.reshape([32, 32, 3]);
      imageData = await tf.browser.toPixels(imageTensor);

      // Create texture from imageData
      const dataTexture = new THREE.DataTexture(
        new Uint8Array(imageData),
        32,
        32,
        THREE.RGBFormat
      );
      dataTexture.needsUpdate = true;
      setGanTexture(dataTexture);
    } catch (error) {
      console.error('Error generating GAN texture:', error);
      setError(error);
    } finally {
      // Ensure all tensors are disposed
      if (noise) noise.dispose();
      if (generatedImage) generatedImage.dispose();
      if (imageTensor) imageTensor.dispose();
      if (imageData) tf.dispose(imageData);
    }
  }, [gan]);

  const updateAudioData = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      setAudioData(dataArray);
      if (shaderRef.current) {
        const audioTexture = new THREE.DataTexture(dataArray, 128, 1, THREE.LuminanceFormat);
        audioTexture.needsUpdate = true;
        shaderRef.current.uniforms.audioDataTexture.value = audioTexture;
      }
    }
  }, []);

  useFrame(() => {
    updateAudioData();
    if (shaderRef.current) {
      shaderRef.current.uniforms.time.value += 0.01;
    }
  });

  useEffect(() => {
    if (!isWebGLSupported) return;

    fetchFluxImage();
    generateGanTexture();

    // Create shader material
    const uniforms = {
      time: { value: 0 },
      texture1: { value: null },
      texture2: { value: null },
      mousePosition: { value: new THREE.Vector2(0, 0) },
      audioDataTexture: { value: null },
      noiseScale: { value: 0.5 },
      noiseStrength: { value: 0.2 },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform sampler2D texture1;
      uniform sampler2D texture2;
      uniform sampler2D audioDataTexture;
      uniform vec2 mousePosition;
      uniform float noiseScale;
      uniform float noiseStrength;
      varying vec2 vUv;

      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv;
        float noise = snoise(uv * noiseScale + time * 0.1) * noiseStrength;
        float distortion = sin(uv.x * 10.0 + time) * 0.1 + mousePosition.y * 0.1;
        uv.y += distortion + noise;
        vec2 mouseEffect = (uv - mousePosition) * 0.1;
        uv += mouseEffect;
        float audioValue = texture2D(audioDataTexture, vec2(uv.x, 0.0)).r;
        uv.y += audioValue * 0.1;
        vec4 color1 = texture2D(texture1, uv);
        vec4 color2 = texture2D(texture2, uv);
        vec4 color = mix(color1, color2, 0.5 + 0.5 * sin(time));
        color.rgb += vec3(noise * 0.2);
        gl_FragColor = color;
      }
    `;

    shaderRef.current = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    // Set up audio context and analyser
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContext.createAnalyser();
    analyserRef.current.fftSize = 256;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      })
      .catch((err) => {
        console.error('Error accessing microphone:', err);
        setError(err);
      });

    return () => {
      audioContext.close();
    };
  }, [fetchFluxImage, generateGanTexture, isWebGLSupported]);

  useEffect(() => {
    // Update textures when loaded
    if (shaderRef.current && texture && ganTexture) {
      shaderRef.current.uniforms.texture1.value = texture;
      shaderRef.current.uniforms.texture2.value = ganTexture;
    }
  }, [texture, ganTexture]);

  useFrame(() => {
    if (meshRef.current && shaderRef.current && !isLoading) {
      // Update shader uniforms
      shaderRef.current.uniforms.time.value += 0.01;

      // Update audio data
      if (analyserRef.current) {
        const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(freqData);
        setAudioData(freqData);

        // Create audio data texture
        const audioTexture = new THREE.DataTexture(freqData, freqData.length, 1, THREE.LuminanceFormat);
        audioTexture.needsUpdate = true;
        shaderRef.current.uniforms.audioDataTexture.value = audioTexture;
      }

      // Generate new GAN texture periodically
      if (Math.random() < 0.01) { // 1% chance each frame
        generateGanTexture();
      }
    }
  });

  // Gesture controls
  const bind = useGesture({
    onPointerMove: ({ xy: [x, y] }) => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.mousePosition.value.set(
          x / window.innerWidth,
          1 - y / window.innerHeight
        );
      }
    },
    onPinch: ({ offset: [d] }) => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.zoom.value = Math.max(1, Math.min(3, d));
        shaderRef.current.uniforms.noiseScale.value = Math.max(0.1, Math.min(1.0, d / 100));
      }
    },
    onRotate: ({ angle }) => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.rotation.value = angle;
      }
    }
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isWebGLSupported) {
    return <div>WebGL is not supported on this device</div>;
  }

  return (
    <ErrorBoundary>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <mesh ref={meshRef} {...bind()} data-testid="flux-image-mesh">
          <planeGeometry args={[2, 2]} />
          <primitive object={shaderRef.current} attach="material" />
        </mesh>
      )}
    </ErrorBoundary>
  );
};

// Performance optimization
const MemoizedFluxImageRenderer = React.memo(FluxImageRenderer);

export default MemoizedFluxImageRenderer;

// Unit tests for FluxImageRenderer component
if (process.env.NODE_ENV === 'test') {
  const { render, act } = require('@testing-library/react');
  const { Canvas } = require('@react-three/fiber');

  describe('FluxImageRenderer', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('renders without crashing', () => {
      render(
        <Canvas>
          <FluxImageRenderer />
        </Canvas>
      );
    });

    it('shows loading state initially', () => {
      const { getByText } = render(
        <Canvas>
          <FluxImageRenderer />
        </Canvas>
      );
      expect(getByText('Loading...')).toBeInTheDocument();
    });

    it('handles errors gracefully', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('API Error'));

      await act(async () => {
        const { getByText } = render(
          <Canvas>
            <FluxImageRenderer />
          </Canvas>
        );
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(getByText('Error: API Error')).toBeInTheDocument();
      });
    });

    // Add more tests as needed
  });
}

// TODO: Implement generative AI animation
// TODO: Add WebGL shader effects
// TODO: Add WebGL shader effects
// TODO: Integrate gesture controls or audio-reactivity
