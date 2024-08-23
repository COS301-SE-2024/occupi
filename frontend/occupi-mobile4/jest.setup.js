import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('@/services/securestore', () => ({
  storeTheme: jest.fn(),
  storeAccentColour: jest.fn(),
}));

// Mock @gluestack-ui/themed
jest.mock('@gluestack-ui/themed', () => ({
  Icon: 'Icon',
  View: 'View',
  ScrollView: 'ScrollView',
  Text: 'Text',
  Image: 'Image',
  Box: 'Box',
  createToastHook: jest.fn(),
  // Add any other components you're using from @gluestack-ui/themed
}));