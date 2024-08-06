import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Notifications from '../Notifications';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { updateNotifications } from '@/utils/user';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-secure-store');
jest.mock('@/utils/user');
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
}));
jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: jest.fn(() => ({
    show: jest.fn(),
  })),
}));

describe('Notifications Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
      if (key === 'Notifications') {
        return Promise.resolve(JSON.stringify({ invites: 'on', bookingReminder: 'off' }));
      }
      if (key === 'accentColour') {
        return Promise.resolve('greenyellow');
      }
    });
  });

  it('renders correctly', async () => {
    const { getByText, getAllByRole } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Notifications')).toBeTruthy();
      expect(getByText('Notify when someone invites me')).toBeTruthy();
      expect(getByText('Notify 15 minutes before booking time')).toBeTruthy();
      expect(getAllByRole('switch').length).toBe(2);
    });
  });

  it('loads and displays correct initial switch states', async () => {
    const { getAllByRole } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const switches = getAllByRole('switch');
      expect(switches[0].props.value).toBe(true);  // invites 'on'
      expect(switches[1].props.value).toBe(false); // bookingReminder 'off'
    });
  });

  it('updates switch states when toggled', async () => {
    const { getAllByRole } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const switches = getAllByRole('switch');
      fireEvent(switches[0], 'onValueChange', false);
      fireEvent(switches[1], 'onValueChange', true);
    });

    await waitFor(() => {
      const updatedSwitches = getAllByRole('switch');
      expect(updatedSwitches[0].props.value).toBe(false);
      expect(updatedSwitches[1].props.value).toBe(true);
    });
  });

  it('calls updateNotifications when Save button is pressed', async () => {
    const { getByText, getAllByRole } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const switches = getAllByRole('switch');
      fireEvent(switches[0], 'onValueChange', false);
      fireEvent(switches[1], 'onValueChange', true);
    });

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(updateNotifications).toHaveBeenCalledWith({
        invites: 'off',
        bookingReminder: 'on',
      });
    });
  });

  it('shows alert when trying to leave with unsaved changes', async () => {
    const { getAllByRole, getByText } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const switches = getAllByRole('switch');
      fireEvent(switches[0], 'onValueChange', false);
    });

    const backButton = getByText('chevron-left');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  it('navigates back without alert when there are no changes', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const backButton = getByText('chevron-left');
      fireEvent.press(backButton);
    });

    expect(router.back).toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});