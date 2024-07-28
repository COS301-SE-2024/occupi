import * as SecureStore from 'expo-secure-store';

export async function storeUserData(value : string) {
    await SecureStore.setItemAsync('UserData', value);
  }

export async function storeToken(value : string) {
    await SecureStore.setItemAsync('Token', value);
  }

export async function storeUserEmail(value : string) {
    await SecureStore.setItemAsync('Email', value);
  }

export async function setState(value : string) {
    await SecureStore.setItemAsync('AppState', value);
}

export async function getUserData() {
    let result = await SecureStore.getItemAsync('UserData');
    return result;
  }

export async function getToken() {
    let result = await SecureStore.getItemAsync('Token');
    return result;
  }

export async function getUserEmail() {
    let result = await SecureStore.getItemAsync('Email');
    return result;
  }

export async function deleteUserData() {
    await SecureStore.deleteItemAsync('UserData');
  }

export async function deleteToken() {
    await SecureStore.deleteItemAsync('Token');
  }

export async function deleteUserEmail() {
    await SecureStore.deleteItemAsync('Email');
  }

export async function deleteAllData() {
    await SecureStore.deleteItemAsync('UserData');
    await SecureStore.deleteItemAsync('Token');
    await SecureStore.deleteItemAsync('Email');
  }