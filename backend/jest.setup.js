// jest.setup.js

// Set the environment to 'test'
process.env.NODE_ENV = 'test';

// Configure SQLite to use in-memory database for testing
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

beforeAll(async () => {
  global.testDb = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  // Create necessary tables for testing
  await global.testDb.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      source TEXT,
      data TEXT,
      fetchedAt TEXT
    )
  `);
});

afterAll(async () => {
  await global.testDb.close();
});
