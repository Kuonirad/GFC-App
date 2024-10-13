import * as tf from '@tensorflow/tfjs';
import { createAndTrainModel } from './tensorFunctions';

// Test function for TensorFlow.js
export const testTensorFlowModel = async () => {
  const inputData = [1, 2, 3, 4];
  const labels = [2, 4, 6, 8];

  const model = await createAndTrainModel(inputData, labels);

  // Test the model
  const testInput = tf.tensor2d([5], [1, 1]);
  const prediction = model.predict(testInput);

  console.log('Test input:', testInput.dataSync());
  console.log('Prediction:', prediction.dataSync());

  return prediction.dataSync()[0];
};
