import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UserLogin, userRegister, verifyUserOtpRegister, VerifyUserOtpLogin, UserLogout } from '../auth';
import { fetchUserBookings, fetchRooms, userBookRoom, userCheckin, userCancelBooking } from '../bookings';
import { isPointInPolygon } from './dashboard';
import { retrievePushToken, sendPushNotification, getUserNotifications } from '../notifications';
import { getExtractedPredictions, getExtractedDailyPrediction, convertValues, valueToColor, getFormattedPredictionData, getFormattedDailyPredictionData } from '../occupancy';

describe('Integration Test Suite', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Auth Module', () => {
    it('should login a user', async () => {
      mock.onPost('/login').reply(200, { token: 'abc123' });
      const message = await UserLogin('test@example.com', 'password123');
      expect(message).toBe('Logged in successfully');
    });

    it('should register a user', async () => {
      mock.onPost('/register').reply(200, { token: 'abc123' });
      const message = await userRegister('test@example.com', 'password123', '123456');
      expect(message).toBe('Registered successfully');
    });

    it('should verify a user\'s OTP during registration', async () => {
      mock.onPost('/verify-otp-register').reply(200, { token: 'abc123' });
      const message = await verifyUserOtpRegister('test@example.com', '123456');
      expect(message).toBe('OTP verified successfully');
    });

    it('should verify a user\'s OTP during login', async () => {
      mock.onPost('/verify-otp-login').reply(200, { token: 'abc123' });
      const message = await VerifyUserOtpLogin('test@example.com', '123456');
      expect(message).toBe('OTP verified successfully');
    });

    it('should logout a user', async () => {
      mock.onPost('/logout').reply(200, { message: 'Logged out successfully' });
      const message = await UserLogout();
      expect(message).toBe('Logged out successfully');
    });
  });

  describe('Bookings Module', () => {
    it('should fetch a user\'s bookings', async () => {
      mock.onGet('/bookings').reply(200, [
        { id: 1, roomName: 'Room A' },
        { id: 2, roomName: 'Room B' },
      ]);
      const bookings = await fetchUserBookings();
      expect(bookings).toHaveLength(2);
    });

    it('should fetch rooms based on floor number or room name', async () => {
      mock.onPost('/rooms').reply(200, [
        { id: 1, roomName: 'Room A', floorNo: '1' },
        { id: 2, roomName: 'Room B', floorNo: '1' },
        { id: 3, roomName: 'Room C', floorNo: '2' },
      ]);
      const rooms = await fetchRooms('1', '');
      expect(rooms).toHaveLength(2);
    });

    it('should book a room', async () => {
      mock.onPost('/book-room').reply(200, { message: 'Room booked successfully' });
      const message = await userBookRoom(['test@example.com'], '09:00', '10:00');
      expect(message).toBe('Room booked successfully');
    });

    it('should check in a user', async () => {
      mock.onPost('/check-in').reply(200, { message: 'Checked in successfully' });
      const message = await userCheckin();
      expect(message).toBe('Checked in successfully');
    });

    it('should cancel a booking', async () => {
      mock.onPost('/cancel-booking').reply(200, { message: 'Booking cancelled successfully' });
      const message = await userCancelBooking();
      expect(message).toBe('Booking cancelled successfully');
    });
  });

  describe('Dashboard Module', () => {
    it('should determine if a point is within the university coordinates', () => {
      const point = { latitude: -25.754989, longitude: 28.235915 };
      expect(isPointInPolygon(point)).toBe(true);
    });
  });

  describe('Notifications Module', () => {
    it('should retrieve the push token', async () => {
      mock.onPost('/expo-push-token').reply(200, { token: 'abc123' });
      const token = await retrievePushToken();
      expect(token).toBe('abc123');
    });

    it('should send a push notification', async () => {
      mock.onPost('/send-push').reply(200, { message: 'Notification sent successfully' });
      const response = await sendPushNotification(['abc123'], 'Test', 'This is a test notification');
      expect(response).toBe('Notification sent successfully');
    });

    it('should fetch user notifications', async () => {
      mock.onPost('/notifications').reply(200, [
        { id: 1, title: 'Notification 1', body: 'This is notification 1' },
        { id: 2, title: 'Notification 2', body: 'This is notification 2' },
      ]);
      const notifications = await getUserNotifications();
      expect(notifications).toHaveLength(2);
    });
  });

  describe('Occupancy Module', () => {
    it('should get extracted predictions', async () => {
      mock.onGet('/predictions').reply(200, [
        { Date: 1, Day_of_Week: 1, Predicted_Attendance_Level: 'Low', Predicted_Class: 1 },
        { Date: 2, Day_of_Week: 2, Predicted_Attendance_Level: 'Medium', Predicted_Class: 3 },
      ]);
      const predictions = await getExtractedPredictions();
      expect(predictions).toHaveLength(2);
    });

    it('should get extracted daily prediction', async () => {
      mock.onGet('/day-prediction').reply(200, {
        Date: 1, Day_of_Week: 1, Predicted_Attendance_Level: 'Low', Predicted_Class: 1
      });
      const prediction = await getExtractedDailyPrediction();
      expect(prediction).toEqual({
        Date: 1, Day_of_week: 1, Predicted_Attendance_Level: 'Low', Predicted_Class: 1
      });
    });

    it('should convert values', () => {
      const data = [
        { label: 'Low', value: 1 },
        { label: 'Medium', value: 2 },
        { label: 'High', value: 3 },
      ];
      const convertedData = convertValues(data);
      expect(convertedData).toEqual([
        { label: 'Low', value: 150 },
        { label: 'Medium', value: 450 },
        { label: 'High', value: 750 },
      ]);
    });

    it('should get a color based on a value', () => {
      const color1 = valueToColor(1);
      const color3 = valueToColor(3);
      const color5 = valueToColor(5);
      expect(color1).toBe('rgb(0, 255, 0)');
      expect(color3).toBe('rgb(127, 127, 0)');
      expect(color5).toBe('rgb(255, 0, 0)');
    });

    it('should get formatted prediction data', async () => {
      mock.onGet('/predictions').reply(200, [
        { Date: 1, Day_of_Week: 1, Predicted_Attendance_Level: 'Low', Predicted_Class: 1 },
        { Date: 2, Day_of_Week: 2, Predicted_Attendance_Level: 'Medium', Predicted_Class: 2 },
      ]);
      const formattedData = await getFormattedPredictionData();
      expect(formattedData).toEqual([
        { value: 2, label: 'Tue' },
        { value: 3, label: 'Wed' },
      ]);
    });

    it('should get formatted daily prediction data', async () => {
      mock.onGet('/day-prediction').reply(200, {
        Date: 1, Day_of_Week: 1, Predicted_Attendance_Level: 'Low', Predicted_Class: 1
      });
      const formattedData = await getFormattedDailyPredictionData();
      expect(formattedData).toEqual({
        date: '1/1/2024',
        class: 2,
        day: 'Mon',
        attendance: 'Low'
      });
    });
  });
});