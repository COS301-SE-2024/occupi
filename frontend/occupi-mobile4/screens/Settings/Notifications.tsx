import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { View, Text, Icon, Toast, useToast, ToastTitle } from '@gluestack-ui/themed';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import GradientButton from '@/components/GradientButton';
import { updateNotifications } from '@/utils/user';

const Notifications = () => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const toast = useToast();
  const [accentColour, setAccentColour] = useState('');
  const [oldInviteVal, setOldInviteVal] = useState(false);
  const [newInviteVal, setNewInviteVal] = useState(false);
  const [oldNotifyVal, setOldNotifyVal] = useState(false);
  const [newNotifyVal, setNewNotifyVal] = useState(false);

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
    getAccentColour();
    
    const getNotificationDetails = async () => {
      let settings = await SecureStore.getItemAsync('Notifications');
      const settingsObject = JSON.parse(settings);
      setOldInviteVal(settingsObject.invites === "on");
      setNewInviteVal(settingsObject.invites === "on");
      setOldNotifyVal(settingsObject.bookingReminder === "on");
      setNewNotifyVal(settingsObject.bookingReminder === "on");
    }
    getNotificationDetails();
  }, []);

  const toggleSwitch = (setter) => () => setter(prev => !prev);

  const onSave = async () => {
    const settings = {
      invites: newInviteVal ? "on" : "off",
      bookingReminder: newNotifyVal ? "on" : "off"
    };
    const response = await updateNotifications(settings)
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={String(id)} variant="accent" action={response === "Settings updated successfully" ? 'success' : 'error'}>
          <ToastTitle>{response}</ToastTitle>
        </Toast>
      ),
    });
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

  const SettingItem = ({ title, value, onValueChange }) => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
      borderRadius: 14,
      padding: wp('4%'),
      marginBottom: hp('2%'),
    }}>
      <Text style={{
        color: currentTheme === 'dark' ? 'white' : 'black',
        fontSize: wp('4%'),
      }}>
        {title}
      </Text>
      <Switch
        trackColor={{ false: 'lightgray', true: 'lightgray' }}
        thumbColor={value ? accentColour : 'white'}
        ios_backgroundColor="lightgray"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme === 'dark' ? '#000' : '#FFF' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={currentTheme === 'dark' ? ['#1A1A1A', '#000'] : ['#F0F0F0', '#FFF']}
          style={{
            paddingTop: hp('3%'),
            paddingHorizontal: wp('4%'),
            paddingBottom: hp('1%'),
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: hp('2%'),
          }}>
            <TouchableOpacity onPress={handleBack} style={{ padding: 10 }}>
              <Icon
                as={Feather}
                name="chevron-left"
                size="xl"
                color={currentTheme === 'dark' ? 'white' : 'black'}
                testID="back-button"
              />
            </TouchableOpacity>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: currentTheme === 'dark' ? 'white' : 'black',
            }}>
              Notifications
            </Text>
            <Ionicons
              name="notifications-outline"
              size={wp('6%')}
              color={currentTheme === 'dark' ? 'white' : 'black'}
            />
          </View>
        </LinearGradient>

        <View style={{ padding: wp('4%') }}>
          <SettingItem
            title="Notify when someone invites me"
            value={newInviteVal}
            onValueChange={toggleSwitch(setNewInviteVal)}
          />
          <SettingItem
            title="Notify 15 minutes before booking time"
            value={newNotifyVal}
            onValueChange={toggleSwitch(setNewNotifyVal)}
          />
        </View>
      </ScrollView>
      <View style={{
        position: 'absolute',
        left: wp('4%'),
        right: wp('4%'),
        bottom: hp('4%'),
      }}>
        <GradientButton onPress={onSave} text="Save" />
      </View>
    </SafeAreaView>
  );
};

export default Notifications;