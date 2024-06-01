import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Center,
  Button,
  FormControl,
  HStack,
  Input,
  Text,
  VStack,
  Link,
  useToast,
  Toast,
  Box,
  CheckIcon,
  Checkbox,
  Icon,
  ToastTitle,
  InputField,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  InputIcon,
  FormControlHelper,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  ButtonText,
  ButtonIcon,
  Image,
  Divider,
  ChevronLeftIcon,
  Heading,
  LinkText,
  InputSlot,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelperText,
} from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Keyboard } from 'react-native';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { FingerprintIcon } from 'lucide-react-native';

import { GoogleIcon, FacebookIcon } from './assets/Icons/Social';
import Logo from '../../screens/Login/assets/images/Occupi/file.png';
import GuestLayout from '../../layouts/GuestLayout';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';

import { styled } from '@gluestack-style/react';

const StyledImage = styled(Image, {
  props: {
    style: {
      height: 40,
      width: 320,
    },
  },
});

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
    reset,
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
  });
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const toast = useToast();

  const onSubmit = (_data: SignInSchemaType) => {
    toast.show({
      placement: 'bottom right',
      render: ({ id }) => {
        return (
          <Toast nativeID={id} variant="accent" action="success">
            <ToastTitle>Signed in successfully</ToastTitle>
          </Toast>
        );
      },
    });
    reset();
    // Implement your own onSubmit and navigation logic here.
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleState = () => {
    setShowPassword((showState) => {
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
      marginTop: 20,
      alignSelf: 'center',
      width: 360,
      height: 50
    },
    buttonText: {
      color: 'black',
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 50,
    }
  });

  return (
    <>
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
              <Input backgroundColor="#f2f2f2" borderRadius="$15" borderColor="$#f2f2f2" h="$12">
                <InputField
                  fontSize="$md"
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

        <FormControl mt="$6" isInvalid={!!errors.password} isRequired={true}>
          <FormControlLabel mb="$1">
            <FormControlLabelText  fontWeight="$normal">Password</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="password"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signInSchema.parseAsync({
                    password: value,
                  });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input backgroundColor="#f2f2f2" borderRadius="$15" borderColor="$#f2f2f2" h="$12">
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

          <FormControlHelper></FormControlHelper>
        </FormControl>
      </VStack>

      <HStack
        alignItems="center"
        justifyContent="space-between"
        space="$4"
        mb="$10"
      >
        <Controller
          name="rememberme"
          defaultValue={false}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Checkbox
              aria-label="Close"
              size="sm"
              value="Remember me"
              isChecked={value}
              onChange={onChange}
            >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} color="yellowgreen"/>
              </CheckboxIndicator>
              <CheckboxLabel ml="$2" color="yellowgreen">Remember me</CheckboxLabel>
            </Checkbox>
          )}
        />

        <StyledExpoRouterLink href="/forgot-password">
          <LinkText color="yellowgreen" fontSize="$sm">
            Forgot Password?
          </LinkText>
        </StyledExpoRouterLink>
      </HStack>

      <GradientButton
        onPress={handleSubmit(onSubmit)}
        text="Login"
      />
    </>
  );
};

const Main = () => {
  return (
    <>
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
        bg="$white"
        justifyContent="$center"
      >
        <VStack mt="$8"  mb="$5" space="md">

          <HStack space="md" alignItems="center" justifyContent="center">
            <Image
              alt="Occupi Logo"
              source={Logo}
              style={{ width: 150, height: 150 }}
            />
          </HStack>
          <VStack space="xs" mt="$10" my="$5">
            <Heading
              color="$textLight800"
              sx={{ _dark: { color: '$textDark800' } }}
              size="xl"
            >
              Welcome back to Occupi.
            </Heading>
            <Text color="$black"
              fontSize="$2xl"
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
          mt="$8"
        >
          <Text
            color="$black"
            fontSize="$sm"
            sx={{ _dark: { color: '$textDark400' } }}
          >
            New to Occupi?
          </Text>
          <StyledExpoRouterLink href="/signup">
            <LinkText color="yellowgreen" fontSize="$sm">Register</LinkText>
          </StyledExpoRouterLink>
        </HStack>
      </Box>
    </>
  );
};

const SignIn = () => {
  return (
    <>
      <Main />
    </>
      
  );
};

export default SignIn;
