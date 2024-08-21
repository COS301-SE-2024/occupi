import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Appearance from '../Appearance';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@/services/securestore', () => ({
  storeTheme: jest.fn(),
  storeAccentColour: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

describe('Appearance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the Appearance component correctly', () => {
    const { getByTestId, getByText, getByA11yLabel } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    expect(getByTestId('back-button')).toBeTruthy();
    expect(getByText('Appearance')).toBeTruthy();
    expect(getByA11yLabel('circle')).toBeTruthy();
  });

  it('should handle theme change correctly', () => {
    const { getByText, getByA11yLabel } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    fireEvent.press(getByA11yLabel('circle'));
    expect(getByText('Light')).toBeTruthy();

    fireEvent.press(getByA11yLabel('circle'));
    expect(getByText('Dark')).toBeTruthy();

    fireEvent.press(getByA11yLabel('circle'));
    expect(getByText('System')).toBeTruthy();
  });

  it('should handle accent color change correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('color-option-lightgrey'));
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accentColour');

    fireEvent.press(getByTestId('color-option-#FF4343'));
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accentColour');
  });

  it('should handle back button press correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('back-button'));
    expect(router.back).toHaveBeenCalled();
  });

  it('should handle save correctly', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Save'));
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/settings');
    });
  });
});