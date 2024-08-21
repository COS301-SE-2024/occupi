import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotifTest from '../NotifTester';

describe('NotifTest', () => {
  it('renders the component', () => {
    const { getByText } = render(<NotifTest />);
    expect(getByText('Notification Test')).toBeDefined();
  });

  it('triggers the notification button', async () => {
    const { getByText } = render(<NotifTest />);
    const notificationButton = getByText('Trigger Notification');

    fireEvent.press(notificationButton);

    await waitFor(() => {
      expect(getByText('Notification Received')).toBeDefined();
    });
  });

  it('triggers the notification and dismisses it', async () => {
    const { getByText, queryByText } = render(<NotifTest />);
    const notificationButton = getByText('Trigger Notification');

    fireEvent.press(notificationButton);

    await waitFor(() => {
      expect(getByText('Notification Received')).toBeDefined();
    });

    const dismissButton = getByText('Dismiss');
    fireEvent.press(dismissButton);

    await waitFor(() => {
      expect(queryByText('Notification Received')).toBeNull();
    });
  });

  it('handles error scenarios', async () => {
    const { getByText, queryByText } = render(<NotifTest />);
    const notificationButton = getByText('Trigger Notification');

    // Simulate an error
    const mockError = new Error('Notification failed to trigger');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(global, 'alert').mockImplementation(() => {});

    fireEvent.press(notificationButton);

    await waitFor(() => {
      expect(queryByText('Notification Received')).toBeNull();
      expect(console.error).toHaveBeenCalledWith(mockError);
      expect(global.alert).toHaveBeenCalledWith('Failed to trigger notification');
    });

    console.error.mockRestore();
    global.alert.mockRestore();
  });
});