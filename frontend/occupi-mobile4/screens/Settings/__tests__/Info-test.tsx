import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Info from '../Info';
import { ThemeProvider } from '@/components/ThemeContext';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('light'),
  setItemAsync: jest.fn(),
}));

jest.mock('@/components/SpinningLogo', () => 'SpinningLogo');

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock('expo-device', () => ({
  deviceName: 'Test Device',
  osName: 'TestOS',
  osVersion: '1.0',
}));

let mockTheme = 'light';
jest.mock('@/components/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ 
    theme: mockTheme, 
    setTheme: jest.fn((newTheme) => { mockTheme = newTheme; })
  }),
}));

describe('Info Component', () => {
  it('renders key elements', async () => {
    const { queryByText } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(queryByText('About and Info')).toBeTruthy();
      expect(queryByText('Occupi.')).toBeTruthy();
      expect(queryByText('Predict. Plan. Perfect.')).toBeTruthy();
      expect(queryByText('version: 1.0.2')).toBeTruthy();
    });
  });

  it('displays correct device information', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Test Device')).toBeTruthy();
      expect(getByText('TestOS 1.0')).toBeTruthy();
    });
  });

  it('has clickable links', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('privacy policy')).toBeTruthy();
      expect(getByText('terms of service')).toBeTruthy();
      expect(getByText('user manual')).toBeTruthy();
    });
  });

  it('navigates back when back button is pressed', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('back-button'));
      expect(require('expo-router').router.back).toHaveBeenCalled();
    });
  });

  it('opens privacy policy in browser when pressed', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    await waitFor(() => {
      fireEvent.press(getByText('privacy policy'));
      expect(require('expo-web-browser').openBrowserAsync).toHaveBeenCalledWith(
        'https://www.freeprivacypolicy.com/live/8f124563-97fc-43fa-bf37-7a82ba153ea3'
      );
    });
  });

  it('changes background color based on theme (dark mode)', async () => {
    mockTheme = 'dark';
    const { getByTestId } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );
  
    await waitFor(() => {
      const container = getByTestId('info-container');
      expect(container.props.backgroundColor).toBe('black');
    });
  });
  
  it('changes background color based on theme (light mode)', async () => {
    mockTheme = 'light';
    const { getByTestId } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );
  
    await waitFor(() => {
      const container = getByTestId('info-container');
      expect(container.props.backgroundColor).toBe('white');
    });
  });

  it('uses system theme when set to "system"', async () => {
    mockTheme = 'system';
    jest.spyOn(require('react-native'), 'useColorScheme').mockReturnValue('dark');
    
    const { getByTestId } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );
  
    await waitFor(() => {
      const container = getByTestId('info-container');
      expect(container.props.backgroundColor).toBe('black');
    });
  });

  it('updates result state after privacy policy is pressed', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Info />
      </ThemeProvider>
    );

    fireEvent.press(getByText('privacy policy'));

    await waitFor(() => {
      const result = require('expo-web-browser').openBrowserAsync.mock.results[0].value;
      expect(result).not.toBeNull();
    });
  });
});
