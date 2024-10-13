import React, { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

const FluxImageRenderer = () => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    image: null,
    aiOutput: null,
    audioContext: null,
    analyser: null,
  });

  const fetchImage = useCallback(async () => {
    console.log('Fetching image...');
    try {
      const response = await fetch('/api/image');
      console.log('Fetch response:', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      if (data && data.image) {
        setState(prevState => ({
          ...prevState,
          loading: false,
          image: data.image,
        }));
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (err) {
      console.error('Error fetching image:', err);
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: `Failed to fetch image: ${err.message}`,
      }));
    }
  }, []);

  const generateAIAnimation = useCallback(async () => {
    console.log('Generating AI animation...');
    console.log('TensorFlow object:', tf);
    console.log('TensorFlow version:', tf.version);
    try {
      console.log('Before tf.ready()');
      await tf.ready();
      console.log('After tf.ready()');

      console.log('Creating sequential model');
      const model = tf.sequential();
      console.log('Model created:', model);

      console.log('Adding dense layer');
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
      console.log('Layer added');

      console.log('Compiling model');
      model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
      console.log('Model compiled');

      const xs = tf.randomNormal([100, 1]);
      const ys = xs.mul(tf.scalar(2)).add(tf.scalar(1));

      console.log('Fitting model');
      await model.fit(xs, ys, { epochs: 1 });
      console.log('Model fitted');

      const output = model.predict(tf.tensor2d([5], [1, 1]));
      const result = await output.data();
      console.log('AI animation result:', result[0]);

      // Use global.documentTimeline in test environment
      const timeline = (typeof window !== 'undefined' && window.documentTimeline) ||
                       (typeof global !== 'undefined' && global.documentTimeline) ||
                       null;
      console.log('Timeline object:', timeline);
      console.log('Timeline type:', typeof timeline);
      console.log('Timeline properties:', Object.keys(timeline || {}));

      if (timeline === null) {
        console.warn('Timeline is null. This might be due to running in a test environment.');
      } else if (typeof timeline === 'object') {
        console.log('Timeline children:', timeline.children);
        console.log('Timeline children type:', typeof timeline.children);

        if (timeline.children && typeof timeline.children.add === 'function') {
          const aiLayer = { type: 'AILayer', data: result[0] };
          timeline.children.add(aiLayer);
          console.log('AI layer added to timeline');
        } else {
          console.warn('timeline.children.add is not a function or timeline.children is undefined');
        }
      } else {
        console.warn('Timeline is not an object:', typeof timeline);
      }

      setState(prevState => ({
        ...prevState,
        aiOutput: result[0],
      }));

      xs.dispose();
      ys.dispose();
      output.dispose();
    } catch (err) {
      console.error('Error in generateAIAnimation:', err);
      setState(prevState => ({
        ...prevState,
        error: `Failed to generate AI animation: ${err.message}`,
      }));
    }
  }, []);

  const setupAudio = useCallback(() => {
    console.log('Setting up audio...');
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      console.log('Audio setup skipped: not in browser environment or in test mode');
      return;
    }
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      setState(prevState => ({
        ...prevState,
        audioContext: audioCtx,
        analyser: analyser,
      }));
    } catch (err) {
      console.error('Error setting up audio:', err);
      setState(prevState => ({
        ...prevState,
        error: `Failed to set up audio: ${err.message}`,
      }));
    }
  }, []);

  const initializeComponent = useCallback(async () => {
    console.log('Initializing component...');
    await fetchImage();
    await generateAIAnimation();
    setupAudio();
    console.log('Component initialization complete');
  }, [fetchImage, generateAIAnimation, setupAudio]);

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      if (isMounted) {
        await initializeComponent();
      }
    };
    initialize();
    return () => {
      isMounted = false;
      if (state.audioContext) {
        state.audioContext.close();
      }
      // Add any other cleanup logic here
    };
  }, [initializeComponent, state.audioContext]);

  useEffect(() => {
    console.log('Current state:', state);
  }, [state]);

  if (state.loading) {
    return <div data-testid="flux-image-container">Loading...</div>;
  }

  if (state.error) {
    return <div data-testid="flux-image-container">Error: {state.error}</div>;
  }

  return (
    <div data-testid="flux-image-container">
      {state.image && <img src={state.image} alt="Flux" />}
      {state.aiOutput && <p>AI Output: {state.aiOutput}</p>}
    </div>
  );
};

export default FluxImageRenderer;
