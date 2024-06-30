module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gluestack-ui|expo-blur|expo-linear-gradient|expo-router|react-native-chart-kit)'
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native-chart-kit$': '<rootDir>/__mocks__/react-native-chart-kit.js',
    '^@gluestack-ui/themed$': '<rootDir>/__mocks__/gluestack-ui-themed.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.js',
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};