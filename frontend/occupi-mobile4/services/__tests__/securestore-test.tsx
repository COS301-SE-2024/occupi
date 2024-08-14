import * as SecureStore from 'expo-secure-store';
import * as secureStore from '../../services/securestore'; // Adjust the import path as needed

jest.mock('expo-secure-store');

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('SecureStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test all store functions
  const storeFunctions = [
    { name: 'storeUserData', key: 'UserData' },
    { name: 'storeToken', key: 'Token' },
    { name: 'storeUserEmail', key: 'Email' },
    { name: 'setState', key: 'AppState' },
    { name: 'storeNotificationSettings', key: 'Notifications' },
    { name: 'storeTheme', key: 'Theme' },
    { name: 'storeAccentColour', key: 'accentColour' },
    { name: 'storeSecuritySettings', key: 'Security' },
  ];

  storeFunctions.forEach(({ name, key }) => {
    describe(name, () => {
      it(`should store ${key}`, async () => {
        const value = 'test-value';
        await secureStore[name](value);
        expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(key, value);
      });
    });
  });

  describe('getUserData', () => {
    it('should return parsed user data when it exists', async () => {
      const userData = { id: 1, name: 'John Doe' };
      mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(userData));
      const result = await secureStore.getUserData();
      expect(result).toEqual(userData);
    });

    it('should return null when user data does not exist', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);
      const result = await secureStore.getUserData();
      expect(result).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token when it exists', async () => {
      const token = 'abc123';
      mockedSecureStore.getItemAsync.mockResolvedValue(token);
      const result = await secureStore.getToken();
      expect(result).toBe(token);
    });

    it('should return undefined when token does not exist', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);
      const result = await secureStore.getToken();
      expect(result).toBeUndefined();
    });
  });

  describe('getUserEmail', () => {
    it('should return user email when it exists', async () => {
      const email = 'test@example.com';
      mockedSecureStore.getItemAsync.mockResolvedValue(email);
      const result = await secureStore.getUserEmail();
      expect(result).toBe(email);
    });

    it('should return null when user email does not exist', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);
      const result = await secureStore.getUserEmail();
      expect(result).toBeNull();
    });
  });

  describe('getCurrentRoom', () => {
    it('should return current room when it exists', async () => {
      const room = 'Room A';
      mockedSecureStore.getItemAsync.mockResolvedValue(room);
      const result = await secureStore.getCurrentRoom();
      expect(result).toBe(room);
    });

    it('should return null when current room does not exist', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);
      const result = await secureStore.getCurrentRoom();
      expect(result).toBeNull();
    });
  });

  // Test all delete functions
  const deleteFunctions = [
    { name: 'deleteUserData', key: 'UserData' },
    { name: 'deleteToken', key: 'Token' },
    { name: 'deleteUserEmail', key: 'Email' },
    { name: 'deleteNotificationSettings', key: 'Notifications' },
    { name: 'deleteSecuritySettings', key: 'Security' },
  ];

  deleteFunctions.forEach(({ name, key }) => {
    describe(name, () => {
      it(`should delete ${key}`, async () => {
        await secureStore[name]();
        expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('deleteAllData', () => {
    it('should delete all data', async () => {
      await secureStore.deleteAllData();
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('Token');
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('Email');
    });
  });
});