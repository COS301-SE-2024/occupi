import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { Animated } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View,
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = jest.fn();
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  addWhitelistedNativeProps: jest.fn(),
  addWhitelistedUIProps: jest.fn(),
  createAnimatedComponent: (Component) => Component,
  flushQueue: jest.fn(),
  generateNewAnimationId: jest.fn(),
  getCurrentTime: jest.fn(),
  getNativeAnimationModule: jest.fn(),
  getNativeAnimationProps: jest.fn(),
  getNodeHandler: jest.fn(),
  manageChildren: jest.fn(),
  startAnimatingNode: jest.fn(),
  stopAnimation: jest.fn(),
}));

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { View } = require('react-native');
  return {
    KeyboardAwareScrollView: View,
  };
});

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Feather: View,
    MaterialIcons: View,
  };
});
