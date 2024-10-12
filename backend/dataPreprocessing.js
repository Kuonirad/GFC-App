const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const { fetchFluxImage, fetchRandomImage } = require('./dataAcquisition');

async function preprocessFluxImage(imageId, source) {
  try {
    const imageData = await fetchFluxImage(imageId, source);
    const image = await sharp(Buffer.from(imageData.url || imageData, 'base64'))
      .resize(256, 256)
      .toBuffer();
    const tensor = tf.node.decodeImage(image, 3);
    return tensor.expandDims(0).toFloat().div(tf.scalar(255));
  } catch (error) {
    console.error('Error preprocessing flux image:', error);
    throw error;
  }
}

function applyDataAugmentation(tensor) {
  // Apply random rotation
  const rotation = tf.randomUniform([], 0, 2 * Math.PI);
  let augmentedTensor = tf.image.rotateWithOffset(tensor, rotation);

  // Apply random brightness adjustment
  const brightness = tf.randomUniform([], -0.2, 0.2);
  augmentedTensor = tf.image.adjustBrightness(augmentedTensor, brightness);

  // Apply random contrast adjustment
  const contrast = tf.randomUniform([], 0.8, 1.2);
  augmentedTensor = tf.image.adjustContrast(augmentedTensor, contrast);

  // Apply random flip
  if (tf.randomUniform([], 0, 1).dataSync()[0] > 0.5) {
    augmentedTensor = tf.image.flipLeftRight(augmentedTensor);
  }

  // Apply random zoom
  const zoom = tf.randomUniform([], 0.8, 1.2);
  const [height, width] = augmentedTensor.shape.slice(1, 3);
  const zoomedSize = [Math.round(height * zoom.dataSync()[0]), Math.round(width * zoom.dataSync()[0])];
  augmentedTensor = tf.image.resizeBilinear(augmentedTensor, zoomedSize);
  augmentedTensor = tf.image.cropAndResize(
    augmentedTensor,
    [[0, 0, 1, 1]],
    [0],
    [height, width]
  );

  return augmentedTensor;
}

async function automatePreprocessingPipeline(batchSize = 32) {
  const batch = [];
  for (let i = 0; i < batchSize; i++) {
    try {
      const { imageId, source } = await fetchRandomImage();
      const tensor = await preprocessFluxImage(imageId, source);
      const augmentedTensor = applyDataAugmentation(tensor);
      batch.push(augmentedTensor);
    } catch (error) {
      console.error('Error in preprocessing pipeline:', error);
      // Continue with the next image if there's an error
      continue;
    }
  }
  return tf.concat(batch);
}

module.exports = { preprocessFluxImage, applyDataAugmentation, automatePreprocessingPipeline };
