// jest.config.js

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],//this crtlz
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@layouts/(.*)$": "<rootDir>/src/layouts/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@store/(.*)$": "<rootDir>/src/store/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': 'jest-transform-stub',
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
                                                                        