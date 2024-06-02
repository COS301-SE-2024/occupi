import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../../screens/Login/Profile'; // Adjust the import path accordingly
import { router } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('react-native-modal-datetime-picker', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ onConfirm, onCancel }) => null),
  };
});

describe('Profile Component', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);

    expect(getByText('My account')).toBeTruthy();
    expect(getByPlaceholderText('Sabrina Carpenter')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
  });

  it('navigates to settings screen on back arrow press', () => {
    const { getByTestId } = render(<Profile />);

    const backArrow = getByTestId('back-arrow');
    fireEvent.press(backArrow);

    expect(router.push).toHaveBeenCalledWith('/settings');
  });

  it('shows date picker on date of birth press', () => {
    const { getByText } = render(<Profile />);

    const dateOfBirth = getByText(new Date(2000, 6, 7).toLocaleDateString());
    fireEvent.press(dateOfBirth);

    expect(DateTimePickerModal).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: true,
      }),
      {}
    );
  });

  it('saves profile with updated details', async () => {
    const alertMock = jest.spyOn(global, 'alert').mockImplementation(() => {});

    const { getByText, getByPlaceholderText } = render(<Profile />);

    fireEvent.changeText(getByPlaceholderText('Sabrina Carpenter'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('u21546551@tuks.co.za'), 'john.doe@example.com');
    fireEvent.changeText(getByPlaceholderText('21546551'), '12345678');
    fireEvent.changeText(getByPlaceholderText('011 101 1111'), '987 654 3210');
    fireEvent.changeText(getByPlaceholderText('she/her'), 'he/him');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        'Profile Saved',
        expect.stringContaining('Name: John Doe')
      );
    });

    alertMock.mockRestore();
  });

  it('updates gender selection correctly', () => {
    const { getByText } = render(<Profile />);

    fireEvent.press(getByText('Male'));
    expect(getByText('Male')).toBeTruthy();

    fireEvent.press(getByText('Female'));
    expect(getByText('Female')).toBeTruthy();

    fireEvent.press(getByText('Other'));
    expect(getByText('Other')).toBeTruthy();
  });
});
