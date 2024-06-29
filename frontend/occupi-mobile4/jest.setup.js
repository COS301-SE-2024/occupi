global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
import 'react-native-gesture-handler/jestSetup';

jest.useFakeTimers();

it('should render SplashScreen and navigate after timeout', () => {
  const tree = renderer.create(<SplashScreen />);
  expect(tree).toBeTruthy();

  jest.runAllTimers();

  // Add assertions for navigation here
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) => {
      return React.createElement(View, props, children);
    },
  };
});

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(),
  heightPercentageToDP: jest.fn(),
}));

jest.mock('@ui-kitten/components', () => ({
  ViewPager: 'ViewPager',
}));
  
  jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
  });