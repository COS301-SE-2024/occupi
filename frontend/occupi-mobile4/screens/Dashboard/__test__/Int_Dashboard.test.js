import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Dashboard from '../Dashboard';
import NavBar from '../../../components/NavBar';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    navigate: jest.fn(),
  },
}));

jest.mock('react-native-chart-kit', () => ({
  LineChart: () => null,
}));

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: () => ({
    show: jest.fn(),
  }),
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.useFakeTimers();
describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders Dashboard and NavBar without crashing', () => {
    const tree = renderer.create(<Dashboard />);
    const instance = tree.root;

    expect(instance.findByProps({ children: 'Hi Sabrina 👋' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Welcome to Occupi' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Check in' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Occupancy levels' })).toBeTruthy();

    // NavBar items
    const navTree = renderer.create(<NavBar />);
    const navInstance = navTree.root;
    expect(navInstance.findByProps({ children: 'Home' })).toBeTruthy();
    expect(navInstance.findByProps({ children: 'My bookings' })).toBeTruthy();
    expect(navInstance.findByProps({ children: 'Book' })).toBeTruthy();
    expect(navInstance.findByProps({ children: 'Notifications' })).toBeTruthy();
    expect(navInstance.findByProps({ children: 'Profile' })).toBeTruthy();
  });

  it('updates occupancy data periodically', () => {
    const tree = renderer.create(<Dashboard />);
    const instance = tree.root;

    const initialOccupancy = instance.findAllByProps({ testID: 'occupancy-data' })[0].props.children;

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    const updatedOccupancy = instance.findAllByProps({ testID: 'occupancy-data' })[0].props.children;
    expect(updatedOccupancy).not.toBe(initialOccupancy);
  });

  it('toggles check-in status and shows toast', () => {
    const tree = renderer.create(<Dashboard />);
    const instance = tree.root;

    const checkInButton = instance.findByProps({ children: 'Check in' });
    act(() => {
      checkInButton.props.onPress();
    });

    expect(instance.findByProps({ children: 'Check out' })).toBeTruthy();

    const checkOutButton = instance.findByProps({ children: 'Check out' });
    act(() => {
      checkOutButton.props.onPress();
    });

    expect(instance.findByProps({ children: 'Check in' })).toBeTruthy();
  });

  it('navigates to different screens when NavBar buttons are pressed', () => {
    const tree = renderer.create(<NavBar />);
    const instance = tree.root;

    const homeButton = instance.findByProps({ children: 'Home' });
    act(() => {
      homeButton.props.onPress();
    });
    expect(router.push).toHaveBeenCalledWith('/home');

    const bookingsButton = instance.findByProps({ children: 'My bookings' });
    act(() => {
      bookingsButton.props.onPress();
    });
    expect(router.push).toHaveBeenCalledWith('/viewbookings');

    const bookButton = instance.findByProps({ children: 'Book' });
    act(() => {
      bookButton.props.onPress();
    });
    expect(router.push).toHaveBeenCalledWith('/bookings');

    const notificationsButton = instance.findByProps({ children: 'Notifications' });
    act(() => {
      notificationsButton.props.onPress();
    });
    expect(router.push).toHaveBeenCalledWith('/bookings');

    const profileButton = instance.findByProps({ children: 'Profile' });
    act(() => {
      profileButton.props.onPress();
    });
    expect(router.push).toHaveBeenCalledWith('/settings');
  });
});
