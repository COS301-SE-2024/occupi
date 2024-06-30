// import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-navigation/stack', () => {
  return {
    createStackNavigator: jest.fn(() => ({
      Navigator: 'Navigator',
      Screen: 'Screen',
    })),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
      SettingsManager: {
        settings: { AppleLocale: 'en_US' },
        get: jest.fn(),
        set: jest.fn(),
      },
      StatusBarManager: {
        getHeight: jest.fn(),
      },
    },
    StyleSheet: {
      ...RN.StyleSheet,
      create: (styles) => styles,
      hairlineWidth: 1,
    },
    Dimensions: {
      get: jest.fn().mockImplementation((dim) => {
        switch (dim) {
          case 'window':
            return { width: 360, height: 640, scale: 2, fontScale: 2 };
          case 'screen':
            return { width: 360, height: 640, scale: 2, fontScale: 2 };
          default:
            return { width: 360, height: 640, scale: 2, fontScale: 2 };
        }
      }),
      set: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      screen: {
        width: 360,
        height: 640,
        scale: 2,
        fontScale: 2,
      },
      window: {
        width: 360,
        height: 640,
        scale: 2,
        fontScale: 2,
      },
    },
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 2),
      getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
      roundToNearestPixel: jest.fn((size) => Math.round(size)),
    },
  };
});

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    GestureHandlerRootView: View,
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
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
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

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(),
  heightPercentageToDP: jest.fn(),
}));

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

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({
    getConstants: () => ({}),
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

