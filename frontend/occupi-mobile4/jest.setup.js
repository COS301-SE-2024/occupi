jest.mock('expo-device', () => ({
    isDevice: jest.fn().mockReturnValue(true),
  }));
  
  // jest.mock('expo-notifications', () => ({
  //   getPermissionsAsync: jest.fn(),
  //   requestPermissionsAsync: jest.fn(),
  //   getExpoPushTokenAsync: jest.fn(),
  //   setNotificationChannelAsync: jest.fn(),
  //   setNotificationHandler: jest.fn(),
  //   AndroidImportance: {
  //     MAX: 5,
  //   },
  // }));

  jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: 'undetermined' })
    ),
    requestPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: 'granted' })
    ),
    getExpoPushTokenAsync: jest.fn(() =>
      Promise.resolve({ data: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
    ),
    setNotificationChannelAsync: jest.fn(),
    setNotificationHandler: jest.fn(),
    AndroidImportance: {
      MAX: 5,
    },
  }));
  
  

  
  jest.mock('expo-constants', () => ({
    expoConfig: {
      extra: {
        eas: {
          projectId: 'testProjectId',
        },
      },
    },
  }));
  
  jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
  }));
  
  jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: {
      ExpoSecureStore: {
        getValueWithKeyAsync: jest.fn(),
        setValueWithKeyAsync: jest.fn(),
        deleteValueWithKeyAsync: jest.fn(),
      },
    },
  }));
  
  jest.mock('@/services/apiservices', () => ({
    getNotifications: jest.fn(),
  }));

  jest.mock('react-native', () => ({
    Platform: {
      OS: 'ios',
    },
  }));
  jest.mock('expo-notifications');
  jest.mock('expo-constants', () => ({
    expoConfig: {
      extra: {
        eas: {
          projectId: 'testProjectId',
        },
      },
    },
  }));
  
  global.alert = jest.fn();