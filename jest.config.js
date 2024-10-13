export default {
  // Other configurations...
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testTimeout: 10000, // Increase global timeout to 10 seconds
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  // Add this line to mock TensorFlow.js
  moduleNameMapper: {
    '^@tensorflow/tfjs$': '<rootDir>/src/__mocks__/@tensorflow/tfjs.js',
  },
};
