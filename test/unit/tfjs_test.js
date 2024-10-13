// Test file for TensorFlow.js import and usage
import * as tf from '@tensorflow/tfjs';

const isDevelopment = process.env.NODE_ENV === 'development';
const customLogger = (message, ...args) => {
  if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
};

// TODO: Replace customLogger with a proper logging system for production use

async function testTensorFlow() {
  try {
    await tf.ready();
    customLogger('TensorFlow.js is ready');

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    customLogger('Model created successfully');

    const tensor = tf.tensor2d([[1], [2], [3], [4]], [4, 1]);
    customLogger('Tensor created successfully:', tensor);

    const result = model.predict(tensor);
    customLogger('Prediction made successfully:', result);

    customLogger('All TensorFlow.js operations completed successfully');
  } catch (error) {
    customLogger('Error in TensorFlow.js test:', error);
  }
}

testTensorFlow();

export default testTensorFlow;
