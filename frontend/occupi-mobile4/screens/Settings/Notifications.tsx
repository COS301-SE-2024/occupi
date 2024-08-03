import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import {
  Icon,
  View,
  Text
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { useColorScheme, Switch } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Toast, ToastTitle, useToast } from '@gluestack-ui/themed';


const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  gray: '#BEBEBE',
  primary: '#3366FF',
};

const FONTS = {
  h3: { fontSize: 20, fontWeight: 'bold' },
  body3: { fontSize: 16 },
};

const SIZES = {
  padding: 16,
  base: 8,
  radius: 8,
};

const Notifications = () => {
  let colorScheme = useColorScheme();
  const toast = useToast();
  //retrieve user settings ad assign variables accordingly
  const [oldInviteVal, setOldInviteVal] = useState(false);
  const [newInviteVal, setNewInviteVal] = useState(false);
  const [oldNotifyVal, setOldNotifyVal] = useState(false);
  const [newNotifyVal, setNewNotifyVal] = useState(false);

  useEffect(() => {
    const getNotificationDetails = async () => {
      let settings = await SecureStore.getItemAsync('Notifications');
      const settingsObject = JSON.parse(settings);
      if (settingsObject.invites === "on") {
        setOldInviteVal(true);
        setNewInviteVal(true);
      } else {
        setOldInviteVal(false);
        setNewInviteVal(false);
      }

      if (settingsObject.bookingReminder === "on") {
        setOldNotifyVal(true);
        setNewNotifyVal(true);
      } else {
        setOldNotifyVal(false);
        setNewNotifyVal(false);
      }
      // console.log(settings);
    }
    getNotificationDetails();
  }, [])

  const [accentColour, setAccentColour] = useState<string>('greenyellow');

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      console.log(accentcolour);
      setAccentColour(accentcolour);
    };
    getAccentColour();
  }, []);
  const toggleSwitch1 = () => {
    setNewInviteVal(previousState => !previousState)
  };
  const toggleSwitch2 = () => {
    setNewNotifyVal(previousState => !previousState)
  };

  const onSave = async () => {
    let userEmail = await SecureStore.getItemAsync('Email');
    let authToken = await SecureStore.getItemAsync('Token');

    try {
      const response = await axios.get('https://dev.occupi.tech/api/update-notification-settings', {
        params: {
          email: userEmail,
          invites: newInviteVal ? "on" : "off",
          bookingReminder: newNotifyVal ? "on" : "off"
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
        withCredentials: true
      });
      const data = response.data;
      // console.log(`Response Data: ${JSON.stringify(data.data)}`);
      console.log(data);
      if (response.status === 200) {
        const newSettings = {
          invites: newInviteVal ? "on" : "off",
          bookingReminder: newNotifyVal ? "on" : "off",
        }
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={String(id)} variant="accent" action="success">
                <ToastTitle>{data.message}</ToastTitle>
              </Toast>
            );
          },
        });
        console.log(newSettings);
        SecureStore.setItemAsync('Notifications', JSON.stringify(newSettings));
        router.replace('/settings');
      } else {
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={String(id)} variant="accent" action="success">
                <ToastTitle>{data.message}</ToastTitle>
              </Toast>
            );
          },
        });
        console.log(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBack = () => {
    if (newInviteVal !== oldInviteVal || newNotifyVal !== oldNotifyVal) {
      Alert.alert(
        'Save Changes',
        'You have unsaved changes. Would you like to save them?',
        [
          {
            text: 'Leave without saving',
            onPress: () => router.replace('/settings'),
            style: 'cancel',
          },
          { text: 'Save', onPress: () => onSave() },
        ],
        { cancelable: false }
      );
    }
    else {
      router.back();
    }
  }

  return (
    <View flex={1} backgroundColor={colorScheme === 'dark' ? 'black' : 'white'} px="$4" pt="$16">
      <View style={styles.header}>
        <Icon
          as={Feather}
          name="chevron-left"
          size="xl"
          color={colorScheme === 'dark' ? 'white' : 'black'}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle} color={colorScheme === 'dark' ? 'white' : 'black'}>
          Notifications
        </Text>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={colorScheme === 'dark' ? 'white' : 'black'}
          style={styles.icon}
        />
      </View>

      <View flexDirection="column">
        <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
          <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Notify when someone invites me</Text>
          <Switch
            trackColor={{ false: 'lightgray', true: 'lightgray' }}
            thumbColor={newInviteVal ? `${accentColour}` : 'white'}
            ios_backgroundColor="lightgray"
            onValueChange={toggleSwitch1}
            value={newInviteVal}
          />
        </View>
        <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
          <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Notify 15 minutes before booking time</Text>
          <Switch
            trackColor={{ false: 'lightgray', true: 'lightgray' }}
            thumbColor={newNotifyVal ? `${accentColour}` : 'white'}
            ios_backgroundColor="lightgray"
            onValueChange={toggleSwitch2}
            value={newNotifyVal}
          />
        </View>
      </View>
      <View position="absolute" left={0} right={0} bottom={36}>
        <GradientButton
          onPress={onSave}
          text="Save"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  icon: {
    marginRight: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h3,
  },

});

export default Notifications;
