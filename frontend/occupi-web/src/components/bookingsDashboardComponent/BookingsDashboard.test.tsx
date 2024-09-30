// // src/BookingsDashboard.test.tsx
// import React from 'react';
// import { render, screen, fireEvent, cleanup } from '@testing-library/react';
// import BookingsDashboard from './BookingsDashboard';
// import {
//   TopBookingsBento,
//   CurrentBookingsBento,
//   HistoricalBookingsBento,
// } from '@components/index';

// // Mock the components to simplify the test
// jest.mock('@components/index', () => ({
//   TopBookingsBento: jest.fn(() => <div>Top Bookings Component</div>),
//   CurrentBookingsBento: jest.fn(() => <div>Current Bookings Component</div>),
//   HistoricalBookingsBento: jest.fn(() => <div>Historical Bookings Component</div>),
// }));

// describe('BookingsDashboard', () => {
//   beforeEach(() => {
//     jest.clearAllMocks(); // Clear any previous mocks before each test
//   });

//   afterEach(() => {
//     cleanup(); // Clean up the DOM and reset between tests
//   });

//   test('renders with Top Bookings by default', () => {
//     render(<BookingsDashboard />);

//     // Check that the "Top Bookings" tab is selected and rendered by default
//     expect(screen.getByText('Top Bookings')).toBeDef;
//     expect(screen.getByText('Top Bookings Component')).toBeDef;
//   });

//   test('switches to Current Bookings tab when clicked', () => {
//     render(<BookingsDashboard />);

//     // Click on the "Current Bookings" tab
//     fireEvent.click(screen.getByText('Current Bookings'));

//     // Ensure that the Current Bookings tab is selected and its content is displayed
//     expect(screen.getByText('Current Bookings')).toBeDef;
//     expect(screen.getByText('Current Bookings Component')).toBeDef;
//   });

//   test('switches to Historical Bookings tab when clicked', () => {
//     render(<BookingsDashboard />);

//     // Click on the "Historical Bookings" tab
//     fireEvent.click(screen.getByText('Historical Bookings'));

//     // Ensure that the Historical Bookings tab is selected and its content is displayed
//     expect(screen.getByText('Historical Bookings')).toBeDef;
//     expect(screen.getByText('Historical Bookings Component')).toBeDef;
//   });
// });
