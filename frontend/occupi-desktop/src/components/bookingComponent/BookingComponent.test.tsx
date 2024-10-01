// import { expect, test, beforeEach, afterEach } from 'bun:test';
// import { screen, fireEvent, cleanup, render } from '@testing-library/react';
// import { BookingComponent } from '@components/index';

// beforeEach(() => {
//   render(<BookingComponent/>);
// });

// afterEach(() => {
//   cleanup();
// });

// test('App component renders and can interact with UI elements', async () => {
//   let addNewButton;
//   try {
//     addNewButton = await screen.findByText('Add New');
//     expect(addNewButton).not.toBeNull();
//     fireEvent.click(addNewButton);
//     // Additional assertions after click can be placed here
//   } catch (error) {
//     console.error('Element with text "Add New" was not found:', error);
//     screen.debug(); // Outputs the current DOM for inspection
//   }
// });

// test('Table Renders Correctly', async () => {
//   let table;
//   try {
//     table = await screen.findByTestId('table');
//     expect(table).not.toBeNull();
//   } catch (error) {
//     console.error('Table was not found:', error);
//     screen.debug();
//   }
// });

// test('Search Renders Correctly', async () => {
//     let search;
//     try {
//       search = await screen.findByTestId('input-search');
//       expect(search).not.toBeNull();
//     } catch (error) {
//       console.error('Search was not found:', error);
//       screen.debug();
//     }
//   });

