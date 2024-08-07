import React, { useState } from 'react';
import Logo from '../../screens/Login/assets/images/Occupi/file.png';
import {
  Checkbox,
  Image,
  HStack,
  VStack,
  Text,
  Link,
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
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckIcon,
  Heading,
  InputField,
  InputSlot,
  FormControlLabel,
  FormControlLabelText,
  View
} from '@gluestack-ui/themed';
import GradientButton from '@/components/GradientButton';
import { Controller, useForm } from 'react-hook-form';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
// import { FacebookIcon, GoogleIcon } from './assets/Icons/Social';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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

  const onSubmit = async (_data: SignUpSchemaType) => {
    if (_data.password === _data.confirmpassword) {
      setLoading(true);
      try {
        const response = await fetch('https://dev.occupi.tech/auth/register', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: _data.email,
            password: _data.password
          }),
          credentials: "include"
        });
        const data = await response.json();
        if (response.ok) {
          setLoading(false);
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
          router.push({pathname:'/verify-otp', params: { email: _data.email}});
        } else {
          setLoading(false);
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={String(id)} variant="accent" action="error">
                  <ToastTitle>{data.error.message}</ToastTitle>
                </Toast>
              );
            },
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false)
    } else {
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={String(id)} action="error">
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
    <KeyboardAvoidingView>
      <VStack justifyContent="space-between">
        <FormControl
          isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
          isRequired={true}
        >
          <FormControlLabel mb="$1">
            <FormControlLabelText fontWeight="$normal">Deloitte Email Addss</FormControlLabelText>
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
    </KeyboardAvoidingView>
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
          mb="$8"
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

          <StyledExpoRouterLink replace href="/login">
            <LinkText color="yellowgreen" fontSize="$sm">Login</LinkText>
          </StyledExpoRouterLink>
        </HStack>
      </Box>
    </>
  );
}

export default function SignUp() {
  return (
    <ScrollView>
    <View pt="$12" backgroundColor='white'>
      <Box
        sx={{
          '@md': {
            display: 'flex',
          },
        }}
        display="none"
      >
        {/* <SideContainerWeb /> */}
      </Box>
      <Box flex={1}>
        <SignUpFormComponent />
      </Box>
    </View>
    {/* // </ScrollView> */}
  );
}
