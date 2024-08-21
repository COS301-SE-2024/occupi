import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Info from '../Info';
import { ThemeProvider } from '@/components/ThemeContext';
import * as WebBrowser from 'expo-web-browser';

jest.mock('expo-web-browser');

describe('Info', () => {
  test('renders the component correctly', () => {
    render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    expect(screen.getByText('Occupi.')).toBeTruthy();
    expect(screen.getByText('Predict. Plan. Perfect.')).toBeTruthy();
    expect(screen.getByText('version: 1.0.2')).toBeTruthy();
    expect(screen.getByText('privacy policy')).toBeTruthy();
    expect(screen.getByText('terms of service')).toBeTruthy();
    expect(screen.getByText('user manual')).toBeTruthy();
  });

  test('navigates back to the previous screen', () => {
    const mockedRouter = {
      back: jest.fn(),
    };

    jest.mock('expo-router', () => ({
      router: mockedRouter,
    }));

    render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    fireEvent.press(screen.getByTestId('back-button'));
    expect(mockedRouter.back).toHaveBeenCalled();
  });

  test('opens the privacy policy in a web browser', async () => {
    render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    fireEvent.press(screen.getByText('privacy policy'));
    await waitFor(() => expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://www.freeprivacypolicy.com/live/8f124563-97fc-43fa-bf37-7a82ba153ea3'));
  });
});