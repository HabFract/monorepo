/** @type {import('ts-jest').JestConfigWithTsJest} */const path = require('path');

const esModules = ['d3-selection', 'd3-array', 'd3-scale', 'd3-path', 'd3-zoom', 'd3-shape', 'd3-hierarchy', 'd3-ease']

const moduleNameMappers = esModules.reduce((acc, pkg) => {
	acc[`^${pkg}$`] = path.join(require.resolve(pkg), `../../dist/${pkg}.min.js`);
	return acc;
}, {});

module.exports = {
  roots: ['<rootDir>/tests'],
  testEnvironment: './tests/fixJsDomEnv.ts',

  extensionsToTreatAsEsm: ['.ts', 
'.min.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  setupFiles: ['./tests/setupTests.ts', "fake-indexeddb/auto"],

  moduleNameMapper: {
    // '^@apollo/client$': '<rootDir>/tests/apollo.cjs',
    "\\.(css|less|graphql)$": "<rootDir>/tests/styleMock.js",
    ...moduleNameMappers,

    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [
    `node_modules/(?!(${esModules.join("|")}))`,
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsConfig: '<rootDir>/tests/tsconfig.json',
    }
  ],
    '^.+\\.js?$': ['babel-jest'],
  '^jotai-minidb$': 'ts-jest',
  "\\.(gql|graphql)$": "jest-transform-graphql",
  },
};