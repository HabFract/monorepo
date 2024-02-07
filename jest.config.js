/** @type {import('ts-jest').JestConfigWithTsJest} */

const esModules = ['d3', 'd3-svg-legend'].join('|');

module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/tests'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  setupFiles: ['./tests/setupTests.ts'],
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.tsx?$": "ts-jest",
    "\\.(gql|graphql)$": "jest-transform-graphql",
    "d3": "ts-jest"
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/.pnpm/d3@7.8.5/node_modules/.*", `<rootDir>/node_modules/.pnpm/d3@7.8.5/node_modules/(?!${esModules})`],
  moduleNameMapper: { "\\.(css|less|graphql)$": "<rootDir>/tests/styleMock.js" },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
};