import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Appearance from '../Appearance';
import { ThemeProvider } from '@/components/ThemeContext';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import GradientButton from '@/components/GradientButton';
import ColorPicker from 'reanimated-color-picker';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('Appearance', () => {
  it('should render correctly', () => {
    const { toJSON } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should handle back button press', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    expect(router.back).toHaveBeenCalled();
  });

  it('should handle theme changes', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );
    const lightThemeButton = getByTestId('color-option-light');
    const darkThemeButton = getByTestId('color-option-dark');
    const systemThemeButton = getByTestId('color-option-system');

    fireEvent.press(lightThemeButton);
    fireEvent.press(darkThemeButton);
    fireEvent.press(systemThemeButton);

    expect(getByTestId(ThemeProvider).props.setTheme).toHaveBeenCalledTimes(3);
  });

  it('should handle accent color changes', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );
    const colorOptions = getByTestId('color-option-*');
    colorOptions.forEach((colorOption) => {
      fireEvent.press(colorOption);
      expect(getByTestId(Appearance).state('accentColour')).not.toBeNull();
    });
  });

  it('should handle custom color changes', () => {
    const { getByType } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );
    const colorPicker = getByType(ColorPicker);
    colorPicker.props.onComplete({ hex: '#FF0000' });
    expect(getByTestId(Appearance).state('accentColour')).toBe('#FF0000');
  });

  it('should save settings', async () => {
    const { getByType } = render(
      <ThemeProvider>
        <Appearance />
      </ThemeProvider>
    );
    const saveButton = getByType(GradientButton);
    fireEvent.press(saveButton);
    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(router.replace).toHaveBeenCalledWith('/settings');
    });
  });
});