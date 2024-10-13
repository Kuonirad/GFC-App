import '@testing-library/jest-dom/extend-expect';

// Mock for documentTimeline
global.documentTimeline = {
  children: {
    add: jest.fn(), // Mock the 'add' method
  },
};

// Mock for fetch if used in your component
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ image: 'mocked-image-url' }),
  })
);
