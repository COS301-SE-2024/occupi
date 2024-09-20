import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { View, Text, Icon, Toast, useToast, ToastTitle } from '@gluestack-ui/themed';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { DeviceMotion } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import Tooltip from '@/components/Tooltip';
import { updateSecurity } from '@/utils/user';
import GradientButton from '@/components/GradientButton';

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
    
    const getSecurityDetails = async () => {
      let settings = await SecureStore.getItemAsync('Security');
      const settingsObject = JSON.parse(settings);

      setOldMfa(settingsObject.mfa === "on");
      setNewMfa(settingsObject.mfa === "on");
      setOldForceLogout(settingsObject.forceLogout === "on");
      setNewForceLogout(settingsObject.forceLogout === "on");
      setIsBackTapEnabled(settingsObject.backTap === "on");
    }
    getSecurityDetails();
  }, []);

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

  const toggleSwitch = (setter) => () => setter(prev => !prev);

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
      render: ({ id }) => (
        <Toast nativeID={String(id)} variant="accent" action={response === "Settings updated successfully" ? 'success' : 'error'}>
          <ToastTitle>{response}</ToastTitle>
        </Toast>
      ),
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

  const SettingItem = ({ title, value, onValueChange, tooltipContent }) => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
      borderRadius: 14,
      padding: wp('4%'),
      marginBottom: hp('2%'),
    }}>
      <View flexDirection="row" alignItems="center">
        <Text style={{
          color: currentTheme === 'dark' ? 'white' : 'black',
          fontSize: wp('4%'),
        }}>
          {title}
        </Text>
        {tooltipContent && (
          <Tooltip
            content={tooltipContent}
            placement="bottom"
          />
        )}
      </View>
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
              Security
            </Text>
            <FontAwesome5
              name="fingerprint"
              size={wp('6%')}
              color={currentTheme === 'dark' ? 'white' : 'black'}
            />
          </View>
        </LinearGradient>

        <View style={{ padding: wp('4%') }}>
          <SettingItem
            title="Use 2FA to login"
            value={newMfa}
            onValueChange={toggleSwitch(setNewMfa)}
          />
          <SettingItem
            title="Force logout on app close"
            value={newForceLogout}
            onValueChange={toggleSwitch(setNewForceLogout)}
          />
          <SettingItem
            title="Flip Phone"
            value={isBackTapEnabled}
            onValueChange={toggleSwitch(setIsBackTapEnabled)}
            tooltipContent="Place your phone face down, then flip it face up to activate OccuBot."
          />
          <TouchableOpacity onPress={handleBiometricAuth}>
            <View style={{
              backgroundColor: currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
              borderRadius: 14,
              padding: wp('4%'),
              alignItems: 'center',
              marginTop: hp('2%'),
            }}>
              <Text style={{
                fontWeight: 'bold',
                color: currentTheme === 'dark' ? '#fff' : '#000',
                fontSize: wp('4%'),
              }}>
                Change Password
              </Text>
            </View>
          </TouchableOpacity>
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

export default Security;