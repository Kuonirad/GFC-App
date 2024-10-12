// craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'src'),
        'node_modules',
      ];
      webpackConfig.ignoreWarnings = [
        function ignoreSourceMapWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('@mediapipe/tasks-vision') &&
            warning.details &&
            warning.details.includes('Failed to parse source map')
          );
        },
      ];
      return webpackConfig;
    },
  },
  babel: {
    plugins: [
      ...(process.env.NODE_ENV === 'test' ? ['@babel/plugin-transform-modules-commonjs'] : []),
    ],
  },
  jest: {
    configure: {
      transformIgnorePatterns: [
        '/node_modules/(?!axios/)',
      ],
      transform: {
        '^.+\\.[tj]sx?$': 'babel-jest',
      },
    },
  },
};
