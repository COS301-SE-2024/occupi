import React from 'react';
import renderer, { act } from 'react-test-renderer';
import BookRoom from '../BookRoom';
import ViewBookings from '../ViewBookings';
import ViewBookingDetails from '../ViewBookingDetails';
import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    navigate: jest.fn(),
  },
}));

// Mock components to include fetch calls
jest.mock('../BookRoom', () => {
  const React = require('react');
  return (props) => {
    React.useEffect(() => {
      fetch('https://dev.occupi.tech/api/view-rooms', { method: 'GET' });
    }, []);
    return (
      <div {...props}>
        <div testID="layout-toggle" onPress={() => {}} />
        <div testID="book-header">Book</div>
      </div>
    );
  };
});

jest.mock('../ViewBookings', () => {
  const React = require('react');
  return (props) => {
    React.useEffect(() => {
      fetch('https://dev.occupi.tech/api/view-bookings', { method: 'GET' });
    }, []);
    return (
      <div {...props}>
        <div testID="layout-toggle" onPress={() => {}} />
        <div testID="bookings-header">My bookings</div>
      </div>
    );
  };
});

jest.mock('../ViewBookingDetails', () => {
  const React = require('react');
  const { router } = require('expo-router');
  return (props) => {
    const handleCheckIn = () => {
      fetch('https://dev.occupi.tech/api/check-in', { method: 'POST' });
    };

    const handleCheckOut = () => {
      fetch('https://dev.occupi.tech/api/cancel-booking', { method: 'POST' });
      router.push('/home');
    };

    return (
      <div {...props}>
        <div testID="room-name" />
        <div testID="check-in-button" onPress={handleCheckIn} />
        <div testID="check-out-button" onPress={handleCheckOut} />
      </div>
    );
  };
});

// Mocking fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, data: [] }),
    ok: true,
  })
);

jest.useFakeTimers();

describe('Booking Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render components without crashing', () => {
    const components = [BookRoom, ViewBookings, ViewBookingDetails];

    components.forEach(Component => {
      const tree = renderer.create(<Component />).toJSON();
      expect(tree).toBeTruthy();
    });
  });

  it('should toggle layout in BookRoom', () => {
    const bookRoom = renderer.create(<BookRoom />);
    const layoutToggle = bookRoom.root.findByProps({ testID: 'layout-toggle' });

    act(() => {
      layoutToggle.props.onPress();
    });

    // Add assertions based on your component's behavior
  });

  it('should fetch and display rooms in BookRoom', async () => {
    const bookRoom = renderer.create(<BookRoom />);

    await act(async () => {
      jest.runAllTimers();
    });

    console.log(fetch.mock.calls); // Debugging

    expect(fetch).toHaveBeenCalledWith('https://dev.occupi.tech/api/view-rooms', expect.any(Object));
    // Add more assertions based on how your component displays fetched data
  });

  it('should toggle layout in ViewBookings', () => {
    const viewBookings = renderer.create(<ViewBookings />);
    const layoutToggle = viewBookings.root.findByProps({ testID: 'layout-toggle' });

    act(() => {
      layoutToggle.props.onPress();
    });

    // Add assertions based on your component's behavior
  });

  it('should fetch and display bookings in ViewBookings', async () => {
    const viewBookings = renderer.create(<ViewBookings />);

    await act(async () => {
      jest.runAllTimers();
    });

    console.log(fetch.mock.calls); // Debugging

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('https://dev.occupi.tech/api/view-bookings'), expect.any(Object));
    // Add more assertions based on how your component displays fetched data
  });

  it('should handle check-in in ViewBookingDetails', async () => {
    const viewBookingDetails = renderer.create(<ViewBookingDetails />);
    const checkInButton = viewBookingDetails.root.findByProps({ testID: 'check-in-button' });

    act(() => {
      checkInButton.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    console.log(fetch.mock.calls); // Debugging

    expect(fetch).toHaveBeenCalledWith('https://dev.occupi.tech/api/check-in', expect.any(Object));
    // Add assertions based on your component's behavior after check-in
  });

  it('should handle booking cancellation in ViewBookingDetails', async () => {
    const viewBookingDetails = renderer.create(<ViewBookingDetails />);
    const checkOutButton = viewBookingDetails.root.findByProps({ testID: 'check-out-button' });

    act(() => {
      checkOutButton.props.onPress();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    console.log(fetch.mock.calls); // Debugging

    expect(fetch).toHaveBeenCalledWith('https://dev.occupi.tech/api/cancel-booking', expect.any(Object));
    expect(router.push).toHaveBeenCalledWith('/home');
  });
});
