import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  Icon,
  View,
  Text,
  Input,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  InputField,
  InputIcon,
  InputSlot
} from '@gluestack-ui/themed';
import { Controller, useForm } from 'react-hook-form';
import { router } from 'expo-router';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useColorScheme, Switch } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import GradientButton from '@/components/GradientButton';
import * as SecureStore from 'expo-secure-store';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';

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

const Security = () => {
  let colorScheme = useColorScheme();
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
        console.log(data);
        if (response.status === 200) {
          const newSettings = {
            mfa: newMfa ? "on" : "off",
            forceLogout: newForceLogout ? "on" : "off",
          }
          console.log(newSettings);
          SecureStore.setItemAsync('Security', JSON.stringify(newSettings));
          router.replace('/settings');
        } else {
          console.log(data);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
          </View>
        </View>
      </KeyboardAvoidingView>
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
