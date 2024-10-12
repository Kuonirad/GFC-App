const { connectToSQLite, fetchFluxImages, fetchRandomImage, fetchFluxImage, insertImage, updateImage, deleteImage } = require('../dataAcquisition');
const axios = require('axios');

jest.mock('axios');
jest.setTimeout(10000); // Set timeout to 10 seconds

describe('Data Acquisition Tests', () => {
  let db;

  beforeAll(async () => {
    db = await connectToSQLite(':memory:');
  });

  afterAll((done) => {
    db.close(done);
  });

  beforeEach((done) => {
    db.run('DROP TABLE IF EXISTS images', (err) => {
      if (err) return done(err);
      db.run(`CREATE TABLE images (
        id TEXT PRIMARY KEY,
        source TEXT,
        data TEXT,
        fetchedAt TEXT
      )`, done);
    });
  });

  test('fetchFluxImages returns an array', async () => {
    await insertImage({ id: 'test1', source: 'blackforest', data: '{}', fetchedAt: new Date().toISOString() });
    const images = await fetchFluxImages();
    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBe(1);
    expect(images[0]).toHaveProperty('id', 'test1');
  });

  test('fetchRandomImage returns an object', async () => {
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: { id: 'random1', image: 'random_mock_image_data' },
    });

    const image = await fetchRandomImage();
    expect(typeof image).toBe('object');
    expect(image).toHaveProperty('id', 'random1');
    expect(image).toHaveProperty('source', 'blackforest');
    expect(image).toHaveProperty('data');
    expect(image).toHaveProperty('fetchedAt');
  });

  test('fetchFluxImage returns an object', async () => {
    const imageId = 'test-id';
    const source = 'blackforest';
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: { image: 'mock_image_data' },
    });

    const image = await fetchFluxImage(imageId, source);
    expect(typeof image).toBe('object');
    expect(image).toHaveProperty('id', imageId);
    expect(image).toHaveProperty('source', source);
    expect(JSON.parse(image.data)).toHaveProperty('image', 'mock_image_data');
    expect(image).toHaveProperty('fetchedAt');
  });

  test('updateImage updates an existing image', async () => {
    const initialImage = { id: 'update-test', source: 'blackforest', data: '{"image":"initial_data"}', fetchedAt: new Date().toISOString() };
    await insertImage(initialImage);

    const updatedImage = { ...initialImage, data: '{"image":"updated_data"}', fetchedAt: new Date().toISOString() };
    await updateImage(updatedImage);

    const images = await fetchFluxImages();
    expect(images.length).toBe(1);
    expect(images[0]).toHaveProperty('id', 'update-test');
    expect(JSON.parse(images[0].data)).toHaveProperty('image', 'updated_data');
  });

  test('deleteImage removes an image', async () => {
    const imageToDelete = { id: 'delete-test', source: 'blackforest', data: '{}', fetchedAt: new Date().toISOString() };
    await insertImage(imageToDelete);

    await deleteImage(imageToDelete.id);

    const images = await fetchFluxImages();
    expect(images.length).toBe(0);
  });
});
