import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const PropTypes = require('prop-types');

  const MockIcon = (props) => {
    return React.createElement('svg', {
      ...props,
      children: props.children || 'icon',
    });
  };

  MockIcon.propTypes = {
    name: PropTypes.string,
  };

  return {
    Ionicons: MockIcon,
    Octicons: MockIcon,
    Feather: MockIcon,
    FontAwesome6: MockIcon,
  };
});

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  }));
  
jest.mock('expo-blur', () => {
  const React = require('react');
  const MockBlurView = (props) => {
    return React.createElement('view', props, props.children);
  };
  return {
    BlurView: MockBlurView,
  };
});

jest.mock('react-native-responsive-screen', () => {
  return {
    widthPercentageToDP: jest.fn((value) => value),
    heightPercentageToDP: jest.fn((value) => value),
  };
});

jest.mock('expo-router', () => ({
    useRouter: () => ({
      push: jest.fn(),
    }),
  }));

jest.mock('@gluestack-ui/themed', () => ({
    ...jest.requireActual('@gluestack-ui/themed'),
    useToast: () => ({
      show: jest.fn(),
    }),
  }));
