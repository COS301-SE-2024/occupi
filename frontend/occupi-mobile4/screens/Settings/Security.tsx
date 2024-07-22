import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import * as LocalAuthentication from "expo-local-authentication";
import {
  Icon,
  View,
  Text
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { useColorScheme, Switch } from 'react-native';
import GradientButton from '@/components/GradientButton';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Toast, ToastTitle, useToast } from '@gluestack-ui/themed';

const FONTS = {
  h3: { fontSize: 20, fontWeight: 'bold' },
  body3: { fontSize: 16 },
};

const SIZES = {
  padding: 16,
  base: 8,
  radius: 8,
};

const Security = () => {
  let colorScheme = useColorScheme();
  const toast = useToast();
  //retrieve user settings ad assign variables accordingly
  const [oldMfa, setOldMfa] = useState(false);
  const [newMfa, setNewMfa] = useState(false);
  const [oldForceLogout, setOldForceLogout] = useState(false);
  const [newForceLogout, setNewForceLogout] = useState(false);

  useEffect(() => {
    const getSecurityDetails = async () => {
      let settings = await SecureStore.getItemAsync('Security');
      const settingsObject = JSON.parse(settings);
      console.log(settingsObject);

      if (settingsObject.mfa === "on") {
        setOldMfa(true);
        setNewMfa(true);
      } else {
        setOldMfa(false);
        setNewMfa(false);
      }

      if (settingsObject.forceLogout === "on") {
        setOldForceLogout(true);
        setNewForceLogout(true);
      } else {
        setOldForceLogout(false);
        setNewForceLogout(false);
      }
    }
    getSecurityDetails();
  }, [])


  const toggleSwitch1 = () => {
    setNewMfa(previousState => !previousState);
  };
  const toggleSwitch2 = () => {
    setNewForceLogout(previousState => !previousState);
  };

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        "Biometric Authentication not available",
        "Your device does not support biometric authentication or it is not set up. Please use your PIN to confirm the booking."
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm your booking",
      fallbackLabel: "Use PIN",
    });

    if (result.success) {
      router.push('/changepassword');
    } else {
      Alert.alert(
        "Authentication failed",
        "Biometric authentication failed. Please try again."
      );
    }
  };

  const onSave = async () => {
    //integration here
    let userEmail = await SecureStore.getItemAsync('Email');
    let authToken = await SecureStore.getItemAsync('Token');

    try {
      const response = await axios.post('https://dev.occupi.tech/api/update-security-settings', {
        email: userEmail,
        mfa: newMfa ? "on" : "off",
        forceLogout: newForceLogout ? "on" : "off"
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
        withCredentials: true
      });
      const data = response.data;
      // console.log(`Response Data: ${JSON.stringify(data.data)}`);
      // console.log(data);
      if (response.status === 200) {
        const newSettings = {
          mfa: newMfa ? "on" : "off",
          forceLogout: newForceLogout ? "on" : "off",
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
        // console.log(newSettings);
        SecureStore.setItemAsync('Security', JSON.stringify(newSettings));
        router.replace('/settings');
      } else {
        console.log(data);
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
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBack = () => {
    if (newMfa !== oldMfa || newForceLogout !== oldForceLogout) {
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
      <View flex={1}>
        <View style={styles.header}>
          <Icon
            as={Feather}
            name="chevron-left"
            size="xl"
            color={colorScheme === 'dark' ? 'white' : 'black'}
            onPress={handleBack}
          />
          <Text style={styles.headerTitle} color={colorScheme === 'dark' ? 'white' : 'black'}>
            Security
          </Text>
          <FontAwesome5
            name="fingerprint"
            size={24}
            color={colorScheme === 'dark' ? 'white' : 'black'}
            style={styles.icon}
          />
        </View>


        <View flexDirection="column">
          <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
            <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Use 2fa to login</Text>
            <Switch
              trackColor={{ false: 'lightgray', true: 'lightgray' }}
              thumbColor={newMfa ? 'greenyellow' : 'white'}
              ios_backgroundColor="lightgray"
              onValueChange={toggleSwitch1}
              value={newMfa}
            />
          </View>
          <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
            <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Force logout on app close</Text>
            <Switch
              trackColor={{ false: 'lightgray', true: 'lightgray' }}
              thumbColor={newForceLogout ? 'greenyellow' : 'white'}
              ios_backgroundColor="lightgray"
              onValueChange={toggleSwitch2}
              value={newForceLogout}
            />
          </View>
          <TouchableOpacity onPress={() => handleBiometricAuth()}>
            <View flexDirection="row" my="$2" borderRadius={14} alignItems="center" justifyContent="center" backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} h="$12">
              <Text fontWeight="bold" color={colorScheme === 'dark' ? '#fff' : '#000'}>Change Password</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View position="absolute" left={0} right={0} bottom={36}>
        <GradientButton
          onPress={onSave}
          text="Save"
        />
      </View>
    </View >

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

export default Security;
