const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const { AppError, logger, globalErrorHandler } = require('./utils/errorHandler');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Utility function to fetch flux image from Black Forest Labs API
async function fetchFluxImage(imageId) {
  try {
    const response = await axios.get(`https://api.blackforestlabs.com/v1/flux-images/${imageId}`, {
      headers: { 'Authorization': `Bearer ${process.env.BLACK_FOREST_LABS_API_KEY}` }
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching flux image:', error);
    throw new AppError('Failed to fetch flux image', 'API_REQUEST', 500, error);
  }
}

// Utility function to preprocess flux image data
async function preprocessFluxImage(imageData) {
  try {
    const image = await sharp(Buffer.from(imageData, 'base64'))
      .resize(256, 256)
      .toBuffer();
    const tensor = tf.node.decodeImage(image, 3);
    return tensor.expandDims(0).toFloat().div(tf.scalar(255));
  } catch (error) {
    logger.error('Error preprocessing flux image:', error);
    throw new AppError('Failed to preprocess flux image', 'IMAGE_PROCESSING', 500, error);
  }
}

app.get('/', (req, res) => {
  res.send('Welcome to the Generativ Flux Creator (GFC) App Backend');
});

// TODO: Add routes for handling flux images and generative AI animation

// Global error handling middleware
app.use(globalErrorHandler);

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Throw the error and let the uncaughtException handler deal with it
  throw err;
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Exit the process to prevent potential issues
  process.exit(1);
});

app.listen(port, () => {
  logger.info(`GFC App backend server running on port ${port}`);
});
