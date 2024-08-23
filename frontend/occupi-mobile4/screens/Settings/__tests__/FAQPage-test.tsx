import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FAQPage from '../FAQPage'; // Adjust the import path as necessary

// Mock the necessary modules and hooks
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
  StyleSheet: {
    create: jest.fn(),
  },
  ScrollView: 'ScrollView',
  View: 'View',
  Text: 'Text',
}));

jest.mock('@/components/ThemeContext', () => ({
  useTheme: jest.fn(() => ({ theme: 'light' })),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock('@gluestack-ui/themed', () => ({
  Icon: 'Icon',
  Accordion: 'Accordion',
  AccordionItem: 'AccordionItem',
  AccordionHeader: 'AccordionHeader',
  AccordionTrigger: 'AccordionTrigger',
  AccordionContent: 'AccordionContent',
  ChevronLeftIcon: 'ChevronLeftIcon',
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
  MaterialIcons: 'MaterialIcons',
}));

describe('FAQPage', () => {
  it('renders correctly', () => {
    const { getByText, getAllByText } = render(<FAQPage />);
    expect(getByText('Frequently Asked Questions')).toBeTruthy();
    expect(getAllByText('Profile Page FAQs')[0]).toBeTruthy();
    expect(getAllByText('Book a Room FAQs')[0]).toBeTruthy();
    expect(getAllByText('My Bookings FAQs')[0]).toBeTruthy();
    expect(getAllByText('Login/Signup FAQs')[0]).toBeTruthy();
    expect(getAllByText('Dashboard FAQs')[0]).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = render(<FAQPage />);
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    expect(require('expo-router').router.back).toHaveBeenCalled();
  });

  it('expands and collapses accordion items', () => {
    const { getByTestId, queryByText } = render(<FAQPage />);
    
    const profileQuestion = getByTestId('faq-question-0-0');
    fireEvent.press(profileQuestion);
    expect(queryByText(/To edit your profile, go to the Profile page and tap the 'Edit' button/)).toBeTruthy();
    
    fireEvent.press(profileQuestion);
    expect(queryByText(/To edit your profile, go to the Profile page and tap the 'Edit' button/)).toBeNull();
  });

  it('renders correct number of questions for each section', () => {
    const { getAllByTestId } = render(<FAQPage />);
    expect(getAllByTestId(/^faq-question-\d+-\d+$/).length).toBe(25); // 5 sections with 5 questions each
  });
});