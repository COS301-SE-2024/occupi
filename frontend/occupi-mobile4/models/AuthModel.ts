// src/models/UserModel.js
import * as SecureStore from 'expo-secure-store';

const LoginModel = {
  storeUserData: async (value) => {
    await SecureStore.setItemAsync('UserData', value);
  },

  storeToken: async (value) => {
    await SecureStore.setItemAsync('Token', value);
  },

  storeUserEmail: async (value) => {
    await SecureStore.setItemAsync('Email', value);
  },

  getToken: async () => {
    return await SecureStore.getItemAsync('Token');
  }
};

export default LoginModel;
