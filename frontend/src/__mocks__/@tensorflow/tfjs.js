const mockPredict = jest.fn();

const mockSequential = jest.fn(() => ({
  add: jest.fn(),
  compile: jest.fn(),
  fit: jest.fn(),
  predict: mockPredict,
}));

const mockLayers = {
  dense: jest.fn(() => ({})),
  activation: jest.fn(),
  // Add other layers if needed
};

const mockTf = {
  sequential: mockSequential,
  layers: mockLayers,
  ready: jest.fn(() => Promise.resolve()),
};

module.exports = mockTf;
