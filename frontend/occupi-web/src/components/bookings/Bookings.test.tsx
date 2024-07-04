// import { expect, test, beforeEach, afterEach } from 'bun:test';
// import { render, screen, fireEvent, cleanup } from '@testing-library/react';
// import App from '../../App';
// import { after } from 'node:test';

// // beforeEach(() => {
// //   render(<App />);
// // });

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