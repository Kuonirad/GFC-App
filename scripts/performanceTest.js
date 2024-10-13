const { performance } = require('perf_hooks');
const tf = require('@tensorflow/tfjs-node');

async function runPerformanceTest() {
  const startTime = performance.now();

  // Create a simple model
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  // Generate some random data
  const xs = tf.randomNormal([1000, 1]);
  const ys = xs.mul(tf.scalar(2)).add(tf.scalar(1));

  // Train the model
  await model.fit(xs, ys, {
    epochs: 10,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
      },
    },
  });

  const endTime = performance.now();
  console.log(`Performance test completed in ${(endTime - startTime).toFixed(2)} ms`);
}

runPerformanceTest().catch(console.error);
