import React, { useState, useRef } from 'react';
import Logo from '../../screens/Login/assets/images/Occupi/file.png';
import {
  Button,
  Checkbox,
  Image,
  HStack,
  VStack,
  Text,
  View,
  Link,
  Divider,
  Icon,
  Center,
  FormControl,
  Box,
  LinkText,
  Input,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  InputIcon,
  FormControlHelper,
  Toast,
  ToastTitle,
  useToast,
  ButtonIcon,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckIcon,
  ButtonText,
  Heading,
  ArrowLeftIcon,
  InputField,
  InputSlot,
  FormControlLabel,
  FormControlLabelText,
} from '@gluestack-ui/themed';

import { Controller, useForm } from 'react-hook-form';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Keyboard, StyleSheet, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FacebookIcon, GoogleIcon } from './assets/Icons/Social';
import GuestLayout from '../../layouts/GuestLayout';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { router } from 'expo-router';
import { styled } from '@gluestack-style/react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const StyledImage = styled(Image, {
  props: {
    style: {
      height: wp('10%'),
      width: wp('80%'),
    },
  },
});
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
  rememberme: z.boolean().optional(),
  employeeId: z.string().min(1, 'Employee ID is required').regex(/^\d+$/, 'Employee ID must be numerical'),
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;

function SideContainerWeb() {
  return (
    <Center
      bg="$primary500"
      flex={1}
      sx={{
        _dark: {
          bg: '$primary500',
        },
      }}
    >
      <StyledImage
        h="$10"
        w="$80"
        alt="gluestack-ui Pro"
        resizeMode="contain"
        // source={require('./assets/images/gluestackUiProLogo_web_light.svg')}
      />
    </Center>
  );
}

const SignUpForm = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  });
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [pwMatched, setPwMatched] = useState(false);
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  const onSubmit = async (_data: SignUpSchemaType) => {
    if (_data.password === _data.confirmpassword) {
      setPwMatched(true);
      setLoading(true)
      // setTimeout(() => {
      //   setLoading(false);
      //   if (_data.email !== 'sabrina@deloitte.co.za') {
      //     toast.show({
      //       placement: 'top',
      //       render: ({ id }) => {
      //         return (
      //           <Toast nativeID={id} variant="accent" action="error">
      //             <ToastTitle>Deloitte email verification failed.</ToastTitle>
      //           </Toast>
      //         );
      //       },
      //     });
      //     reset();
      //   } else {
      //     toast.show({
      //       placement: 'top',
      //       render: ({ id }) => {
      //         return (
      //           <Toast nativeID={id} variant="accent" action="success">
      //             <ToastTitle>Verification successful</ToastTitle>
      //           </Toast>
      //         );
      //       },
      //     });
      //     reset();
      //     router.push('/verify-otp')
      //   }
      // }, 3000);

      try {
        const response = await fetch('https://192.168.137.:8080/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: "example",
            password: "12345"
          })
        });

        const data = await response.json();

        if (response.ok) {
          Alert.alert('Success', 'User registered successfully!');
        } else {
          Alert.alert('Error', data.message || 'Something went wrong!');
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }   
    } else {
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="error">
              <ToastTitle>Passwords do not match</ToastTitle>
            </Toast>
          );
        },
      });
    }
    // Implement your own onSubmit and navigation logic here.
    // Navigate to appropriate location
    // router.replace('/verify-otp');
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

  const GradientButton = ({ onPress, text }) => (
    <LinearGradient
      colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
      locations={[0.02, 0.31, 0.67, 0.97]}
      start={[0, 1]}
      end={[1, 0]}
      style={styles.buttonContainer}
    >
      <Heading style={styles.buttonText} onPress={onPress}>
        {text}
      </Heading>
    </LinearGradient>
  );

  const styles = StyleSheet.create({
    buttonContainer: {
      borderRadius: 15,
      marginTop: hp('2%'),
      alignSelf: 'center',
      width: wp('90%'),
      height: hp('6%'),
    },
    buttonText: {
      color: 'black',
      fontSize: wp('4%'),
      textAlign: 'center',
      lineHeight: hp('6%'),
    }
  });

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
              <Input backgroundColor="#f2f2f2" borderRadius="$15" borderColor="#f2f2f2" h={hp('6%')}>
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
              <Input backgroundColor="#f2f2f2" borderRadius="$15" borderColor="#f2f2f2" h={hp('6%')}>
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
                } catch (error  ) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input backgroundColor="#f2f2f2" borderRadius="$15" borderColor="#f2f2f2" h={hp('6%')}>
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
              <Input backgroundColor="#f2f2f2" borderRadius="$15" borderColor="#f2f2f2" h={hp('6%')}>
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
      </VStack>
      <Controller
        name="rememberme"
        defaultValue={false}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Checkbox
            aria-label="termsofuse"
            size="sm"
            value="privacy"
            isChecked={value}
            onChange={onChange}
            alignSelf="flex-start"
            mt="$2"
            mb="$12"
          >
            <CheckboxIndicator mr="$2">
              <CheckboxIcon color="yellowgreen" as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel
              sx={{
                _text: {
                  fontSize: '$sm',
                },
              }}
            >
              I accept the{' '}
              <Link>
                <LinkText
                  sx={{
                    _ios: {
                      marginTop: '$0.5',
                    },
                    _android: {
                      marginTop: '$0.5',
                    },
                  }}
                  color="yellowgreen"
                >
                  Terms of Use
                </LinkText>
              </Link>{' '}
              <Link>
                <LinkText
                  sx={{
                    _ios: {
                      marginTop: '$0.5',
                    },
                    _android: {
                      marginTop: '$0.5',
                    },
                  }}
                  color="yellowgreen"
                >
                  Privacy Policy
                </LinkText>
              </Link>
            </CheckboxLabel>
          </Checkbox>
        )}
      />


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
        <VStack mb="$5" space="md">

          <HStack alignItems="center" justifyContent="center">
            <Image
              alt="Occupi Logo"
              source={Logo}
              style={{ width: wp('30%'), height: wp('30%') }}
            />
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
          mt="$5"
        >
          <Text
            color="$textLight500"
            sx={{
              _dark: {
                color: '$textDark400',
              },
            }}
            fontSize="$sm"
          >
            Have an account?
          </Text>

          <StyledExpoRouterLink href="/login">
            <LinkText color="yellowgreen" fontSize="$sm">Login</LinkText>
          </StyledExpoRouterLink>
        </HStack>
      </Box>
    </>
  );
}

export default function SignUp() {
  return (
    <GuestLayout>
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
    </GuestLayout>
  );
}
