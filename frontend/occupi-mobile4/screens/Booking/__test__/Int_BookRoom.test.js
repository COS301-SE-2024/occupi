import React from 'react';
import { render, waitFor, fireEvent, act, screen } from '@testing-library/react-native';
import BookRoom from '../BookRoom'; // Adjust this path if necessary
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
);

let mockPush;
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn(() => Promise.resolve({
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
  }));

  mockPush = jest.fn();
  jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
    push: mockPush,
  });

  jest.spyOn(require('@gluestack-ui/themed'), 'useToast').mockReturnValue({
    show: jest.fn(),
  });
});

afterEach(() => {
  mockPush.mockRestore();
});

describe('BookRoom Component', () => {
  it('renders correctly and fetches room data', async () => {
    await act(async () => {
      render(
        <SafeAreaProvider>
          <BookRoom />
        </SafeAreaProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('book-header')).toBeTruthy();
      expect(screen.getByText('Room 1')).toBeTruthy();
      expect(screen.getByText('Room 2')).toBeTruthy();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://dev.occupi.tech/api/view-rooms');
  });

  it('toggles layout correctly', async () => {
    const { getByTestId } = render(
      <SafeAreaProvider>
        <BookRoom />
      </SafeAreaProvider>
    );

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

    render(
      <SafeAreaProvider>
        <BookRoom />
      </SafeAreaProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('book-header')).toBeTruthy();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://dev.occupi.tech/api/view-rooms');
    await waitFor(() => {
      expect(require('@gluestack-ui/themed').useToast().show).toHaveBeenCalledTimes(1);
    });
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

    const { getByText } = render(
      <SafeAreaProvider>
        <BookRoom />
      </SafeAreaProvider>
    );

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

    const { getByText } = render(
      <SafeAreaProvider>
        <BookRoom />
      </SafeAreaProvider>
    );
    await waitFor(() => {
      expect(getByText('Room 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Room 1'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
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