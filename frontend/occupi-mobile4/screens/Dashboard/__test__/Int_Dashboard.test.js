import React from 'react';
import { act, create } from 'react-test-renderer';
import Dashboard from '../Dashboard';
import NavBar from '../../../components/NavBar';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@gluestack-ui/themed', () => ({
  Text: 'Text',
  View: 'View',
  Image: 'Image',
  Card: 'Card',
  Toast: 'Toast',
  useToast: () => ({
    show: jest.fn(),
  }),
  ToastTitle: 'ToastTitle',
  Button: 'Button',
  ButtonText: 'ButtonText',
  Icon: 'Icon',
  CalendarDaysIcon: 'CalendarDaysIcon',
  BellIcon: 'BellIcon',
}));

jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
}));

jest.mock('@expo/vector-icons', () => ({
  FontAwesome6: 'FontAwesome6',
  Feather: 'Feather',
  Ionicons: 'Ionicons',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(() => 100),
  heightPercentageToDP: jest.fn(() => 100),
}));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

describe('Dashboard and NavBar Integration Tests', () => {
  it('renders Dashboard with NavBar without crashing', () => {
    let tree;
    act(() => {
      tree = create(<Dashboard />);
    });
    expect(tree.toJSON()).toBeTruthy();
    expect(tree.root.findByType(NavBar)).toBeTruthy();
  });

  it('updates occupancy data periodically', () => {
    jest.useFakeTimers();
    let tree;
    act(() => {
      tree = create(<Dashboard />);
    });
    
    const initialOccupancy = tree.root.findByProps({ testID: 'occupancy-data' }).props.children;
    console.log('Initial Occupancy:', initialOccupancy);
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    tree.update(<Dashboard />); // Force update to simulate re-render
    
    const updatedOccupancy = tree.root.findByProps({ testID: 'occupancy-data' }).props.children;
    console.log('Updated Occupancy:', updatedOccupancy);
    expect(updatedOccupancy).not.toBe(initialOccupancy);
    
    jest.useRealTimers();
  });

  it('toggles check-in status', () => {
    let tree;
    act(() => {
      tree = create(<Dashboard />);
    });
    
    const checkInButton = tree.root.findByProps({ testID: 'checkInOutButton' });
    console.log(checkInButton.props); // Debug log
    act(() => {
      checkInButton.props.onPress();
    });
    
    const checkOutButton = tree.root.findByProps({ children: 'Check out' });
    expect(checkOutButton).toBeTruthy();
  });

  it('navigates to different screens when NavBar buttons are pressed', () => {
    const tree = create(<NavBar />);
    
    const buttons = tree.root.findAllByType('Button');
    const routes = ['/home', '/viewbookings', '/bookings', '/bookings', '/settings'];
    
    buttons.forEach((button, index) => {
      act(() => {
        button.props.onPress();
      });
      expect(router.push).toHaveBeenCalledWith(routes[index]);
    });
  });
});
