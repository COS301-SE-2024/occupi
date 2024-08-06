import * as SecureStore from 'expo-secure-store';
import {
  storeUserData,
  storeToken,
  storeUserEmail,
  setState,
  storeNotificationSettings,
  storeSecuritySettings,
  getUserData,
  getToken,
  getUserEmail,
  getCurrentRoom,
  deleteUserData,
  deleteToken,
  deleteUserEmail,
  deleteNotificationSettings,
  deleteSecuritySettings,
  deleteAllData
} from '../../services/securestore';

jest.mock('expo-secure-store');

describe('Secure Store Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('storeUserData stores user data', async () => {
    const userData = JSON.stringify({ name: 'John Doe', email: 'john@example.com' });
    await storeUserData(userData);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('UserData', userData);
  });

  test('storeToken stores token', async () => {
    const token = 'abc123';
    await storeToken(token);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('Token', token);
  });

  test('storeUserEmail stores email', async () => {
    const email = 'john@example.com';
    await storeUserEmail(email);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('Email', email);
  });

  test('setState stores app state', async () => {
    const state = 'active';
    await setState(state);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('AppState', state);
  });

  test('storeNotificationSettings stores notification settings', async () => {
    const settings = JSON.stringify({ pushEnabled: true });
    await storeNotificationSettings(settings);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('Notifications', settings);
  });

  test('storeSecuritySettings stores security settings', async () => {
    const settings = JSON.stringify({ twoFactor: true });
    await storeSecuritySettings(settings);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('Security', settings);
  });

  test('getUserData retrieves user data', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(userData));
    const result = await getUserData();
    expect(result).toEqual(userData);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('UserData');
  });

  test('getToken retrieves token', async () => {
    const token = 'abc123';
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(token);
    const result = await getToken();
    expect(result).toBe(token);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('Token');
  });

  test('getUserEmail retrieves email', async () => {
    const email = 'john@example.com';
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(email);
    const result = await getUserEmail();
    expect(result).toBe(email);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('Email');
  });

  test('getCurrentRoom retrieves current room', async () => {
    const room = 'living-room';
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(room);
    const result = await getCurrentRoom();
    expect(result).toBe(room);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('CurrentRoom');
  });

  test('deleteUserData deletes user data', async () => {
    await deleteUserData();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
  });

  test('deleteToken deletes token', async () => {
    await deleteToken();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('Token');
  });

  test('deleteUserEmail deletes email', async () => {
    await deleteUserEmail();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('Email');
  });

  test('deleteNotificationSettings deletes notification settings', async () => {
    await deleteNotificationSettings();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('Notifications');
  });

  test('deleteSecuritySettings deletes security settings', async () => {
    await deleteSecuritySettings();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('Security');
  });

  test('deleteAllData deletes all data', async () => {
    await deleteAllData();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('Token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('Email');
  });
});