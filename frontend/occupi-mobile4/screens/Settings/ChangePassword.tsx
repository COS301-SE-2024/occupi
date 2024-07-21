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

type SignUpSchemaType = z.infer<typeof signUpSchema>;

const ChangePassword = () => {
  let colorScheme = useColorScheme(); 

  const onSubmit = async (_data: SignUpSchemaType) => {
    //integration here
    let userEmail = await SecureStore.getItemAsync('Email');
    console.log(JSON.stringify({
        email: userEmail,
        currentPassword: _data.currentpassword,
        newPassword: _data.password,
        newPasswordConfirm: _data.confirmpassword
    }));
    if (_data.password === _data.confirmpassword) {
      let userEmail = await SecureStore.getItemAsync('Email');
      let authToken = await SecureStore.getItemAsync('Token');

      try {
        const response = await axios.post('https://dev.occupi.tech/api/update-security-settings', {
            email: userEmail,
            currentPassword: _data.currentpassword,
            newPassword: _data.password,
            newPasswordConfirm: _data.confirmpassword
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
          router.replace('/settings');
        } else {
          console.log(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    else if (_data.currentpassword === _data.password) {
      Alert.alert('Error', 'New password cannot be the same as the current password');
    }
    else {
      Alert.alert('Error', 'Passwords do not match');
    }
  };

  const signUpSchema = z.object({
    currentpassword: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
    password: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
    confirmpassword: z
      .string()
      .min(6, 'Must be at least 8 characters in length')
      .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
      .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
      .regex(new RegExp('.*\\d.*'), 'One number')
      .regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character'
      ),
  });

  const handleKeyPress = () => {
    Keyboard.dismiss();
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };
  const handleConfirmPwState = () => {
    setShowConfirmPassword((showState) => {
      return !showState;
    });
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  });

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
              onPress={() => router.back()}
            />
            <Text style={styles.headerTitle} color={colorScheme === 'dark' ? 'white' : 'black'}>
              Change Password
            </Text>
            <FontAwesome5
              name="fingerprint"
              size={24}
              color={colorScheme === 'dark' ? 'white' : 'black'}
              style={styles.icon}
            />
          </View>


          <View flexDirection="column">
            <FormControl isInvalid={!!errors.password} isRequired={true} mt="$4">
              <FormControlLabel mb="$1">
                <FormControlLabelText color={colorScheme === 'dark' ? 'white' : 'black'} fontWeight="$normal">Current Password</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="currentpassword"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({
                        password: value,
                      });
                      return true;
                    } catch (error) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$xl" borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} h={hp('6%')}>
                    <InputField
                      fontSize={wp('4%')}
                      placeholder="Password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                      color={colorScheme === 'dark' ? 'white' : 'black'}
                      type={showPassword ? 'text' : 'password'}
                    />
                    <InputSlot onPress={handleState} pr="$3">
                      <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                    </InputSlot>
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.password?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.password} isRequired={true} mt="$4">
              <FormControlLabel mb="$1">
                <FormControlLabelText color={colorScheme === 'dark' ? 'white' : 'black'} fontWeight="$normal">New Password</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="password"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({
                        password: value,
                      });
                      return true;
                    } catch (error) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$xl" borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} h={hp('6%')}>
                    <InputField
                      fontSize={wp('4%')}
                      placeholder="Password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      color={colorScheme === 'dark' ? 'white' : 'black'}
                      returnKeyType="done"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <InputSlot onPress={handleState} pr="$3">
                      <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                    </InputSlot>
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.password?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmpassword} isRequired={true} mt="$4">
              <FormControlLabel mb="$1">
                <FormControlLabelText color={colorScheme === 'dark' ? 'white' : 'black'} fontWeight="$normal">Confirm Password</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="confirmpassword"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({
                        password: value,
                      });

                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$xl" borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} h={hp('6%')}>
                    <InputField
                      placeholder="Confirm Password"
                      fontSize={wp('4%')}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      color={colorScheme === 'dark' ? 'white' : 'black'}
                      returnKeyType="done"
                      type={showConfirmPassword ? 'text' : 'password'}
                    />
                    <InputSlot onPress={handleConfirmPwState} pr="$3">
                      <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                    </InputSlot>
                  </Input>

                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.confirmpassword?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

          </View>
        </View>
      </KeyboardAvoidingView>
      <View position="absolute" left={0} right={0} bottom={36}>
        <GradientButton
          onPress={handleSubmit(onSubmit)}
          text="Change Password"
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

export default ChangePassword;
