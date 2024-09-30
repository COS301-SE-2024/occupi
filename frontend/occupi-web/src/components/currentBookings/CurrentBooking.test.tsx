// src/CurrentBookingsBento.test.tsx
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import CurrentBookingsBento from './CurrentBookingsBento';

// Mock the fetch function globally
describe('CurrentBookingsBento', () => {
  beforeEach(() => {
    // Ensure fetch is mocked before each test
    jest.spyOn(global, 'fetch').mockClear();
  });

  afterEach(() => {
    // Cleanup after each test to reset the DOM
    cleanup();
  });

  // Helper function to create a mock response for fetch
  const mockFetchResponse = (data: any) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    } as Response);
  };

  const mockFetchError = () => {
    return Promise.reject(new Error('Failed to fetch data'));
  };

  test('displays fetched bookings data correctly', async () => {
    // Mock the API response with some booking data
    const mockResponse = {
      data: [
        {
          checkedIn: true,
          creators: 'John Doe',
          date: '2024-08-10',
          emails: ['john@example.com', 'jane@example.com'],
          end: '2024-08-10T11:00:00',
          floorNo: '3',
          occupiID: '123',
          roomId: 'R001',
          roomName: 'Conference Room',
          start: '2024-08-10T09:00:00',
        },
      ],
      message: 'Success',
      meta: { currentPage: 1, totalPages: 1, totalResults: 1 },
      status: 200,
    };
  
    jest.spyOn(global, 'fetch').mockReturnValueOnce(mockFetchResponse(mockResponse));
  
    render(<CurrentBookingsBento />);
  
    // Wait for the data to be fetched
    await waitFor(() => {
      // Check if "Conference Room" text is rendered
      expect(screen.getByText(/Conference Room/i)).toBeDefined();
      
      // Check if "John Doe" is rendered
      const johnDoeElement = screen.queryByText((content, element) => {
        return element?.textContent === 'John Doe';
      });
      expect(johnDoeElement).toBeDefined(); // Ensure the element exists
    });
  });
  test('displays error message when fetching data fails', async () => {
    // Mock the fetch to simulate a failure
    jest.spyOn(global, 'fetch').mockReturnValueOnce(mockFetchError());

    render(<CurrentBookingsBento />);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/i)).toBeDefined();
    });
  });
});
