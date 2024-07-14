/// <reference lib="dom" />
import { test, expect, mock, afterEach } from 'bun:test';
import { render, fireEvent, cleanup } from '@testing-library/react';
import OtpComponent from './OtpComponent'; // Adjust the import based on your file structure


afterEach(() => {
  cleanup();
});

// test('OtpComponent should accept only numbers', () => {
//   const setOtpMock = mock(() => {});
//   const { getAllByRole } = render(<OtpComponent setOtp={setOtpMock} />);
//   const inputs = getAllByRole('textbox');
//   inputs.forEach((input) => {
//     fireEvent.change(input, { target: { value: 'a' } });
//   });
//   inputs.forEach(input => {
//     expect((input as HTMLInputElement).value).toEqual('');
//   });
// });

test('handleChange should update the OTP value and call setOtp with validity false when a valid number is entered', () => {
  const setOtpMock = mock(() => {});
  const { getAllByRole } = render(<OtpComponent setOtp={setOtpMock} />);
  const inputs = getAllByRole('textbox');
  const inputIndex = 0;
  const inputValue = '1';

  fireEvent.change(inputs[inputIndex], { target: { value: inputValue } });

  // Check the mock function's calls to verify it was called with the expected arguments
  expect(setOtpMock.mock.calls).toContainEqual([expect.arrayContaining([inputValue]), false]);
});

test('handleChange should update the OTP value and call setOtp with validity true when the last digit is entered', () => {
  const setOtpMock = mock(() => {});
  const { getAllByRole } = render(<OtpComponent setOtp={setOtpMock} />);
  const inputs = getAllByRole('textbox');
  const inputIndex = 5;
  const inputValue = '6';

  fireEvent.change(inputs[inputIndex], { target: { value: inputValue } });

  expect(setOtpMock).toHaveBeenCalledWith(expect.arrayContaining([inputValue]), true);
});

test('handleChange should update the OTP value and call setOtp with validity false when an invalid character is entered', () => {
  const setOtpMock = mock(() => {});
  const { getAllByRole } = render(<OtpComponent setOtp={setOtpMock} />);
  const inputs = getAllByRole('textbox');
  const inputIndex = 0;
  const inputValue = 'a';

  fireEvent.change(inputs[inputIndex], { target: { value: inputValue } });

  // Check the mock function's calls to verify it was called with the expected arguments
  expect(setOtpMock.mock.calls).toContainEqual([expect.arrayContaining(['']), false]);
});