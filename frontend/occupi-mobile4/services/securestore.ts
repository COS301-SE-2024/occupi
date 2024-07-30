import * as SecureStore from 'expo-secure-store';
import { User } from '@/models/data';

export async function storeUserData(value: string) {
  await SecureStore.setItemAsync('UserData', value);
}

export async function storeToken(value: string) {
  await SecureStore.setItemAsync('Token', value);
}

export async function storeUserEmail(value: string) {
  await SecureStore.setItemAsync('Email', value);
}

export async function setState(value: string) {
  await SecureStore.setItemAsync('AppState', value);
}

export async function storeNotificationSettings(value: string) {
  await SecureStore.setItemAsync('Notifications', value);
}

export async function storeSecuritySettings(value: string) {
  await SecureStore.setItemAsync('Security', value);
}

export async function getUserData() {
  let result: string | null = await SecureStore.getItemAsync('UserData');
  return result ? JSON.parse(result) : null;
}

export async function getToken() {
  let result = await SecureStore.getItemAsync('Token');
  const tokenVal = result;
  // console.log('token', result);
  return tokenVal;
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

export async function deleteNotificationSettings() {
  await SecureStore.deleteItemAsync('Notifications');
}

export async function deleteSecuritySettings() {
  await SecureStore.deleteItemAsync('Security');
}

export async function deleteAllData() {
  await SecureStore.deleteItemAsync('UserData');
  await SecureStore.deleteItemAsync('Token');
  await SecureStore.deleteItemAsync('Email');
}