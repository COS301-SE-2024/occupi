import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/components/ThemeContext';
import Appearance from '../Appearance';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { act } from 'react-test-renderer';

// Mock the dependencies
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('@/services/securestore', () => ({
  storeTheme: jest.fn(),
  storeAccentColour: jest.fn(),
}));

// Mock the useTheme hook
jest.mock('@/components/ThemeContext', () => ({
  ...jest.requireActual('@/components/ThemeContext'),
  useTheme: jest.fn(),
}));

describe('Appearance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('light');
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      accentColor: '#FF4343',
      setAccentColor: jest.fn(),
    });
  });

  it('renders correctly', async () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Appearance')).toBeTruthy();
      expect(getByText('Mode')).toBeTruthy();
      expect(getByText('Accent colour')).toBeTruthy();
      expect(getByText('Custom colour')).toBeTruthy();
      expect(getByTestId('back-button')).toBeTruthy();
    });
  }, 10000); // Increase timeout to 10 seconds

  it('changes theme when pressing theme buttons', async () => {
    const setThemeMock = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
      accentColor: '#FF4343',
      setAccentColor: jest.fn(),
    });

    const { getByText } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    await waitFor(() => {
      fireEvent.press(getByText('Light'));
      fireEvent.press(getByText('Dark'));
      fireEvent.press(getByText('System'));
    });

    expect(setThemeMock).toHaveBeenCalledWith('light');
    expect(setThemeMock).toHaveBeenCalledWith('dark');
    expect(setThemeMock).toHaveBeenCalledWith('system');
  });

  it('changes accent color when pressing color options', async () => {
    const setAccentColorMock = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      accentColor: '#FF4343',
      setAccentColor: setAccentColorMock,
    });

    const { getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    const colorOptions = ['lightgrey', '#FF4343', '#FFB443', 'greenyellow', '#43FF61', '#43F4FF', '#4383FF', '#AC43FF', '#FF43F7', 'purple'];
    
    await waitFor(() => {
      for (let color of colorOptions) {
        fireEvent.press(getByTestId(`color-option-${color}`));
        expect(setAccentColorMock).toHaveBeenCalledWith(color);
      }
    });
  });

  it('saves settings when pressing Save button', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    await waitFor(() => {
      fireEvent.press(getByText('Save'));
    });

    expect(router.replace).toHaveBeenCalledWith('/settings');
  });

  it('goes back when pressing back button', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('back-button'));
    });

    expect(router.back).toHaveBeenCalled();
  });

  it('loads accent color from SecureStore on mount', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('#FF4343');

    const { findByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    await findByTestId('color-option-#FF4343');

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accentColour');
  });
});