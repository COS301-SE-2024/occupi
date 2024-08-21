import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import FAQPage from '../FAQPage';
import { ThemeProvider } from '@/components/ThemeContext';

describe('FAQPage', () => {
  test('renders the FAQ sections correctly', () => {
    render(
      <ThemeProvider>
        <FAQPage />
      </ThemeProvider>
    );

    expect(screen.getByText('Frequently Asked Questions')).toBeTruthy();
    expect(screen.getByText('Profile Page FAQs')).toBeTruthy();
    expect(screen.getByText('Book a Room FAQs')).toBeTruthy();
    expect(screen.getByText('My Bookings FAQs')).toBeTruthy();
    expect(screen.getByText('Login/Signup FAQs')).toBeTruthy();
    expect(screen.getByText('Dashboard FAQs')).toBeTruthy();
  });

  test('toggles the accordion items correctly', () => {
    render(
      <ThemeProvider>
        <FAQPage />
      </ThemeProvider>
    );

    // Expand the first accordion item
    fireEvent.press(screen.getByTestId('faq-question-0-0'));
    expect(screen.getByTestId('faq-answer-0-0')).toBeTruthy();

    // Collapse the first accordion item
    fireEvent.press(screen.getByTestId('faq-question-0-0'));
    expect(screen.queryByTestId('faq-answer-0-0')).toBeNull();

    // Expand the second accordion item
    fireEvent.press(screen.getByTestId('faq-question-0-1'));
    expect(screen.getByTestId('faq-answer-0-1')).toBeTruthy();
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
        <FAQPage />
      </ThemeProvider>
    );

    fireEvent.press(screen.getByTestId('back-button'));
    expect(mockedRouter.back).toHaveBeenCalled();
  });

  test('changes the color scheme based on the theme', () => {
    render(
      <ThemeProvider theme="dark">
        <FAQPage />
      </ThemeProvider>
    );

    expect(screen.getByText('Frequently Asked Questions')).toHaveStyle({ color: 'white' });
    expect(screen.getByTestId('faq-question-0-0')).toHaveStyle({ color: 'white' });
    expect(screen.getByTestId('faq-answer-0-0')).toHaveStyle({ color: 'white' });
  });
});