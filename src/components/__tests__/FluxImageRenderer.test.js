import React from 'react';
import { render } from '@testing-library/react';
import FluxImageRenderer from '../FluxImageRenderer';

jest.mock('@tensorflow/tfjs', () => require('../../../__mocks__/@tensorflow/tfjs.js'));

test('renders FluxImageRenderer component correctly', () => {
  const { asFragment } = render(<FluxImageRenderer />);
  expect(asFragment()).toMatchSnapshot();
});
