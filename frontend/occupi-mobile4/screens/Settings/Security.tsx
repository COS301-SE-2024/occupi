import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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

const Security = () => {
  let colorScheme = useColorScheme();
  //retrieve user settings ad assign variables accordingly
  const [isEnabled1, setIsEnabled1] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [isEnabled3, setIsEnabled3] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const toggleSwitch1 = () => {
    setIsEnabled1(previousState => !previousState);
    setIsSaved(false);
  };
  const toggleSwitch2 = () => {
    setIsEnabled2(previousState => !previousState);
    setIsSaved(false);
  };
  const toggleSwitch3 = () => {
    setIsEnabled3(previousState => !previousState);
    setIsSaved(false);
  };

  const onSubmit = async (_data: SignUpSchemaType) => {
    //integration here
    console.log("hmmm");
    if (_data.password === _data.confirmpassword) {
      Alert.alert('Success', 'Changes saved successfully');
    }
    else if (_data.currentpassword === _data.password) {
      Alert.alert('Error', 'New password cannot be the same as the current password');
    }
    else {
      Alert.alert('Error', 'Passwords do not match');
    }
  };

  const handleBack = () => {
    if (isSaved === false) {
      Alert.alert(
        'Save Changes',
        'You have unsaved changes. Would you like to save them?',
        [
          {
            text: 'Leave without saving',
            onPress: () => router.back(),
            style: 'cancel',
          },
          { text: 'Save', onPress: () => onSubmit },
        ],
        { cancelable: false }
      );
    }
    else {
      router.back();
    }
  }

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
              <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Use faceid/touch id to enter app</Text>
              <Switch
                trackColor={{ false: 'lightgray', true: 'lightgray' }}
                thumbColor={isEnabled1 ? 'greenyellow' : 'white'}
                ios_backgroundColor="lightgray"
                onValueChange={toggleSwitch1}
                value={isEnabled1}
              />
            </View>
            <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
              <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Use 2fa to login</Text>
              <Switch
                trackColor={{ false: 'lightgray', true: 'lightgray' }}
                thumbColor={isEnabled2 ? 'greenyellow' : 'white'}
                ios_backgroundColor="lightgray"
                onValueChange={toggleSwitch2}
                value={isEnabled2}
              />
            </View>
            <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
              <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Force logout on app close</Text>
              <Switch
                trackColor={{ false: 'lightgray', true: 'lightgray' }}
                thumbColor={isEnabled3 ? 'greenyellow' : 'white'}
                ios_backgroundColor="lightgray"
                onValueChange={toggleSwitch3}
                value={isEnabled3}
              />
            </View>
            <Text my="$2" color={colorScheme === 'dark' ? 'white' : 'black'}>Change password</Text>
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
