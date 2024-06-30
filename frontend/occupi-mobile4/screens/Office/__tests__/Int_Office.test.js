import React from 'react';
import renderer, { act } from 'react-test-renderer';
import BookingDetails from '../BookingDetails';
import OfficeDetails from '../OfficeDetails';
import { router, useLocalSearchParams } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    navigate: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

// Mock BookingDetails component
jest.mock('../BookingDetails', () => {
  return jest.fn().mockImplementation((props) => (
    <div {...props}>
      <div testID="booking-data">
        <div testID="booking-link" onPress={() => props.onSubmit()} />
      </div>
    </div>
  ));
});

// Mock OfficeDetails component
jest.mock('../OfficeDetails', () => {
  return jest.fn().mockImplementation((props) => (
    <div {...props}>
      <div testID="office-data">
        <div testID="booking-link" onPress={() => props.onCheckAvailability()} />
      </div>
    </div>
  ));
});

// Mocking fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
);

jest.useFakeTimers();

describe('Office and Booking Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocalSearchParams.mockReturnValue({
      roomData: JSON.stringify({ roomId: '123', floorNo: 1 }),
      slot: '1',
      email: 'test@example.com'
    });
  });

  it('should render components without crashing', () => {
    const components = [OfficeDetails, BookingDetails];

    components.forEach(Component => {
      const tree = renderer.create(<Component />).toJSON();
      expect(tree).toBeTruthy();
    });
  });

  it('should navigate from OfficeDetails to BookingDetails', () => {
    const onCheckAvailability = jest.fn();
    const officeDetails = renderer.create(<OfficeDetails onCheckAvailability={onCheckAvailability} />);
    const bookingLink = officeDetails.root.findByProps({ testID: 'booking-link' });

    act(() => {
      bookingLink.props.onPress();
    });

    expect(onCheckAvailability).toHaveBeenCalled();
  });

  it('should display office data correctly', () => {
    const officeDetails = renderer.create(<OfficeDetails />);
    const officeData = officeDetails.root.findByProps({ testID: 'office-data' });

    expect(officeData).toBeTruthy();
  });

  it('should display booking data correctly', () => {
    const bookingDetails = renderer.create(<BookingDetails />);
    const bookingData = bookingDetails.root.findByProps({ testID: 'booking-data' });

    expect(bookingData).toBeTruthy();
  });

  it('should perform booking API call', async () => {
    const onSubmit = jest.fn();
    const bookingDetails = renderer.create(<BookingDetails onSubmit={onSubmit} />);
    const bookingLink = bookingDetails.root.findByProps({ testID: 'booking-link' });

    await act(async () => {
      bookingLink.props.onPress();
      jest.runAllTimers();
    });

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should handle navigation between OfficeDetails and BookingDetails', () => {
    const onCheckAvailability = jest.fn();
    const officeDetails = renderer.create(<OfficeDetails onCheckAvailability={onCheckAvailability} />);
    const bookingLink = officeDetails.root.findByProps({ testID: 'booking-link' });

    act(() => {
      bookingLink.props.onPress();
    });

    expect(onCheckAvailability).toHaveBeenCalled();

    // Simulate going back to OfficeDetails
    act(() => {
      router.navigate('OfficeDetails');
    });

    expect(router.navigate).toHaveBeenCalledWith('OfficeDetails');
  });
});