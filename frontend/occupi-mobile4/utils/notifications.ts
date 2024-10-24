import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { NotificationsReq,DeleteNotiRequest } from '@/models/requests';
import { getNotifications, removeNotification,} from '@/services/apiservices';

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

setupNotificationHandler();

export async function retrievePushToken() {
  if (!Device.isDevice) {
    global.alert('Must use physical device for Push Notifications');
    return undefined;
  }

  const token = await registerForPushNotificationsAsync();
  return token;
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
 
    
    global.alert('Must use physical device for Push Notifications');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}


 export async function sendPushNotification(expoPushTokens: string[], title: string, body: string) {
  const messages = expoPushTokens.map(token => ({
    to: token.expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { someData: 'goes here' },
  }));

  for (const message of messages) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }
}

export async function getUserNotifications() {
  let email = await SecureStore.getItemAsync('Email');
  
  try {
    const request : NotificationsReq = {
      operator: "eq",
      filter: {
          emails: [email]
      }
  };
      const response = await getNotifications(request);
      if (response.status === 200) {
          // console.log('notifications', response.data);
          return response.data
      }
      else {
          console.log(response)
          return response.data;
      }
  } catch (error) {
      console.error('Error:', error);
  }
} 

export async function deleteNotification(notiId: string): Promise<boolean> {
  const email = await SecureStore.getItemAsync('Email');
  
  if (!email) {
    console.error('Email not found in SecureStore');
    return false;
  }

  if (!notiId) {
    console.error('Invalid notificationId:', notiId);
    return false;
  }

  const request: DeleteNotiRequest = {
    email,
    notiId
  };

  try {
    const response = await removeNotification(request);
    if (response.status === 200) {
      console.log('Notification deleted:', notiId);
      return true;
    } else {
      console.log('Failed to delete notification:', response.message);
      return false;
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}