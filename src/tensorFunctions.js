import * as tf from '@tensorflow/tfjs';

// Example TensorFlow.js function
export const createAndTrainModel = async (inputData, labels) => {
  const model = tf.sequential();
  model.add(tf.layers.dense({units: 1, inputShape: [1]}));
  model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

  const xs = tf.tensor2d(inputData, [inputData.length, 1]);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  await model.fit(xs, ys, {epochs: 10});

  return model;
};
