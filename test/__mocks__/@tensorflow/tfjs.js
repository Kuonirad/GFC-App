const mockPredict = jest.fn().mockReturnValue({
  data: jest.fn().mockResolvedValue([0.5]),
});

const mockSequential = jest.fn(() => ({
  add: jest.fn(),
  compile: jest.fn(),
  fit: jest.fn().mockResolvedValue({}),
  predict: mockPredict,
  dispose: jest.fn(),
}));

const mockLayers = {
  dense: jest.fn(() => ({})),
  activation: jest.fn(),
  // Add other layers if needed
};

const mockRandomNormal = jest.fn(() => ({
  mul: jest.fn().mockReturnThis(),
  add: jest.fn().mockReturnThis(),
}));

const mockTensor2d = jest.fn(() => ({
  data: jest.fn().mockResolvedValue([0.5]),
}));

const mockTf = {
  sequential: mockSequential,
  layers: mockLayers,
  randomNormal: mockRandomNormal,
  tensor2d: mockTensor2d,
  ready: jest.fn(() => Promise.resolve()),
  scalar: jest.fn(() => ({ mul: jest.fn(), add: jest.fn() })),
};

module.exports = mockTf;
