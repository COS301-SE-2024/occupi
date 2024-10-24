import React, { useState, useEffect, useRef } from 'react';
import Logo from '../../screens/Login/assets/images/Occupi/Occupi-gradient.png';
import {
  Image,
  HStack,
  VStack,
  Text,
  FormControl,
  Box,
  LinkText,
  Input,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  InputIcon,
  Toast,
  ToastTitle,
  useToast,
  Heading,
  InputField,
  InputSlot,
  FormControlLabel,
  FormControlLabelText,
  View,
} from '@gluestack-ui/themed';
import Checkbox from 'expo-checkbox';
import { retrievePushToken } from '@/utils/notifications';
import GradientButton from '@/components/GradientButton';
import { Controller, useForm } from 'react-hook-form';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Keyboard, Animated, Easing, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
// import { FacebookIcon, GoogleIcon } from './assets/Icons/Social';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as WebBrowser from 'expo-web-browser';
import { userRegister } from '@/utils/auth';

const isEmployeeIdFocused = false;
const signUpSchema = z.object({
  email: z.string().min(1, 'Email is required').email(),
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
  employeeId: z.string().min(1, 'Employee ID is required').regex(/^\d+$/, 'Employee ID must be numerical'),
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;

retrievePushToken();

const SignUpForm = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  });
  const isEmailFocused = useState(false);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);

  const handlePressPrivacy = async () => {
    await WebBrowser.openBrowserAsync('https://www.freeprivacypolicy.com/live/8f124563-97fc-43fa-bf37-7a82ba153ea3');
  };

  const onSubmit = async (_data: SignUpSchemaType) => {
    if (_data.password === _data.confirmpassword) {
      setLoading(true);
      if (isChecked === false) {
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={String(id)} variant="accent" action="warning">
                <ToastTitle>Accept the Terms of Service and Privacy Policy to continue.</ToastTitle>
              </Toast>
            );
          },
        });
      }
      else {
        const response = await userRegister(_data.email, _data.password, _data.employeeId);
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={String(id)} variant="accent" action={response === 'Successful login!' ? 'success' : 'error'}>
                <ToastTitle>{response === "Invalid email" ? "User Already Exists" : response}</ToastTitle>
              </Toast>
            );
          }
        });
      }
      setLoading(false);
    } else {
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={String(id)} variant="accent" action="error">
              <ToastTitle>Passwords do not match</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
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

  return (
    <>
      <VStack justifyContent="space-between">
        <FormControl
          isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
          isRequired={true}
        >
          <FormControlLabel mb="$1">
            <FormControlLabelText fontWeight="$normal">Deloitte Email Address</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="email"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({ email: value });
                  return true;
                } catch (error) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input backgroundColor="#f2f2f2" borderRadius="$md" borderColor="#f2f2f2" h={hp('6%')}>
                <InputField
                  placeholder="Email"
                  fontSize={wp('4%')}
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={(!!errors.employeeId || isEmployeeIdFocused) && !!errors.employeeId}
          isRequired={true}
          mt="$4"
        >
          <FormControlLabel mb="$1">
            <FormControlLabelText fontWeight="$normal">Employee ID</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="employeeId"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({ employeeId: value });
                  return true;
                } catch (error) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input backgroundColor="#f2f2f2" borderRadius="$md" borderColor="#f2f2f2" h={hp('6%')}>
                <InputField
                  placeholder="Employee ID"
                  fontSize={wp('4%')}
                  type="number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.employeeId?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!errors.password} isRequired={true} mt="$4">
          <FormControlLabel mb="$1">
            <FormControlLabelText fontWeight="$normal">Password</FormControlLabelText>
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
              <Input backgroundColor="#f2f2f2" borderRadius="$md" borderColor="#f2f2f2" h={hp('6%')}>
                <InputField
                  fontSize={wp('4%')}
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  type={showPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleState} pr="$3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} size="md" />
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
            <FormControlLabelText fontWeight="$normal">Confirm Password</FormControlLabelText>
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
              <Input backgroundColor="#f2f2f2" borderRadius="$md" borderColor="#f2f2f2" h={hp('6%')}>
                <InputField
                  placeholder="Confirm Password"
                  fontSize={wp('4%')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleConfirmPwState} pr="$3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} size="md" />
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
      </VStack>

      <View flexDirection='row' my="$2" alignItems='center'>
        <Checkbox
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? 'yellowgreen' : undefined}
        />
        <Text fontSize={15} color='$black'> I accept the</Text><Text fontSize={15} color='yellowgreen' underline onPress={handlePressPrivacy}> Terms of Service</Text><Text fontSize={15} color='$black'> and</Text><Text fontSize={15} color='yellowgreen' underline onPress={handlePressPrivacy}> Privacy Policy</Text>
      </View>

      {loading ? (
        <GradientButton
          onPress={handleSubmit(onSubmit)}
          text="Verifying..."
        />
      ) : (
        <GradientButton
          onPress={handleSubmit(onSubmit)}
          text="Signup"
        />
      )}
    </>
  );
};

function SignUpFormComponent() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 2,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <Box
        sx={{
          '@md': {
            display: 'none',
          },
        }}
      >
      </Box>
      <Box
        px="$4"
        sx={{
          '@md': {
            px: '$8',
            borderTopLeftRadius: '$none',
            borderTopRightRadius: '$none',
            borderBottomRightRadius: '$none',
          },
          '_dark': { bg: '$backgroundDark800' },
        }}
        py="$4"
        flex={1}
        bg="$backgroundLight0"
        justifyContent="space-between"
      >
        <VStack mb="$5" space="md" mt="$16">
          <HStack alignItems="center" justifyContent="center">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Image
                alt="Occupi Logo"
                source={Logo}
                style={{ width: wp('30%'), height: wp('30%') }}
              />
            </Animated.View>
          </HStack>
          <VStack space="xs" mb="$2">
            <Heading
              color="$textLight800"
              sx={{ _dark: { color: '$textDark800' } }}
              size="xl"
            >
              Register for Occupi.
            </Heading>
            <Text color="$black"
              fontSize={wp('6%')}
              fontWeight="$100"
              sx={{ _dark: { color: '$textDark800' } }}>
              Predict. Plan. Perfect.
            </Text>
          </VStack>
        </VStack>

        <SignUpForm />
        <HStack
          space="xs"
          alignItems="center"
          justifyContent="center"
          my={12}
        >
          <Text
            color="$textLight500"
            sx={{
              _dark: {
                color: '$textDark400',
              },
            }}
            fontSize={wp('4%')}
          >
            Have an account?
          </Text>

          <StyledExpoRouterLink replace href="/login">
            <LinkText color="yellowgreen" fontSize={wp('4%')}>Login</LinkText>
          </StyledExpoRouterLink>
        </HStack>
      </Box>
    </>
  );
}

export default function SignUp() {
  return (
    // <ScrollView>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView flex={1} pt="$20" backgroundColor='white'>
        <Box
          sx={{
            '@md': {
              display: 'flex',
            },
          }}
          flex={1}
          display="none"
        >
          {/* <SideContainerWeb /> */}
        </Box>
        <Box flex={1}>
          <SignUpFormComponent />
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
    // </ScrollView>
  );
}
