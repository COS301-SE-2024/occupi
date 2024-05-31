import React, { useState } from 'react';
import { LinearGradient } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
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

  return (
    <>
      <VStack justifyContent="space-between" >
        <FormControl
          isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
          isRequired={true}
        >
          <FormControlLabel mb="$1">
            <FormControlLabelText>Email</FormControlLabelText>
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
              <Input mt="$5" backgroundColor="#f2f2f2" borderRadius="$full">
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

        <FormControl my="$6" isInvalid={!!errors.password} isRequired={true}>
          <FormControlLabel mb="$1">
            <FormControlLabelText>Password</FormControlLabelText>
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
              <Input mt="$5" backgroundColor="#f2f2f2" borderRadius="$full">
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
        mt="$4"
        justifyContent="space-between"
        space="$4"
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
              <CheckboxLabel mr="$2">Remember me</CheckboxLabel>
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
            </Checkbox>
          )}
        />

        <StyledExpoRouterLink href="/forgot-password">
          <LinkText color="cyan" fontSize="$sm">
            Forgot Password?
          </LinkText>
        </StyledExpoRouterLink>
      </HStack>

      <Button
        variant="solid"
        size="lg"
        mt="$12"
        onPress={handleSubmit(onSubmit)}
        borderRadius="$full"
        bg="cyan"
      >
        {/* <ButtonText color="white" fontSize="sm">Login</ButtonText> Adjust color value */}
      </Button>

    </>
  );
};

function SideContainerWeb() {
  return (
    <Center
      flex={1}
      bg="$primary500"
      sx={{
        _dark: { bg: '$primary500' },
      }}
    >
      <StyledImage
        w="$80"
        h="$10"
        alt="gluestack-ui Pro"
        resizeMode="contain"
        source={require('./assets/images/gluestackUiProLogo_web_light.svg')}
      />
    </Center>
  );
}

const Main = () => {
  return (
    <>
      {/* will remove later */}
      <StyledExpoRouterLink bg="$backgroundLight0" href="..">
        <Icon
          as={ChevronLeftIcon}
          color="$textLight800"
          m="$0" w="$10" h="$16"
          sx={{ _dark: { color: '$textDark800' } }}
        />
      </StyledExpoRouterLink>


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
        <VStack px="$3" mt="$2" space="md">

          <HStack space="md" alignItems="center" justifyContent="center">
            <Image
              alt="Occupi Logo"
              source={Logo}
              style={{ width: 150, height: 150 }}
            />
          </HStack>
          <VStack space="xs" mt="$4" ml="$1" my="$5">
            <Heading
              color="$textLight800"
              sx={{ _dark: { color: '$textDark800' } }}
              size="xl"
            >
              Welcome back to Occupi.
            </Heading>
            <Text color="$textLight400"
              size="xl"
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
          mt="auto"
        >
          <Text
            color="$textLight500"
            fontSize="$sm"
            sx={{ _dark: { color: '$textDark400' } }}
          >
            New to Occupi?
          </Text>
          <StyledExpoRouterLink href="/signup">
            <LinkText color="cyan" fontSize="$sm">Register</LinkText>
          </StyledExpoRouterLink>
        </HStack>
      </Box>
    </>
  );
};

const SignIn = () => {
  return (
    <GuestLayout>
      <Box display="none" sx={{ '@md': { display: 'flex' } }} flex={1}>
        <SideContainerWeb />
      </Box>
      <Main />
    </GuestLayout>
  );
};

export default SignIn;
