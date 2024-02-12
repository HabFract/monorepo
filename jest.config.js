/** @type {import('ts-jest').JestConfigWithTsJest} */

const path = require('path');

const esModules = ['d3-selection', 'd3-array', 'd3-scale', 'd3-path', 'd3-zoom', 'd3-shape', 'd3-hierarchy', 'd3-ease']

const moduleNameMappers = esModules.reduce((acc, pkg) => {
	acc[`^${pkg}$`] = path.join(require.resolve(pkg), `../../dist/${pkg}.min.js`);
	return acc;
}, {});

module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/tests'],
  testEnvironment: './tests/fixJsDomEnv.ts',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  setupFiles: ['./tests/setupTests.ts', "fake-indexeddb/auto"],
  transform: {
    "^.+\\.ts?$":  ['ts-jest'],
    "^.+\\.tsx?$":  ['ts-jest'],
    "\\.(gql|graphql)$": "jest-transform-graphql",
    '^d3-scale$': ['ts-jest'],
    '^jotai-minidb$': ['ts-jest'],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!d3-*)'
  ],
  moduleNameMapper: {
    "\\.(css|less|graphql)$": "<rootDir>/tests/styleMock.js",
    ...moduleNameMappers
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  
  testPathIgnorePatterns: ['./dist']
};