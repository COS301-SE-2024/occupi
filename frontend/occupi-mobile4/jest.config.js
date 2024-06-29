module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js', 'react-native-gesture-handler/jestSetup'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|@ui-kitten|@gluestack-ui|expo-blur|expo-linear-gradient|expo-router|@expo|expo-font|react-native-chart-kit|expo|@expo-google-fonts)/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
    '^.+\\.(png|jpg|jpeg|svg)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': require.resolve('react-native'),
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^react$': require.resolve('react'),
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.js',
    '^@gluestack-ui/themed$': '<rootDir>/__mocks__/gluestack-ui-themed.js',
    '^.+\\.svg$': 'jest-svg-transformer',

  },
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)(spec|test).js?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};