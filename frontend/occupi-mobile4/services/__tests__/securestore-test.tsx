import * as SecureStore from 'expo-secure-store';
import {
    storeUserData,
    storeToken,
    getUserData,
    getToken,
    deleteUserData,
    deleteAllData,
  } from '../securestore';
  
  jest.mock('expo-secure-store');

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

  describe('SecureStore', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('storeUserData', () => {
      it('should store user data', async () => {
        const userData = JSON.stringify({ id: 1, name: 'John Doe' });
        await storeUserData(userData);
        expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('UserData', userData);
      });
    });
  
    describe('storeToken', () => {
      it('should store token', async () => {
        const token = 'abc123';
        await storeToken(token);
        expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('Token', token);
      });
    });
  
    describe('getUserData', () => {
      it('should return parsed user data when it exists', async () => {
        const userData = { id: 1, name: 'John Doe' };
        mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(userData));
        const result = await getUserData();
        expect(result).toEqual(userData);
      });
  
      it('should return null when token does not exist', async () => {
        mockedSecureStore.getItemAsync.mockResolvedValue(null);
        const result = await getToken();
        expect(result).toBeNull();
      });
    });
  
    describe('getToken', () => {
      it('should return token when it exists', async () => {
        const token = 'abc123';
        mockedSecureStore.getItemAsync.mockResolvedValue(token);
        const result = await getToken();
        expect(result).toBe(token);
      });
  
      it('should return undefined when token does not exist', async () => {
        mockedSecureStore.getItemAsync.mockResolvedValue(null);
        const result = await getToken();
        expect(result).toBeUndefined();
      });
    });
  
    describe('deleteUserData', () => {
      it('should delete user data', async () => {
        await deleteUserData();
        expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
      });
    });
  
    describe('deleteAllData', () => {
      it('should delete all data', async () => {
        await deleteAllData();
        expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('UserData');
        expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('Token');
        expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('Email');
      });
    });
  
   
  });