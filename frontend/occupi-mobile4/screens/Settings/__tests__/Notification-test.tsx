// Notifications-test.tsx

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Notifications from '../Notifications';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { updateNotifications } from '@/utils/user';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-secure-store');
jest.mock('@/utils/auth', () => ({
  UserLogout: jest.fn().mockResolvedValue(),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    setCurrentTab: jest.fn(),
  },
}));
jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: jest.fn(() => ({
    show: jest.fn(),
  })),
}));

jest.mock('@/components/ThemeContext', () => ({
  ...jest.requireActual('@/components/ThemeContext'),
  useToast: jest.fn().mockReturnValue({
    show: jest.fn(),
    hide: jest.fn(),
  }),
  useTheme: jest.fn().mockReturnValue({ theme: 'light', setTheme: jest.fn() }),
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

  it('updates switch states when toggled', async () => {
    const { getAllByRole } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const switches = getAllByRole('switch');
      expect(switches.length).toBe(2);
    });

    const switches = getAllByRole('switch');
    
    await act(async () => {
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
      expect(switches.length).toBe(2);
    });

    const switches = getAllByRole('switch');

    await act(async () => {
      fireEvent(switches[0], 'onValueChange', false);
      fireEvent(switches[1], 'onValueChange', true);
    });

    await act(async () => {
      fireEvent.press(getByText('Save'));
    });

    await waitFor(() => {
      expect(updateNotifications).toHaveBeenCalledWith({
        invites: 'off',
        bookingReminder: 'on',
      });
    });
  });

  it('shows alert when trying to leave with unsaved changes', async () => {
    const { getAllByRole, getByTestId } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      const switches = getAllByRole('switch');
      expect(switches.length).toBe(2);
    });

    const switches = getAllByRole('switch');

    await act(async () => {
      fireEvent(switches[0], 'onValueChange', false);
    });

    jest.spyOn(Alert, 'alert');

    await act(async () => {
      fireEvent.press(getByTestId('back-button'));
    });

    expect(Alert.alert).toHaveBeenCalled();
  });

  it('navigates back without alert when there are no changes', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Notifications />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('back-button')).toBeTruthy();
    });

    const backButton = getByTestId('back-button');

    await act(async () => {
      fireEvent.press(backButton);
    });

    expect(router.back).toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});