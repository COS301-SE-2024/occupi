module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js',
    'react-native-gesture-handler/jestSetup'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-native-community|@expo|expo|@expo-google-fonts|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@gluestack-ui|@ui-kitten)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.(png|jpg|jpeg|svg)$': 'jest-transform-stub',  // Add this line to handle images
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': require.resolve('react-native'),
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^react$': require.resolve('react')
  },
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)(spec|test).js?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
