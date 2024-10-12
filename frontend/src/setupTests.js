// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = () => {
  return {
    createProgram: jest.fn(),
    createShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    getProgramParameter: jest.fn(),
    useProgram: jest.fn(),
    getUniformLocation: jest.fn(),
    uniform1f: jest.fn(),
    uniform2f: jest.fn(),
    uniform3f: jest.fn(),
    uniform4f: jest.fn(),
    drawArrays: jest.fn(),
  };
};

// Mock AudioContext
window.AudioContext = jest.fn().mockImplementation(() => {
  return {
    createAnalyser: jest.fn().mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      fftSize: 0,
      getByteFrequencyData: jest.fn(),
    }),
    createMediaStreamSource: jest.fn().mockReturnValue({
      connect: jest.fn(),
    }),
  };
});

// Mock getUserMedia
navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({}),
};
