const tf = {
  ready: jest.fn().mockResolvedValue(undefined),
  sequential: jest.fn().mockReturnValue({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({}),
    predict: jest.fn().mockReturnValue({
      data: jest.fn().mockResolvedValue([0.5]),
      dataSync: jest.fn().mockReturnValue([0.5]),
      dispose: jest.fn(),
    }),
  }),
  layers: {
    dense: jest.fn().mockReturnValue({
      apply: jest.fn(),
    }),
  },
  randomNormal: jest.fn().mockReturnValue({
    mul: jest.fn().mockReturnValue({
      add: jest.fn().mockReturnValue({}),
    }),
  }),
  scalar: jest.fn().mockReturnValue({
    mul: jest.fn().mockReturnValue({}),
    add: jest.fn().mockReturnValue({}),
  }),
  tensor2d: jest.fn().mockReturnValue({
    mul: jest.fn().mockReturnValue({}),
    add: jest.fn().mockReturnValue({}),
  }),
  version: {
    tfjs: 'mocked-version',
  },
};

module.exports = tf;
