// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
      setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],

    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  };
  