import 'react-native-gesture-handler/jestSetup';

// Mock the GestureHandlerRootView component
jest.mock('react-native-gesture-handler', () => {
  const actualGestureHandler = jest.requireActual('react-native-gesture-handler');
  return {
    ...actualGestureHandler,
    GestureHandlerRootView: (props) => <div {...props} />,
  };
});


// Mocking react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});


jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
  });
  
  jest.mock('react-native-gesture-handler', () => {});

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

  jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.NativeModules.StatusBarManager = {
      getHeight: jest.fn(),
    };
    return RN;
  });


jest.mock('@gluestack-ui/themed', () => ({
  Image: 'Image',
  Center: 'Center',
  Text: 'Text',
  Heading: 'Heading',
}));

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(),
  heightPercentageToDP: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));