import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Bookings from '../Bookings.tsx'; // Adjust the import to the correct path
import { useToast } from '@gluestack-ui/themed';
import { Alert } from 'react-native';

// Mock useToast hook
jest.mock('@gluestack-ui/themed', () => {
  const actual = jest.requireActual('@gluestack-ui/themed');
  return {
    ...actual,
    useToast: jest.fn(),
  };
});

describe('Bookings Component', () => {
  it('should render the component correctly', () => {
    const { getByText } = render(<Bookings />);
    
    // Check if the main heading is rendered
    expect(getByText('Offices')).toBeTruthy();
  });

  it('should show a toast message when a room is booked', async () => {
    const show = jest.fn();
    useToast.mockReturnValue({ show });

    const { getByText } = render(<Bookings />);
    
    fireEvent.press(getByText('Book now'));
    
    await waitFor(() => {
      expect(show).toHaveBeenCalledWith(expect.objectContaining({
        placement: 'top',
        render: expect.any(Function),
      }));
    });
  });

  it('should open an alert when booking a room', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText } = render(<Bookings />);
    
    fireEvent.press(getByText('Book now'));
    
    expect(alertSpy).toHaveBeenCalledWith(
      "Book",
      expect.stringContaining("HDMI Room on floor 7?"),
      expect.any(Array)
    );
  });

  it('should render the correct text colors based on dark mode', () => {
    const { getByText } = render(<Bookings />);
    
    // Assuming the default mode is light
    expect(getByText('Offices').props.style.color).toBe('black');
    
    // Simulate dark mode
    const { getByText: getByTextDark } = render(<Bookings />);
    expect(getByTextDark('Offices').props.style.color).toBe('white');
  });
});
