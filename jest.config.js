/** @type {import('ts-jest').JestConfigWithTsJest} */const path = require('path');

const esModules = ['d3-selection', 'd3-array', 'd3-scale', 'd3-path', 'd3-zoom', 'd3-shape', 'd3-hierarchy', 'd3-ease']

const moduleNameMappers = esModules.reduce((acc, pkg) => {
	acc[`^${pkg}$`] = path.join(require.resolve(pkg), `../../dist/${pkg}.min.js`);
	return acc;
}, {});

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  roots: ['<rootDir>/tests'],
  testEnvironment: './tests/fixJsDomEnv.ts',

  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  setupFiles: ['./tests/setupTests.ts', "fake-indexeddb/auto"],

  moduleNameMapper: {
    "\\.(css|less|graphql)$": "<rootDir>/tests/styleMock.js",
    ...moduleNameMappers
  },
  transformIgnorePatterns: [
    'node_modules/(?!d3-*/)',
  ],
  transform: {
    "\\.(gql|graphql)$": "jest-transform-graphql",
    '^jotai-minidb$': ['ts-jest'],
    '^.+\\.tsx?$': 'ts-jest',
  },
};