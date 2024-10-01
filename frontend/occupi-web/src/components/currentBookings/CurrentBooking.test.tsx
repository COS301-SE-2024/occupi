// src/CurrentBookingsBento.test.tsx
import { render, screen, waitFor, cleanup } from '@testing-library/react';
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

  interface CustomResponse extends Response {
    customProperty?: string; // You can add custom properties or methods if needed
  }

  // Define the structure of a single booking
interface Booking {
    checkedIn: boolean;
    creators: string;
    date: string;
    emails: string[];
    end: string;
    floorNo: string;
    occupiID: string;
    roomId: string;
    roomName: string;
    start: string;
  }
  
  // Define the full API response structure
  interface ResponseData {
    data: Booking[]; // Array of bookings
    message: string;
    meta: {
      currentPage: number;
      totalPages: number;
      totalResults: number;
    };
    status: number;
  }
  
  // Mock successful fetch response
  const mockFetchResponse = (data: ResponseData): Promise<CustomResponse> => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
      customProperty: "example", // Add any custom property as needed
    } as CustomResponse);
  };

  // Mock fetch error response
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

    // Mock the fetch call to return the mock response
    jest.spyOn(global, 'fetch').mockReturnValueOnce(mockFetchResponse(mockResponse));

    // Render the component
    render(<CurrentBookingsBento />);

    // Wait for the data to be fetched and rendered
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

    // Render the component
    render(<CurrentBookingsBento />);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/i)).toBeDefined();
    });
  });
});
