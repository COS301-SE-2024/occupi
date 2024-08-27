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


});


