import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FAQPage from '../FAQPage';
import { ThemeProvider } from '@/components/ThemeContext';


// Mock the router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock the ThemeContext
jest.mock('@/components/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

// Mock the gluestack-ui components
jest.mock('@gluestack-ui/themed', () => ({
  View: ({ children, ...props }) => <div {...props}>{children}</div>,
  ScrollView: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <div {...props}>{children}</div>,
  Accordion: ({ children, ...props }) => <div {...props}>{children}</div>,
  AccordionItem: ({ children, ...props }) => <div {...props}>{children}</div>,
  AccordionHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  AccordionTrigger: ({ children, ...props }) => <button {...props}>{children}</button>,
  AccordionContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  Icon: ({ name, ...props }) => <div data-testid={`icon-${name}`} {...props} />,
  ChevronLeftIcon: (props) => <div data-testid="icon-chevron-left" {...props} />,
}));

// Mock the expo-vector-icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
  MaterialIcons: 'MaterialIcons',
}));

describe('FAQPage', () => {
 
  it('calls router.back when back button is pressed', () => {
    const { getByTestId } = render(<FAQPage />);
    // Use a more generic testID
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    expect(require('expo-router').router.back).toHaveBeenCalled();
  });
  // it('expands and collapses accordion items', () => {
  //   const { getByTestId, queryByText } = renderFAQPage();
    
  //   const profileQuestion = getByTestId('faq-question-0-0');
  //   fireEvent.press(profileQuestion);
  //   expect(queryByText(/To edit your profile, go to the Profile page and tap the 'Edit' button/)).toBeTruthy();
    
  //   fireEvent.press(profileQuestion);
  //   expect(queryByText(/To edit your profile, go to the Profile page and tap the 'Edit' button/)).toBeNull();
  // });

  // it('renders correct number of questions for each section', () => {
  //   const { getAllByTestId } = renderFAQPage();
  //   expect(getAllByTestId(/^faq-question-\d+-\d+$/).length).toBe(25); // 5 sections with 5 questions each
  // });

  // it('switches between light and dark themes', () => {
  //   const { getByTestId } = renderFAQPage();
  //   const themeToggle = getByTestId('theme-toggle');
    
  //   expect(mockTheme).toBe('light');
  //   fireEvent.press(themeToggle);
  //   expect(mockTheme).toBe('dark');
  //   fireEvent.press(themeToggle);
  //   expect(mockTheme).toBe('light');
  // });

  // it('renders all FAQ sections', () => {
  //   const { getByText } = renderFAQPage();
  //   const sections = [
  //     'Profile Page FAQs',
  //     'Book a Room FAQs',
  //     'My Bookings FAQs',
  //     'Login/Signup FAQs',
  //     'Dashboard FAQs'
  //   ];
  //   sections.forEach(section => {
  //     expect(getByText(section)).toBeTruthy();
  //   });
  // });

  // it('expands all sections when "Expand All" is pressed', () => {
  //   const { getByText, getAllByTestId } = renderFAQPage();
  //   const expandAllButton = getByText('Expand All');
  //   fireEvent.press(expandAllButton);
  //   const expandedQuestions = getAllByTestId(/^faq-question-\d+-\d+$/);
  //   expandedQuestions.forEach(question => {
  //     expect(question).toHaveProp('aria-expanded', true);
  //   });
  // });

  // it('collapses all sections when "Collapse All" is pressed', () => {
  //   const { getByText, getAllByTestId } = renderFAQPage();
  //   const collapseAllButton = getByText('Collapse All');
  //   fireEvent.press(collapseAllButton);
  //   const collapsedQuestions = getAllByTestId(/^faq-question-\d+-\d+$/);
  //   collapsedQuestions.forEach(question => {
  //     expect(question).toHaveProp('aria-expanded', false);
  //   });
  // });
});