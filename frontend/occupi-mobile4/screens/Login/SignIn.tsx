import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
// import CookieManager from '@react-native-cookies/cookies';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import {
  FormControl,
  HStack,
  Input,
  Text,
  VStack,
  useToast,
  Toast,
  Box,
  CheckIcon,
  Checkbox,
  ToastTitle,
  InputField,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  InputIcon,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  Image,
  Heading,
  LinkText,
  InputSlot,
  FormControlLabel,
  FormControlLabelText,
} from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Logo from '../../screens/Login/assets/images/Occupi/Occupi-gradient.png';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import GradientButton from '@/components/GradientButton';
import { UserLogin } from '@/utils/auth';

const signInSchema = z.object({
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
  rememberme: z.boolean().optional(),
});

type SignInSchemaType = z.infer<typeof signInSchema>;

const SignInForm = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
  });
  const isEmailFocused = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const toast = useToast();



  useEffect(() => {
    checkBiometricAvailability();
   
  }, []);

  const checkBiometricAvailability = async () => {
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
    setBiometricAvailable(isBiometricAvailable);
    // console.log('Biometric hardware available:', isBiometricAvailable);
  };

 
  const handleBiometricSignIn = async () => {
    const biometricType = await LocalAuthentication.supportedAuthenticationTypesAsync();
    console.log('Supported biometric types:', biometricType);

    if (biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) || biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Login with Biometrics',
          cancelLabel: 'Cancel',
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: false,
        });
        console.log('Biometric authentication result:', result);
        if (result.success) {
          // router.replace('/home');
        } else {
          console.log('Biometric authentication failed');
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={String(id)} variant="accent" action="error">
                  <ToastTitle>Biometric authentication failed</ToastTitle>
                  {result.error && <Text>{result.error.message}</Text>}
                </Toast>
              );
            },
          });
        }
      } catch (error) {
        console.error('Biometric authentication error:', error);
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={String(id)} variant="accent" action="error">
                <ToastTitle>Biometric authentication error</ToastTitle>
                <Text>{error.message}</Text>
              </Toast>
            );
          },
        });
      }
    } else {
      console.log('Biometric authentication not available');
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={String(id)} variant="accent" action="error">
              <ToastTitle>Biometric authentication not available</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const onSubmit = async (_data: SignInSchemaType) => {
    setLoading(true);
    const response = await UserLogin(_data.email, _data.password);
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <Toast nativeID={String(id)} variant="accent" action={response === 'Successful login!' ? 'success' : 'error'}>
            <ToastTitle>{response}</ToastTitle>
          </Toast>
        );
      }
    });
    setLoading(false);
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };


  return (
    <>
      <View style={{ alignItems: 'center', marginBottom: hp('2%') }}>
        {biometricAvailable && (
          <TouchableOpacity onPress={handleBiometricSignIn}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('2%') }}>
              <Ionicons name="finger-print" size={wp('6%')} color="black" />
            </View>
          </TouchableOpacity>
        )}
        <Text style={{ marginBottom: hp('2%'), fontSize: wp('4%') }}>Or</Text>
      </View>
      <VStack justifyContent="space-between">
        <FormControl
          isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
          isRequired={true}
        >
          <FormControlLabel>
            <FormControlLabelText fontWeight="$normal">Deloitte Email Address</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="email"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signInSchema.parseAsync({ email: value });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input backgroundColor="#f2f2f2" borderRadius="$md" borderColor="$#f2f2f2" h={hp('7%')}>
                <InputField
                  fontSize="$sm"
                  placeholder="john.doe@gmail.com"
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

        <FormControl mt={hp('2%')} isInvalid={!!errors.password} isRequired={true}>
          <FormControlLabel mb={hp('1%')}>
            <FormControlLabelText fontWeight="$normal">Password</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="password"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signInSchema.parseAsync({ password: value });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input mb={hp('1%')} backgroundColor="#f2f2f2" borderRadius="$md" borderColor="$#f2f2f2" h={hp('7%') }>
                <InputField
                  fontSize="$sm"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  type={showPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleState} pr="$5">
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
      </VStack>

      <HStack
        alignItems="center"
        justifyContent="space-between"
        space={wp('2%')}
        mb={hp('3%')}
      >
        <Controller
          name="rememberme"
          defaultValue={false}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Checkbox
              aria-label="Close"
              size="md"
              value="Remember me"
              isChecked={value}
              onChange={onChange}
            >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} color="yellowgreen" />
              </CheckboxIndicator>
              <CheckboxLabel ml={wp('2%')} color="yellowgreen">Remember me</CheckboxLabel>
            </Checkbox>
          )}
        />

        <StyledExpoRouterLink href="/forgot-password">
          <LinkText color="yellowgreen" fontSize="$md">
            Forgot Password?
          </LinkText>
        </StyledExpoRouterLink>
      </HStack>

      {loading ? (
        <GradientButton
          onPress={handleSubmit(onSubmit)}
          text="Verifying..."
        />
      ) : (
        <GradientButton
          onPress={handleSubmit(onSubmit)}
          text="Login"
        />
      )}
      {/* <PostRequestExample/> */}
    </>
  );
};

const Main = () => {
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
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Box
      px={wp('4%')}
      sx={{
        '@md': {
          px: wp('8%'),
          borderTopLeftRadius: '$none',
          borderTopRightRadius: '$none',
          borderBottomRightRadius: '$none',
        },
        '_dark': { bg: '$backgroundDark800' },
      }}
      py={hp('2%')}
      flex={1}
      bg="$white"
      justifyContent="$center"
    >
      <VStack mt={hp('2%')} mb={hp('2%')} space="md">
        <HStack space="md" alignItems="center" justifyContent="center">
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            alt="Occupi Logo"
            source={Logo}
            style={{ width: wp('40%'), height: wp('40%') }}
          />
           </Animated.View>
        </HStack>
        <VStack space="xs" mt={hp('2%')} my={hp('2%')}>
          <Heading
            color="$textLight800"
            sx={{ _dark: { color: '$textDark800' } }}
            size="xl"
          >
            Welcome back to Occupi.
          </Heading>
          <Text color="$black"
            fontSize={wp('5%')}
            fontWeight="$100"
            sx={{ _dark: { color: '$textDark800' } }}>
            Predict. Plan. Perfect.
          </Text>
        </VStack>
      </VStack>

      <SignInForm />

      <HStack
        space="xs"
        alignItems="center"
        justifyContent="center"
        mt={hp('2%')}
      >
        <Text
          color="$black"
          fontSize={wp('4%')}
          sx={{ _dark: { color: '$textDark400' } }}
        >
          New to Occupi?
        </Text>
        <StyledExpoRouterLink href="/signup">
          <LinkText color="yellowgreen" fontSize={wp('4%')}>Register</LinkText>
        </StyledExpoRouterLink>
      </HStack>
    </Box>
  );
};

const SignIn = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Main />
    </KeyboardAvoidingView>
  );
};

export default SignIn;
