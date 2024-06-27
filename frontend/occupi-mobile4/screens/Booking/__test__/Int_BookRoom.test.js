import React from 'react';
import { render, waitFor, fireEvent, act, screen } from '@testing-library/react-native';
import BookRoom from '../BookRoom'; // Adjust this path if necessary

// Mock the necessary dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: () => ({
    show: jest.fn(),
  }),
}));

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
);

describe('BookRoom Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches room data', async () => {
    await act(async () => {
      render(<BookRoom />);
    });
  
    await waitFor(() => {
      expect(screen.getByTestId('book-header')).toBeTruthy();
      expect(screen.getByText('Rooms')).toBeTruthy();
    });
  
    expect(global.fetch).toHaveBeenCalledWith('https://dev.occupi.tech/api/view-rooms');
  });

  it('toggles layout correctly', async () => {
    const { getByTestId } = render(<BookRoom />);

    const toggleButton = getByTestId('layout-toggle');
    fireEvent.press(toggleButton);

    await waitFor(() => {
      expect(getByTestId('grid-layout')).toBeTruthy();
    });

    fireEvent.press(toggleButton);

    await waitFor(() => {
      expect(getByTestId('row-layout')).toBeTruthy();
    });
  });

  it('shows toast on fetch error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Fetch error' } }),
      })
    );

    const { getByTestId } = render(<BookRoom />);

    // Wait for the component to finish rendering and fetching data
    await waitFor(() => {
      expect(getByTestId('book-header')).toBeTruthy();
    });

    expect(global.fetch).toHaveBeenCalledWith('https://dev.occupi.tech/api/view-rooms');
    expect(jest.mock('@gluestack-ui/themed').useToast().show).toHaveBeenCalled();
  });

  it('renders room data correctly', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            {
              _id: '1',
              roomName: 'Room 1',
              roomId: '101',
              roomNo: 1,
              floorNo: 0,
              minOccupancy: 2,
              maxOccupancy: 4,
              description: 'Description for Room 1',
            },
            {
              _id: '2',
              roomName: 'Room 2',
              roomId: '102',
              roomNo: 2,
              floorNo: 1,
              minOccupancy: 3,
              maxOccupancy: 5,
              description: 'Description for Room 2',
            },
          ],
        }),
      })
    );

    const { getByText } = render(<BookRoom />);

    // Wait for the component to finish rendering and fetching data
    await waitFor(() => {
      expect(getByText('Room 1')).toBeTruthy();
      expect(getByText('Room 2')).toBeTruthy();
    });
  });

  it('navigates to office details on room press', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            {
              _id: '1',
              roomName: 'Room 1',
              roomId: '101',
              roomNo: 1,
              floorNo: 0,
              minOccupancy: 2,
              maxOccupancy: 4,
              description: 'Description for Room 1',
            },
          ],
        }),
      })
    );

    const { getByText } = render(<BookRoom />);
    await waitFor(() => {
      expect(getByText('Room 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Room 1'));
    expect(jest.mock('expo-router').useRouter().push).toHaveBeenCalledWith({
      pathname: '/office-details',
      params: { roomData: JSON.stringify({
        _id: '1',
        roomName: 'Room 1',
        roomId: '101',
        roomNo: 1,
        floorNo: 0,
        minOccupancy: 2,
        maxOccupancy: 4,
        description: 'Description for Room 1',
      }) },
    });
  });
});
