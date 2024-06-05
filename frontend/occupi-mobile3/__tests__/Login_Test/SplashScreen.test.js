import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SplashScreen from '../../screens/Login/SplashScreen'; // Adjust the import path accordingly
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('SplashScreen Component', () => {
  it('renders correctly', () => {
    const { getByAltText } = render(<SplashScreen />);

    expect(getByAltText('logo')).toBeTruthy();
  });

  it('navigates to settings screen after 5 seconds', async () => {
    render(<SplashScreen />);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/settings');
    }, { timeout: 2500 });
  });
});
