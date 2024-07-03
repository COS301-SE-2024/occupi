import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import FAQPage from '../FAQPage'; // Adjust the import path as necessary

describe('FAQPage', () => {
  it('renders FAQ sections correctly', () => {
    const { getByText } = render(<FAQPage />);

    // Check if the section headers are rendered correctly
    expect(getByText('Profile Page FAQs')).toBeTruthy();
    expect(getByText('Book a Room FAQs')).toBeTruthy();
    expect(getByText('My Bookings FAQs')).toBeTruthy();
    expect(getByText('Login/Signup FAQs')).toBeTruthy();
    expect(getByText('Dashboard FAQs')).toBeTruthy();
  });

//   it('toggles FAQ answers correctly', async () => {
//     const { getByText, queryByText } = render(<FAQPage />);

//     const questionText = "How do I edit my profile information?";
//     const answerText = "To edit your profile, go to the Profile page and tap the 'Edit' button. You can then modify your personal details, contact information, and preferences.";

//     // Initially, the answer should not be visible
//     expect(queryByText(answerText)).toBeNull();

//     // Click to reveal the answer
//     await act(async () => {
//       fireEvent.press(getByText(questionText));
//     });

//     // Now the answer should be visible
//     expect(getByText(answerText)).toBeTruthy();

//     // Click again to hide the answer
//     await act(async () => {
//       fireEvent.press(getByText(questionText));
//     });

//     // The answer should be hidden again
//     expect(queryByText(answerText)).toBeNull();
//   });
});
