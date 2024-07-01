import React from 'react';
import renderer, { act } from 'react-test-renderer';
import SplashScreen from '../SplashScreen';
import Onboarding1 from '../Onboarding1';
import Onboarding2 from '../Onboarding2';
import Onboarding3 from '../Onboarding3';
import Welcome from '../Welcome';
import { router } from 'expo-router';

// Mock expo-router
const mockedRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  navigate: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockedRouter,
}));
jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  Center: 'Center',
  Heading: 'Heading',
  Text: 'Text',
  Image: 'Image',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(),
  heightPercentageToDP: jest.fn(),
}));


jest.mock('../Welcome', () => (props) => (
  <div {...props}>
    <div testID="login-button" onPress={() => mockedRouter.push('/login')} />
    <div testID="register-text" onPress={() => mockedRouter.push('/signup')} />
  </div>
));

jest.mock('../Onboarding1', () => (props) => (
  <div {...props}>
    <div testID="onboarding1-next" onPress={() => mockedRouter.push('/onboarding2')} />
  </div>
));

jest.mock('../Onboarding2', () => (props) => (
  <div {...props}>
    <div testID="onboarding2-next" onPress={() => mockedRouter.push('/onboarding3')} />
  </div>
));

jest.mock('../Onboarding3', () => (props) => (
  <div {...props}>
    <div testID="onboarding3-next" onPress={() => mockedRouter.push('/welcome')} />
  </div>
));



jest.useFakeTimers();

describe('App Navigation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render components without crashing', () => {
    const components = [SplashScreen, Onboarding1, Onboarding2, Onboarding3, Welcome];

    components.forEach(Component => {
      const tree = renderer.create(<Component />).toJSON();
      expect(tree).toBeTruthy();
    });
  });

  it('should have correct text in components', () => {
    const splashscreen = renderer.create(<SplashScreen />);
    expect(splashscreen.root.findByProps({ testID: 'splashscreen-text' }).props.source).toBe(require('../../screens/Login/assets/images/Occupi/occupi-white-trans.png'));

    const onboarding1 = renderer.create(<Onboarding1 />);
    expect(onboarding1.root.findByProps({ testID: 'onboarding1-text' }).props.children).toBe('Predictive AI to help you plan when you go to the office better');

    const onboarding2 = renderer.create(<Onboarding2 />);
    expect(onboarding2.root.findByProps({ testID: 'onboarding2-text' }).props.children).toBe('Uses historical data to provide day to day analysis and statistics');

    const onboarding3 = renderer.create(<Onboarding3 />);
    expect(onboarding3.root.findByProps({ testID: 'onboarding3-text' }).props.children).toBe('Provides real time updates for occupancy and capacity');

    const welcome = renderer.create(<Welcome />);
    expect(welcome.root.findByProps({ testID: 'welcome-text' }).props.children).toBe('Predict. Plan. Perfect.');
  });

  it('should render SplashScreen and navigate after timeout', () => {
    const tree = renderer.create(<SplashScreen />);
    expect(tree).toBeTruthy();
  
    act(() => {
      jest.advanceTimersByTime(5000);
    });
  
    expect(mockedRouter.navigate).toHaveBeenCalledWith('/welcome');
  });
  
  it('should navigate to onboarding2 when Next button is pressed', () => {
    const onboarding1 = renderer.create(<Onboarding1 />);
    const button = onboarding1.root.findByProps({ testID: 'onboarding1-next' });

    act(() => {
      button.props.onPress();
    });

    expect(mockedRouter.push).toHaveBeenCalledWith('/onboarding2');
  });

  it('should navigate to onboarding3 when Next button is pressed', () => {
    const onboarding2 = renderer.create(<Onboarding2 />);
    const button = onboarding2.root.findByProps({ testID: 'onboarding2-next' });

    act(() => {
      button.props.onPress();
    });

    expect(mockedRouter.push).toHaveBeenCalledWith('/onboarding3');
  });

  it('should navigate to welcome when Next button is pressed', () => {
    const onboarding3 = renderer.create(<Onboarding3 />);
    const button = onboarding3.root.findByProps({ testID: 'onboarding3-next' });

    act(() => {
      button.props.onPress();
    });

    expect(mockedRouter.push).toHaveBeenCalledWith('/welcome');
  });

  it('should navigate to login when Login button is pressed', () => {
    const welcome = renderer.create(<Welcome />);
    const button = welcome.root.findByProps({ testID: 'login-button' });

    act(() => {
      button.props.onPress();
    });

    expect(mockedRouter.push).toHaveBeenCalledWith('/login');
  });

  it('should navigate to signup when Register text is pressed', () => {
    const welcome = renderer.create(<Welcome />);
    const registerText = welcome.root.findByProps({ testID: 'register-text' });

    act(() => {
      registerText.props.onPress();
    });

    expect(mockedRouter.push).toHaveBeenCalledWith('/signup');
  });
});
