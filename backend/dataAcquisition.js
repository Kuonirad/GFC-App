const axios = require('axios');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'gfc_app';
const COLLECTION_NAME = 'flux_images';
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

let client;

async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

async function fetchFluxImage(imageId, source = 'blackforest') {
  const db = await connectToMongoDB();
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Check if image is in cache
    const cachedImage = await collection.findOne({ imageId, source });
    if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_EXPIRATION_TIME) {
      console.log('Image found in cache');
      return cachedImage.data;
    }

    // If not in cache or expired, fetch from API
    let response;
    switch (source) {
      case 'blackforest':
        response = await axios.get(`https://api.blackforestlabs.com/v1/flux-images/${imageId}`, {
          headers: { 'Authorization': `Bearer ${process.env.BLACK_FOREST_LABS_API_KEY}` }
        });
        break;
      case 'nasa':
        response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&date=${imageId}`);
        break;
      case 'esa':
        response = await axios.get(`https://www.esa.int/ESA_Multimedia/Images/${imageId}`);
        break;
      default:
        throw new Error('Invalid source specified');
    }

    // Cache the fetched image
    await collection.updateOne(
      { imageId, source },
      { $set: { data: response.data, timestamp: Date.now() } },
      { upsert: true }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching image from ${source}:`, error);
    throw new Error(`Failed to fetch image from ${source}: ${error.message}`);
  }
}

async function fetchRandomImage() {
  const sources = ['blackforest', 'nasa', 'esa'];
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  const randomId = Math.random().toString(36).substring(7);
  return fetchFluxImage(randomId, randomSource);
}

async function clearOldCache() {
  const db = await connectToMongoDB();
  const collection = db.collection(COLLECTION_NAME);

  try {
    const expirationTimestamp = Date.now() - CACHE_EXPIRATION_TIME;
    const result = await collection.deleteMany({ timestamp: { $lt: expirationTimestamp } });
    console.log(`Cleared ${result.deletedCount} old cache entries`);
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}

// Run cache clearing every 24 hours
setInterval(clearOldCache, CACHE_EXPIRATION_TIME);

module.exports = { fetchFluxImage, fetchRandomImage, clearOldCache };
