const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');

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
    console.error('Error fetching flux image:', error);
    throw error;
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
    console.error('Error preprocessing flux image:', error);
    throw error;
  }
}

app.get('/', (req, res) => {
  res.send('Welcome to the Generativ Flux Creator (GFC) App Backend');
});

// TODO: Add routes for handling flux images and generative AI animation

app.listen(port, () => {
  console.log(`GFC App backend server running on port ${port}`);
});
