import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

 export async function sendPushNotification(expoPushTokens: string[], title: string, body: string) {
  const messages = expoPushTokens.map(token => ({
    to: token,
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