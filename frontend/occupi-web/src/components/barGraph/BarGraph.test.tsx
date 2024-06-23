import { expect, test, beforeEach, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '../../App'; // Adjust the import path to where your App component is located

// beforeEach(() => {
//     // Render the App component before each test
//     render(<App />);
// });

afterEach(() => {
    // Clean up after each test
    cleanup();
});

test('renders the download button', () => {
    const downloadButton = screen.getByText('Accent colour');
    expect(downloadButton.textContent).toBe('Accent colour');
});

// test('renders the chart with correct data keys', () => {
//     const yAxisElements = screen.getAllByRole('graphics-symbol'); // This assumes your charting library uses this role; adjust as needed
//     expect(yAxisElements.length).toBeGreaterThan(0);
// });

// test('clicking the download button triggers download logic', () => {
//     const downloadButton = screen.getByText("Accent colour");

//     expect(document.createElement).toHaveBeenCalledWith('Accent colour');
// });