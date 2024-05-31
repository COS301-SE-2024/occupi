//import React from 'react';
import { render, fireEvent,/*screen*/ } from '@testing-library/react';
import OtpComponent from './OtpComponent';
import '@testing-library/jest-dom';

describe('OtpComponent', () => {
  it('renders 6 OTP input fields', () => {
    const { getAllByRole } = render(<OtpComponent />);
    const otpInputs = getAllByRole('textbox');
    expect(otpInputs).toHaveLength(6);
  });

  it('handles user input correctly', () => {
    const { getAllByRole } = render(<OtpComponent />);
    const otpInputs = getAllByRole('textbox');

    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${index + 1}` } });
      expect(input).toHaveValue(`${index + 1}`);
    });
  });

  it('focuses the next input after entering a value', () => {
    const { getAllByRole } = render(<OtpComponent />);
    const otpInputs = getAllByRole('textbox');

    fireEvent.change(otpInputs[0], { target: { value: '1' } });
    expect(otpInputs[1]).toHaveFocus();
  });
});