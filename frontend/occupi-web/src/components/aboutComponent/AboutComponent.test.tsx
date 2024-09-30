import { render, screen, cleanup } from '@testing-library/react';
import AboutComponent from './AboutComponent';

// Run cleanup after each test to ensure the DOM is cleaned up
afterEach(() => {
  cleanup();
});

// Test if the logo is rendered correctly
test('renders the logo', () => {
  render(<AboutComponent />);
  const logo = screen.getByTestId('Logo'); // Adjust if needed
  expect(logo).toBeDefined();
});

// Test if the heading "Occupi." is rendered correctly
test('renders the heading "Occupi."', () => {
  render(<AboutComponent />);
  const heading = screen.getByText(/Occupi\./i); // Case-insensitive match
  expect(heading).toBeDefined();
});

// Test if the tagline "Predict. Plan. Perfect" is rendered
test('renders the tagline "Predict. Plan. Perfect"', () => {
  render(<AboutComponent />);
  const tagline = screen.getByText(/Predict\. Plan\. Perfect/i); // Match tagline text
  expect(tagline).toBeDefined();
});

// Test if the version information is rendered
test('renders the version info "version: 0.9.0"', () => {
  render(<AboutComponent />);
  const versionText = screen.getByText(/version: 0.9.0/i);
  expect(versionText).toBeDefined();
});

// Test if platform info "Web" is rendered
test('renders the platform info "Web"', () => {
  render(<AboutComponent />);
  const platformText = screen.getByText(/Web/i);
  expect(platformText).toBeDefined();
});

// Test if browser info "Chrome 18.0.4" is rendered
test('renders the browser info "Chrome 18.0.4"', () => {
  render(<AboutComponent />);
  const browserText = screen.getByText(/Chrome 18.0.4/i);
  expect(browserText).toBeDefined();
});

// Test if the privacy policy link is rendered
test('renders the privacy policy link', () => {
  render(<AboutComponent />);
  const privacyPolicyLink = screen.getByText(/privacy policy/i);
  expect(privacyPolicyLink).toBeDefined();
});

// Test if the terms of service link is rendered
test('renders the terms of service link', () => {
  render(<AboutComponent />);
  const termsLink = screen.getByText(/terms of service/i);
  expect(termsLink).toBeDefined();
});

// Test if the user manual link is rendered
test('renders the user manual link', () => {
  render(<AboutComponent />);
  const userManualLink = screen.getByText(/user manual/i);
  expect(userManualLink).toBeDefined();
});
