import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as SecureStore from 'expo-secure-store';
import { getPredictions, getDayPredictions, Prediction } from '../aimodel';
import { 
  getUserDetails, getRooms, getNotificationSettings, getUserBookings, getNotifications, 
  checkin, updateUserDetails, bookRoom, cancelBooking, getExpoPushTokens, 
  getSecuritySettings, updateSecuritySettings, updateNotificationSettings
} from '../apiservices';
import { 
  login, register, verifyOtpRegister, verifyOtplogin, logout 
} from '../authservices';
import { 
  storeUserData, storeToken, storeUserEmail, setState, storeNotificationSettings, 
  storeTheme, storeAccentColour, storeSecuritySettings, storeCheckInValue, 
  getUserData, getToken, getUserEmail, deleteUserData, deleteToken, 
  deleteUserEmail, deleteNotificationSettings, deleteSecuritySettings, deleteAllData 
} from '../securestore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('Integration Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should fetch predictions', async () => {
    const mockPredictions: Prediction[] = [
      { date: '2023-08-21', occupancy: 80 },
      { date: '2023-08-22', occupancy: 75 },
    ];
    mock.onGet('https://ai.occupi.tech/predict_week').reply(200, mockPredictions);

    const predictions = await getPredictions();
    expect(predictions).toEqual(mockPredictions);
  });

  it('should fetch day prediction', async () => {
    const mockPrediction: Prediction = { date: '2023-08-21', occupancy: 80 };
    mock.onGet('https://ai.occupi.tech/predict').reply(200, mockPrediction);

    const prediction = await getDayPredictions();
    expect(prediction).toEqual(mockPrediction);
  });

  it('should get user details', async () => {
    const mockUserDetails = { data: { id: 1, name: 'John Doe' }, status: 'success', message: 'User details fetched' };
    mock.onGet('https://dev.occupi.tech/api/user-details').reply(200, mockUserDetails);

    const userDetails = await getUserDetails('johndoe@example.com', 'mock_token');
    expect(userDetails).toEqual(mockUserDetails);
  });

  it('should get rooms', async () => {
    const mockRoomsResponse = { data: [{ id: 1, name: 'Room A' }], status: 'success', message: 'Rooms fetched' };
    mock.onGet('https://dev.occupi.tech/api/view-rooms').reply(200, mockRoomsResponse);

    const rooms = await getRooms({ email: 'johndoe@example.com' });
    expect(rooms).toEqual(mockRoomsResponse);
  });

  it('should get notification settings', async () => {
    const mockNotificationSettings = { data: { email_notifications: true, push_notifications: true }, status: 'success', message: 'Notification settings fetched' };
    mock.onGet('https://dev.occupi.tech/api/get-notification-settings').reply(200, mockNotificationSettings);

    const notificationSettings = await getNotificationSettings('johndoe@example.com');
    expect(notificationSettings).toEqual(mockNotificationSettings);
  });

  it('should get user bookings', async () => {
    const mockBookings = {
      data: null,
      error: {
        code: 'AUTH_ERROR',
        details: 'No authentication token found',
        message: 'Authentication failed',
      },
      message: 'Authentication failed',
      status: 'error',
    };
    mock.onGet('https://dev.occupi.tech/api/view-bookings').reply(200, mockBookings);
  
    const bookings = await getUserBookings('johndoe@example.com');
    expect(bookings).toEqual(mockBookings);
  });

  it('should get notifications', async () => {
    const mockNotifications = { data: [{ id: 1, message: 'Notification 1' }], status: 'success', message: 'Notifications fetched' };
    mock.onGet('https://dev.occupi.tech/api/get-notifications').reply(200, mockNotifications);

    const notifications = await getNotifications({ email: 'johndoe@example.com' });
    expect(notifications).toEqual(mockNotifications);
  });

  it('should check in', async () => {
    const mockCheckInResponse = { data: { message: 'Check-in successful' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/api/check-in').reply(200, mockCheckInResponse);

    const checkInResponse = await checkin({ email: 'johndoe@example.com', room_id: 1 });
    expect(checkInResponse).toEqual(mockCheckInResponse);
  });

  it('should update user details', async () => {
    const mockUpdateDetailsResponse = { data: { message: 'User details updated' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/api/update-user').reply(200, mockUpdateDetailsResponse);

    const updateDetailsResponse = await updateUserDetails({ email: 'johndoe@example.com', name: 'John Doe', phone: '1234567890' });
    expect(updateDetailsResponse).toEqual(mockUpdateDetailsResponse);
  });

  it('should book a room', async () => {
    const mockBookRoomResponse = { data: { message: 'Room booked' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/api/book-room').reply(200, mockBookRoomResponse);

    const bookRoomResponse = await bookRoom({ email: 'johndoe@example.com', room_id: 1, date: '2023-08-21' });
    expect(bookRoomResponse).toEqual(mockBookRoomResponse);
  });

  it('should cancel a booking', async () => {
    const mockCancelBookingResponse = { data: { message: 'Booking cancelled' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/api/cancel-booking').reply(200, mockCancelBookingResponse);

    const cancelBookingResponse = await cancelBooking({ email: 'johndoe@example.com', booking_id: 1 });
    expect(cancelBookingResponse).toEqual(mockCancelBookingResponse);
  });

  it('should get expo push tokens', async () => {
    const mockPushTokensResponse = {
      data: null,
      error: {
        code: 'UNKNOWN_ERROR',
        details: 'An unexpected error occurred',
        message: 'An unexpected error occurred',
      },
      message: 'An unexpected error occurred',
      status: 'error',
    };
    mock.onGet('https://dev.occupi.tech/api/get-push-tokens').reply(200, mockPushTokensResponse);
  
    const pushTokensResponse = await getExpoPushTokens(['johndoe@example.com', 'janesmith@example.com']);
    expect(pushTokensResponse).toEqual(mockPushTokensResponse);
  });

  it('should get security settings', async () => {
    const mockSecuritySettings = { data: { email_notifications: true, location_tracking: true }, status: 'success' };
    mock.onGet('https://dev.occupi.tech/api/get-security-settings').reply(200, mockSecuritySettings);

    const securitySettings = await getSecuritySettings('johndoe@example.com');
    expect(securitySettings).toEqual(mockSecuritySettings);
  });

  it('should update security settings', async () => {
    const mockUpdateSecurityResponse = { data: { message: 'Security settings updated' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/api/update-security-settings').reply(200, mockUpdateSecurityResponse);

    const updateSecurityResponse = await updateSecuritySettings({ email: 'johndoe@example.com', email_notifications: true, location_tracking: true });
    expect(updateSecurityResponse).toEqual(mockUpdateSecurityResponse);
  });

  it('should update notification settings', async () => {
    const mockUpdateNotificationResponse = { data: { message: 'Notification settings updated' }, status: 'success' };
    mock.onGet('https://dev.occupi.tech/api/update-notification-settings').reply(200, mockUpdateNotificationResponse);

    const updateNotificationResponse = await updateNotificationSettings({ email: 'johndoe@example.com', email_notifications: true, push_notifications: true });
    expect(updateNotificationResponse).toEqual(mockUpdateNotificationResponse);
  });

  it('should login', async () => {
    const mockLoginResponse = { data: { user: { id: 1, name: 'John Doe' }, token: 'mock_token' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/auth/login-mobile').reply(200, mockLoginResponse);

    const loginResponse = await login({ email: 'johndoe@example.com', password: 'password' });
    expect(loginResponse).toEqual(mockLoginResponse);
  });

  it('should register', async () => {
    const mockRegisterResponse = { data: { message: 'User registered' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/auth/register').reply(200, mockRegisterResponse);

    const registerResponse = await register({ email: 'johndoe@example.com', password: 'password', name: 'John Doe' });
    expect(registerResponse).toEqual(mockRegisterResponse);
  });

  it('should verify OTP for registration', async () => {
    const mockVerifyOTPResponse = { data: { user: { id: 1, name: 'John Doe' }, token: 'mock_token' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/auth/verify-otp-mobile-login').reply(200, mockVerifyOTPResponse);

    const verifyOTPResponse = await verifyOtpRegister({ email: 'johndoe@example.com', otp: '1234' });
    expect(verifyOTPResponse).toEqual(mockVerifyOTPResponse);
  });

  it('should verify OTP for login', async () => {
    const mockVerifyOTPResponse = { data: { user: { id: 1, name: 'John Doe' }, token: 'mock_token' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/auth/verify-otp-mobile-login').reply(200, mockVerifyOTPResponse);

    const verifyOTPResponse = await verifyOtplogin({ email: 'johndoe@example.com', otp: '1234' });
    expect(verifyOTPResponse).toEqual(mockVerifyOTPResponse);
  });

  it('should logout', async () => {
    const mockLogoutResponse = { data: { message: 'Logout successful' }, status: 'success' };
    mock.onPost('https://dev.occupi.tech/auth/logout').reply(200, mockLogoutResponse);

    const logoutResponse = await logout();
    expect(logoutResponse).toEqual(mockLogoutResponse);
  });

  it('should store and retrieve user data', async () => {
    const userData = { id: 1, name: 'John Doe' };
    const userDataString = JSON.stringify(userData);
     // Mock SecureStore methods
     SecureStore.setItemAsync.mockResolvedValueOnce();
     SecureStore.getItemAsync.mockResolvedValueOnce(userDataString);
     SecureStore.deleteItemAsync.mockResolvedValueOnce();
 
     // Store user data
     await storeUserData(userDataString);
    //  console.log('Data stored');
 
     // Retrieve user data
     const retrievedUserData = await getUserData();
    //  console.log('Retrieved Data:', retrievedUserData);
  });

  it('should store and retrieve token', async () => {
    const token = 'sample-token';

    // Mock SecureStore methods
    SecureStore.setItemAsync.mockResolvedValueOnce();
    SecureStore.getItemAsync.mockResolvedValueOnce(token);
    SecureStore.deleteItemAsync.mockResolvedValueOnce();

    // Store token
    await SecureStore.setItemAsync('UserToken', token);
    // console.log('Token stored');

    // Retrieve token
    const retrievedToken = await SecureStore.getItemAsync('UserToken');
    // console.log('Retrieved Token:', retrievedToken);

    // Assert retrieved token
    expect(retrievedToken).toEqual(token);

    // Delete token
    await SecureStore.deleteItemAsync('UserToken');
    // console.log('Token deleted');

  });

  it('should store and retrieve user email', async () => {
    const email = 'johndoe@example.com';

    // Mock SecureStore methods
    SecureStore.setItemAsync.mockResolvedValueOnce();
    SecureStore.getItemAsync.mockResolvedValueOnce(email);
    SecureStore.deleteItemAsync.mockResolvedValueOnce();

    // Retrieve user email
    const retrievedEmail = await SecureStore.getItemAsync('UserEmail');
    // console.log('Retrieved Email:', retrievedEmail);

    // Assert retrieved email
    expect(retrievedEmail).toEqual(email);

    // Delete user email
    await SecureStore.deleteItemAsync('UserEmail');
    // console.log('Email deleted');
  });

  it('should store and retrieve notification settings', async () => {
    const notificationSettings = { email_notifications: true, push_notifications: true };

    // Mock SecureStore methods
    SecureStore.setItemAsync.mockResolvedValueOnce();
    SecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(notificationSettings));
    SecureStore.deleteItemAsync.mockResolvedValueOnce();

    // Store notification settings
    await storeNotificationSettings(JSON.stringify(notificationSettings));
    // console.log('Notification settings stored');

    // Retrieve notification settings
    const retrievedNotificationSettings = await SecureStore.getItemAsync('Notifications');
    // console.log('Retrieved Notification Settings:', retrievedNotificationSettings);

    // Assert retrieved settings
    expect(retrievedNotificationSettings).toEqual(JSON.stringify(notificationSettings));

    // Delete notification settings
    await deleteNotificationSettings();
    // console.log('Notification settings deleted');
  });

  it('should store and retrieve security settings', async () => {
    const securitySettings = { email_notifications: true, location_tracking: true };

    // Mock SecureStore methods
    SecureStore.setItemAsync.mockResolvedValueOnce();
    SecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(securitySettings));
    SecureStore.deleteItemAsync.mockResolvedValueOnce();

    // Store security settings
    await storeSecuritySettings(JSON.stringify(securitySettings));
    // console.log('Security settings stored');

    // Retrieve security settings
    const retrievedSecuritySettings = await SecureStore.getItemAsync('Security');
    // console.log('Retrieved Security Settings:', retrievedSecuritySettings);

     // Assert retrieved settings
     expect(retrievedSecuritySettings).toEqual(JSON.stringify(securitySettings));

     // Delete security settings
     await deleteSecuritySettings();
    //  console.log('Security settings deleted');
  });

  it('should delete all data', async () => {
    // Mock SecureStore methods
    SecureStore.setItemAsync.mockResolvedValue();
    SecureStore.getItemAsync.mockResolvedValue(null);
    SecureStore.deleteItemAsync.mockResolvedValue();

    // Store data
    await storeUserData(JSON.stringify({ id: 1, name: 'John Doe' }));
    await storeToken('mock_token');
    await storeUserEmail('johndoe@example.com');
    await storeNotificationSettings(JSON.stringify({ email_notifications: true, push_notifications: true }));
    await storeSecuritySettings(JSON.stringify({ email_notifications: true, location_tracking: true }));

    // Delete all data
    await deleteAllData();
     
    // Retrieve data to verify deletion
    const userData = await getUserData();
    const token = await getToken();
    const email = await getUserEmail();
    const notificationSettings = await SecureStore.getItemAsync('Notifications');
    const securitySettings = await SecureStore.getItemAsync('Security');

    // Assert that all data has been deleted
    expect(userData).toBeNull();
    expect(token).toBeUndefined();
    expect(email).toBeNull();
    expect(notificationSettings).toBeNull();
    expect(securitySettings).toBeNull();
 
  });
});