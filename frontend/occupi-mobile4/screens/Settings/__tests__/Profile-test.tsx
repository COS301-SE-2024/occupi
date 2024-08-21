import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Profile from '../Profile';
import { ThemeProvider } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import * as user from '@/utils/user';

jest.mock('expo-secure-store');
jest.mock('@/utils/user');

describe('Profile', () => {
  test('renders the profile information correctly', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('{"name":"John Doe","email":"johndoe@example.com","employeeid":"OCCUPI20242417","number":"1234567890","pronouns":"they/them","gender":"Male","dob":"1990-01-01"}');
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('johndoe@example.com');

    render(
      <ThemeProvider>
        <Profile />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeTruthy();
      expect(screen.getByDisplayValue('johndoe@example.com')).toBeTruthy();
      expect(screen.getByDisplayValue('OCCUPI20242417')).toBeTruthy();
      expect(screen.getByDisplayValue('1234567890')).toBeTruthy();
      expect(screen.getByDisplayValue('they/them')).toBeTruthy();
      expect(screen.getByDisplayValue('1990-01-01')).toBeTruthy();
    });
  });

  test('updates the profile information', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('{"name":"John Doe","email":"johndoe@example.com","employeeid":"OCCUPI20242417","number":"1234567890","pronouns":"they/them","gender":"Male","dob":"1990-01-01"}');
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('johndoe@example.com');
    jest.spyOn(user, 'updateDetails').mockResolvedValueOnce('Details updated successfully');

    render(
      <ThemeProvider>
        <Profile />
      </ThemeProvider>
    );

    fireEvent.changeText(screen.getByDisplayValue('John Doe'), 'Jane Doe');
    fireEvent.changeText(screen.getByDisplayValue('1234567890'), '0987654321');
    fireEvent.changeText(screen.getByDisplayValue('they/them'), 'she/her');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => {
      expect(user.updateDetails).toHaveBeenCalledWith('Jane Doe', '1990-01-01', 'Male', '0987654321', 'she/her');
    });
  });
});