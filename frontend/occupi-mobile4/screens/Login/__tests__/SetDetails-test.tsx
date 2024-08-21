import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SetDetails from '../SetDetails';
import { updateDetails } from '@/utils/user';
import { extractDateFromTimestamp } from '@/utils/utils';

jest.mock('@/utils/user', () => ({
  updateDetails: jest.fn(),
}));

jest.mock('@/utils/utils', () => ({
  extractDateFromTimestamp: jest.fn(),
}));

describe('SetDetails component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    const { getByText } = render(<SetDetails />);
    expect(getByText('Set Account Details')).toBeTruthy();
    expect(getByText('Full name')).toBeTruthy();
    expect(getByText('Date of birth')).toBeTruthy();
    expect(getByText('Gender')).toBeTruthy();
    expect(getByText('Cell No')).toBeTruthy();
    expect(getByText('Pronouns (optional)')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('updates the name state correctly', () => {
    const { getByPlaceholderText } = render(<SetDetails />);
    const nameInput = getByPlaceholderText('Full name');
    fireEvent.changeText(nameInput, 'John Doe');
    expect(nameInput.props.value).toBe('John Doe');
  });

  it('updates the phone number state correctly', () => {
    const { getByPlaceholderText } = render(<SetDetails />);
    const phoneInput = getByPlaceholderText('Cell No');
    fireEvent.changeText(phoneInput, '1234567890');
    expect(phoneInput.props.value).toBe('1234567890');
  });

  it('updates the pronouns state correctly', () => {
    const { getByPlaceholderText } = render(<SetDetails />);
    const pronounsInput = getByPlaceholderText('Pronouns (optional)');
    fireEvent.changeText(pronounsInput, 'they/them');
    expect(pronounsInput.props.value).toBe('they/them');
  });

  it('updates the gender state correctly', () => {
    const { getByLabelText } = render(<SetDetails />);
    const maleRadio = getByLabelText('Male');
    const femaleRadio = getByLabelText('Female');
    const otherRadio = getByLabelText('Other');

    fireEvent.press(maleRadio);
    expect(maleRadio.props.value).toBe('Male');

    fireEvent.press(femaleRadio);
    expect(femaleRadio.props.value).toBe('Female');

    fireEvent.press(otherRadio);
    expect(otherRadio.props.value).toBe('Other');
  });

  it('shows and hides the date picker correctly', () => {
    const { getByText, getByTestId } = render(<SetDetails />);
    const dateInput = getByText('Date of birth');
    fireEvent.press(dateInput);
    expect(getByTestId('date-time-picker')).toBeTruthy();

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    expect(() => getByTestId('date-time-picker')).toThrow();
  });

  it('updates the date state correctly', async () => {
    const { getByText } = render(<SetDetails />);
    const dateInput = getByText('Date of birth');
    fireEvent.press(dateInput);

    const confirmButton = getByText('Confirm');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(extractDateFromTimestamp).toHaveBeenCalled();
    });
  });

  it('calls the updateDetails function correctly', async () => {
    const mockResponse = { success: true };
    (updateDetails as jest.Mock).mockResolvedValue(mockResponse);

    const { getByText } = render(<SetDetails />);
    const nameInput = getByText('Full name');
    fireEvent.changeText(nameInput, 'John Doe');

    const dateInput = getByText('Date of birth');
    fireEvent.press(dateInput);
    const confirmButton = getByText('Confirm');
    fireEvent.press(confirmButton);

    const genderInput = getByText('Gender');
    fireEvent.press(genderInput);
    const maleRadio = getByText('Male');
    fireEvent.press(maleRadio);

    const phoneInput = getByText('Cell No');
    fireEvent.changeText(phoneInput, '1234567890');

    const pronounsInput = getByText('Pronouns (optional)');
    fireEvent.changeText(pronounsInput, 'they/them');

    const saveButton = getByText('Confirm');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(updateDetails).toHaveBeenCalledWith(
        'John Doe',
        expect.any(String),
        'Male',
        '1234567890',
        'they/them'
      );
    });
  });
});