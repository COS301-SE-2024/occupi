import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Alert,
  TouchableOpacity,
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
import { Toast, ToastTitle, useToast } from '@gluestack-ui/themed';
import { updateSecurity } from '@/utils/user';
import { useTheme } from '@/components/ThemeContext';
import { DeviceMotion } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

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
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const toast = useToast();
  const [accentColour, setAccentColour] = useState('');
  const [oldMfa, setOldMfa] = useState(false);
  const [newMfa, setNewMfa] = useState(false);
  const [oldForceLogout, setOldForceLogout] = useState(false);
  const [newForceLogout, setNewForceLogout] = useState(false);
  const [isBackTapEnabled, setIsBackTapEnabled] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const lastMagnitudes = useRef([]);
  const lastTapTime = useRef(0);

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
    getAccentColour();
    
  }, []);

  useEffect(() => {
    const getSecurityDetails = async () => {
      let settings = await SecureStore.getItemAsync('Security');
      const settingsObject = JSON.parse(settings);

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

  useEffect(() => {
    let subscription;

    if (isBackTapEnabled) {
      subscription = DeviceMotion.addListener(({ acceleration }) => {
        const currentTime = Date.now();
        const magnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
        
        lastMagnitudes.current.push(magnitude);
        if (lastMagnitudes.current.length > 5) {
          lastMagnitudes.current.shift();
        }

        const avg = lastMagnitudes.current.reduce((a, b) => a + b, 0) / lastMagnitudes.current.length;
        const spike = magnitude > avg + 2 && magnitude > 2.5;
        const quickDrop = lastMagnitudes.current[lastMagnitudes.current.length - 2] > magnitude + 1;

        if (spike && quickDrop && currentTime - lastTapTime.current > 300) {
          setTapCount(prev => prev + 1);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log('Tap detected! Magnitude:', magnitude);
          lastTapTime.current = currentTime;
        }
      });

      DeviceMotion.setUpdateInterval(50);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isBackTapEnabled]);

  const toggleSwitch1 = () => setNewMfa(previousState => !previousState);
  const toggleSwitch2 = () => setNewForceLogout(previousState => !previousState);
  const toggleBackTap = () => setIsBackTapEnabled(previousState => !previousState);


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
    const settings = {
      mfa: newMfa ? "on" : "off",
      forceLogout: newForceLogout ? "on" : "off",
      backTap: isBackTapEnabled ? "on" : "off"
    };
    const response = await updateSecurity('settings', settings)
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <Toast nativeID={String(id)} variant="accent" action={response === "Settings updated successfully" ? 'success' : 'error'}>
            <ToastTitle>{response}</ToastTitle>
          </Toast>
        );
      },
    });
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
    <View flex={1} backgroundColor={currentTheme === 'dark' ? 'black' : 'white'} px="$4" pt="$16">
      <View flex={1}>
        <View style={styles.header}>
          <Icon
            as={Feather}
            name="chevron-left"
            size="xl"
            color={currentTheme === 'dark' ? 'white' : 'black'}
            onPress={handleBack}
          />
          <Text style={styles.headerTitle} color={currentTheme === 'dark' ? 'white' : 'black'}>
            Security
          </Text>
          <FontAwesome5
            name="fingerprint"
            size={24}
            color={currentTheme === 'dark' ? 'white' : 'black'}
            style={styles.icon}
          />
        </View>

        <View flexDirection="column">
          <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
            <Text color={currentTheme === 'dark' ? 'white' : 'black'}>Use 2fa to login</Text>
            <Switch
              trackColor={{ false: 'lightgray', true: 'lightgray' }}
              thumbColor={newMfa ? `${accentColour}` : 'white'}
              ios_backgroundColor="lightgray"
              onValueChange={toggleSwitch1}
              value={newMfa}
            />
          </View>
          <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
            <Text color={currentTheme === 'dark' ? 'white' : 'black'}>Force logout on app close</Text>
            <Switch
              trackColor={{ false: 'lightgray', true: 'lightgray' }}
              thumbColor={newForceLogout ? `${accentColour}` : 'white'}
              ios_backgroundColor="lightgray"
              onValueChange={toggleSwitch2}
              value={newForceLogout}
            />
          </View>
          <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
            <Text color={currentTheme === 'dark' ? 'white' : 'black'}>Back Tap</Text>
            <Switch
              trackColor={{ false: 'lightgray', true: 'lightgray' }}
              thumbColor={isBackTapEnabled ? `${accentColour}` : 'white'}
              ios_backgroundColor="lightgray"
              onValueChange={toggleBackTap}
              value={isBackTapEnabled}
            />
          </View>
          <TouchableOpacity onPress={() => handleBiometricAuth()}>
            <View flexDirection="row" my="$2" borderRadius={14} alignItems="center" justifyContent="center" backgroundColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} h="$12">
              <Text fontWeight="bold" color={currentTheme === 'dark' ? '#fff' : '#000'}>Change Password</Text>
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