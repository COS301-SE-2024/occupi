import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Dashboard from '../Dashboard';
import NavBar from '../../components/NavBar';
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

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders Dashboard and NavBar without crashing', () => {
    const { getByText, getAllByText } = render(<Dashboard />);
    
    expect(getByText('Hi Sabrina 👋')).toBeTruthy();
    expect(getByText('Welcome to Occupi')).toBeTruthy();
    expect(getByText('Check in')).toBeTruthy();
    expect(getByText('Occupancy levels')).toBeTruthy();
    
    // NavBar items
    expect(getAllByText('Home')).toBeTruthy();
    expect(getAllByText('My bookings')).toBeTruthy();
    expect(getAllByText('Book')).toBeTruthy();
    expect(getAllByText('Notifications')).toBeTruthy();
    expect(getAllByText('Profile')).toBeTruthy();
  });

  it('updates occupancy data periodically', async () => {
    const { getAllByText } = render(<Dashboard />);
    
    const initialOccupancy = getAllByText(/\d+/)[0].props.children;
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      const updatedOccupancy = getAllByText(/\d+/)[0].props.children;
      expect(updatedOccupancy).not.toBe(initialOccupancy);
    });
  });

  it('toggles check-in status and shows toast', async () => {
    const { getByText } = render(<Dashboard />);
    
    const checkInButton = getByText('Check in');
    fireEvent.press(checkInButton);
    
    await waitFor(() => {
      expect(getByText('Check out')).toBeTruthy();
    });
    
    fireEvent.press(getByText('Check out'));
    
    await waitFor(() => {
      expect(getByText('Check in')).toBeTruthy();
    });
  });

  it('navigates to different screens when NavBar buttons are pressed', () => {
    const { getByText } = render(<NavBar />);
    
    fireEvent.press(getByText('Home'));
    expect(router.push).toHaveBeenCalledWith('/home');
    
    fireEvent.press(getByText('My bookings'));
    expect(router.push).toHaveBeenCalledWith('/viewbookings');
    
    fireEvent.press(getByText('Book'));
    expect(router.push).toHaveBeenCalledWith('/bookings');
    
    fireEvent.press(getByText('Notifications'));
    expect(router.push).toHaveBeenCalledWith('/bookings');
    
    fireEvent.press(getByText('Profile'));
    expect(router.push).toHaveBeenCalledWith('/settings');
  });
});