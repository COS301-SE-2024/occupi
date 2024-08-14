import * as SecureStore from 'expo-secure-store';
import * as secureStore from '../securestore'; 

jest.mock('expo-secure-store');

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('Secure Store Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test store functions
  const storeTestCases = [
    { func: secureStore.storeUserData, key: 'UserData' },
    { func: secureStore.storeToken, key: 'Token' },
    { func: secureStore.storeUserEmail, key: 'Email' },
    { func: secureStore.setState, key: 'AppState' },
    { func: secureStore.storeNotificationSettings, key: 'Notifications' },
    { func: secureStore.storeTheme, key: 'Theme' },
    { func: secureStore.storeAccentColour, key: 'accentColour' },
    { func: secureStore.storeSecuritySettings, key: 'Security' },
  ];

  test.each(storeTestCases)('$func stores value correctly', async ({ func, key }) => {
    const testValue = 'test-value';
    await func(testValue);
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(key, testValue);
  });

  // Test getUserData
  it('getUserData returns parsed data when available', async () => {
    const mockData = { name: 'John Doe' };
    mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockData));
    const result = await secureStore.getUserData();
    expect(result).toEqual(mockData);
  });

  it('getUserData returns null when no data available', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    const result = await secureStore.getUserData();
    expect(result).toBeNull();
  });

  // Test getToken
  it('getToken returns token when available', async () => {
    const mockToken = 'mock-token';
    mockedSecureStore.getItemAsync.mockResolvedValue(mockToken);
    const result = await secureStore.getToken();
    expect(result).toBe(mockToken);
  });

  it('getToken returns undefined when no token available', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    const result = await secureStore.getToken();
    expect(result).toBeUndefined();
  });

  // Test getUserEmail
  it('getUserEmail returns email when available', async () => {
    const mockEmail = 'test@example.com';
    mockedSecureStore.getItemAsync.mockResolvedValue(mockEmail);
    const result = await secureStore.getUserEmail();
    expect(result).toBe(mockEmail);
  });

  // Test getCurrentRoom
  it('getCurrentRoom returns room when available', async () => {
    const mockRoom = 'Room 101';
    mockedSecureStore.getItemAsync.mockResolvedValue(mockRoom);
    const result = await secureStore.getCurrentRoom();
    expect(result).toBe(mockRoom);
  });

  // Test delete functions
  const deleteTestCases = [
    { func: secureStore.deleteUserData, key: 'UserData' },
    { func: secureStore.deleteToken, key: 'Token' },
    { func: secureStore.deleteUserEmail, key: 'Email' },
    { func: secureStore.deleteNotificationSettings, key: 'Notifications' },
    { func: secureStore.deleteSecuritySettings, key: 'Security' },
  ];

  test.each(deleteTestCases)('$func deletes item correctly', async ({ func, key }) => {
    await func();
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
  });

  // Test deleteAllData
  it('deleteAllData deletes all specified items', async () => {
    await secureStore.deleteAllData();
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('Token');
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('Email');
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
  });
});