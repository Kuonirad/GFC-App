const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const { AppError, logger } = require('./utils/errorHandler');
const util = require('util');

let db;

// Promisify db methods
const runAsync = (sql, params) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});
const allAsync = (sql, params) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

/**
 * Connects to SQLite database and initializes the images table.
 * @param {string} dbPath - Path to the SQLite database file. Defaults to in-memory database.
 * @returns {Promise<object>} - The database connection object.
 * @throws {AppError} If connection or table creation fails.
 */
async function connectToSQLite(dbPath = ':memory:') {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        logger.error('Failed to connect to SQLite:', err);
        reject(new AppError('Failed to connect to SQLite', 'DATABASE_CONNECTION', 500, err));
      } else {
        logger.info('Successfully connected to SQLite');
        try {
          await runAsync(`CREATE TABLE IF NOT EXISTS images (
            id TEXT PRIMARY KEY,
            source TEXT,
            data TEXT,
            fetchedAt TEXT
          )`);
          resolve(db);
        } catch (tableErr) {
          logger.error('Failed to create table:', tableErr);
          reject(new AppError('Failed to create table', 'DATABASE_OPERATION', 500, tableErr));
        }
      }
    });
  });
}

/**
 * Fetches all flux images from the database.
 * @returns {Promise<Array>} - Array of flux image objects.
 * @throws {AppError} If fetching fails.
 */
async function fetchFluxImages() {
  try {
    return await allAsync('SELECT * FROM images');
  } catch (err) {
    logger.error('Failed to fetch flux images:', err);
    throw new AppError('Failed to fetch flux images', 'DATABASE_OPERATION', 500, err);
  }
}

/**
 * Fetches a URL with retry mechanism.
 * @param {string} url - The URL to fetch.
 * @param {number} retries - Number of retry attempts.
 * @param {number} delay - Delay between retries in milliseconds.
 * @returns {Promise<object>} - The axios response object.
 * @throws {Error} If all retry attempts fail.
 */
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      logger.warn(`Retry attempt ${i + 1} for URL: ${url}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Fetches a random image from the API and stores it in the database.
 * @returns {Promise<object>} - The fetched and stored image object.
 * @throws {AppError} If fetching or storing fails.
 */
async function fetchRandomImage() {
  try {
    const response = await fetchWithRetry('https://api.blackforestlabs.com/v1/random');
    const { id, image } = response.data;
    if (!id || !image) {
      throw new AppError('Invalid response from API', 'API_RESPONSE', 400);
    }
    const newImage = {
      id,
      source: 'blackforest',
      data: JSON.stringify({ image }),
      fetchedAt: new Date().toISOString()
    };
    await insertImage(newImage);
    return newImage;
  } catch (error) {
    logger.error('Error fetching random image:', error);
    throw new AppError('Failed to fetch random image', 'API_REQUEST', 500, error);
  }
}

/**
 * Fetches a specific flux image from the API and stores it in the database.
 * @param {string} imageId - The ID of the image to fetch.
 * @param {string} source - The source of the image.
 * @returns {Promise<object>} - The fetched and stored image object.
 * @throws {AppError} If fetching or storing fails, or if input is invalid.
 */
async function fetchFluxImage(imageId, source) {
  if (!imageId || typeof imageId !== 'string') {
    throw new AppError('Invalid imageId', 'INVALID_INPUT', 400);
  }
  if (!source || typeof source !== 'string') {
    throw new AppError('Invalid source', 'INVALID_INPUT', 400);
  }
  try {
    const response = await fetchWithRetry(`https://api.blackforestlabs.com/v1/image/${imageId}`);
    const { image } = response.data;
    if (!image) {
      throw new AppError('Invalid response from API', 'API_RESPONSE', 400);
    }
    const newImage = {
      id: imageId,
      source,
      data: JSON.stringify({ image }),
      fetchedAt: new Date().toISOString()
    };
    await insertImage(newImage);
    return newImage;
  } catch (error) {
    logger.error('Error fetching flux image:', error);
    throw new AppError('Failed to fetch flux image', 'API_REQUEST', 500, error);
  }
}

/**
 * Inserts or updates an image in the database.
 * @param {object} image - The image object to insert or update.
 * @throws {AppError} If the image object is invalid or if the insertion fails.
 */
async function insertImage(image) {
  if (!image || typeof image !== 'object' || !image.id || !image.source || !image.data || !image.fetchedAt) {
    throw new AppError('Invalid image object', 'INVALID_INPUT', 400);
  }
  try {
    await runAsync('INSERT OR REPLACE INTO images (id, source, data, fetchedAt) VALUES (?, ?, ?, ?)',
      [image.id, image.source, image.data, image.fetchedAt]);
  } catch (err) {
    throw new AppError('Failed to insert image', 'DATABASE_OPERATION', 500, err);
  }
}

/**
 * Updates an existing image in the database.
 * @param {object} image - The image object to update.
 * @throws {AppError} If the image object is invalid or if the update fails.
 */
async function updateImage(image) {
  if (!image || typeof image !== 'object' || !image.id || !image.source || !image.data || !image.fetchedAt) {
    throw new AppError('Invalid image object', 'INVALID_INPUT', 400);
  }
  try {
    const result = await runAsync('UPDATE images SET source = ?, data = ?, fetchedAt = ? WHERE id = ?',
      [image.source, image.data, image.fetchedAt, image.id]);
    if (result.changes === 0) {
      throw new AppError('Image not found', 'NOT_FOUND', 404);
    }
  } catch (err) {
    throw new AppError('Failed to update image', 'DATABASE_OPERATION', 500, err);
  }
}

/**
 * Deletes an image from the database.
 * @param {string} imageId - The ID of the image to delete.
 * @throws {AppError} If the deletion fails.
 */
async function deleteImage(imageId) {
  try {
    const result = await runAsync('DELETE FROM images WHERE id = ?', [imageId]);
    if (result.changes === 0) {
      throw new AppError('Image not found', 'NOT_FOUND', 404);
    }
  } catch (err) {
    throw new AppError('Failed to delete image', 'DATABASE_OPERATION', 500, err);
  }
}

module.exports = {
  connectToSQLite,
  fetchFluxImages,
  fetchRandomImage,
  fetchFluxImage,
  insertImage,
  updateImage,
  deleteImage,
  db
};
