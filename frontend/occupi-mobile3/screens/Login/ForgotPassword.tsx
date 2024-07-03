import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Button,
  FormControl,
  HStack,
  Input,
  Text,
  VStack,
  useToast,
  Toast,
  Box,
  Icon,
  ToastTitle,
  InputField,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  ButtonText,
  Image,
  ChevronLeftIcon,
  Heading,
  Center,
  FormControlLabel,
  FormControlLabelText,
} from '@gluestack-ui/themed';
import GuestLayout from '../../layouts/GuestLayout';
import Logo from '../../screens/Login/assets/images/Occupi/file.png';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Keyboard, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AlertTriangle } from 'lucide-react-native';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { useNavigation } from '@react-navigation/native';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email(),
});
type SignUpSchemaType = z.infer<typeof forgotPasswordSchema>;

function SideContainerWeb() {
  return (
    <Center
      sx={{
        '@base': {
          _light: { bg: '$backgroundLight0' },
          _dark: { bg: '$backgroundDark800' },
        },
        '$md': {
          flex: 1,
          _light: { bg: '$primary500' },
          _dark: { bg: '$primary500' },
          py: '$48',
        },
      }}
    >
      <Image
        resizeMode="contain"
        w="$200"
        h="$40"
        source={require('./assets/images/forgotPassword_web_dark.png')}
        alt="Alternate Text"
      />
    </Center>
  );
}

function MobileScreenImage() {
  return (
    <Center
      px="$4"
      mb={-0.5}
      sx={{
        '@base': {
          _light: { bg: '$backgroundLight0' },
          _dark: { bg: '$backgroundDark800' },
        },
        '$md': {
          py: '$48',
          px: '$12',
          _light: { bg: '$primary500' },
          _dark: { bg: '$primary700' },
        },
      }}
    >
      <Image
        alt="logo"
        sx={{
          '@base': {
            _light: { display: 'flex' },
            _dark: { display: 'none' },
            mt: '$12',
          },
          '$md': {
            _light: { display: 'none' },
            _dark: { display: 'none' },
          },
        }}
        source={require('./assets/images/forgotPassword_mobile_light.png')}
        h="$40"
        w="$48"
        resizeMode="contain"
        alignSelf="center"
      />
      <Image
        alt="logo"
        sx={{
          '@base': {
            _light: { display: 'none' },
            _dark: { display: 'flex' },
          },
          '$md': { display: 'none' },
        }}
        source={require('./assets/images/forgotPassword_mobile_dark.png')}
        h="$40"
        w="$48"
        resizeMode="contain"
        alignSelf="center"
      />
    </Center>
  );
}

export default function ForgotPassword() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const toast = useToast();
  const navigation = useNavigation();

  const onSubmit = (data: SignUpSchemaType) => {
    toast.show({
      placement: 'bottom right',
      render: ({ id }) => {
        return (
          <Toast nativeID={id} variant="accent" action="success">
            <ToastTitle>OTP sent successfully </ToastTitle>
          </Toast>
        );
      },
    });
    reset();

    // Navigate to OTP Verification screen with email as a parameter
    navigation.navigate('verify-otp', { email: data.email });
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
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
    <GuestLayout>
      <StyledExpoRouterLink bg="$white" href="..">
        <Icon
          as={ChevronLeftIcon}
          color="$textLight800"
          m="$0" w="$10" h="$16"
          sx={{ _dark: { color: '$textDark800' } }}
        />
      </StyledExpoRouterLink>
      <VStack
        sx={{
          '$md': { flexDirection: 'row' },
          '_dark': { bg: '$backgroundDark900' },
        }}
        flex={1}
        bg="white"
      >
        <Box sx={{ '$md': { display: 'none' } }}>
          <HStack space="$md" alignItems="center" justifyContent="center">
            <Image
              alt="logo"
              source={Logo}
              style={{ width: 150, height: 150 }}
            />
          </HStack>
        </Box>
        <Box sx={{ '$md': { display: 'flex' } }} display="none" flex={1}>
          <SideContainerWeb />
        </Box>
        <Box
          maxWidth="$508"
          pt="$0"
          pb="$8"
          px="$4"
          bg="$backgroundLight0"
          flex={1}
          sx={{
            '$md': {
              pt: '$8',
              px: '$8',
            },
            '_dark': { bg: '$backgroundDark800' },
          }}
        >
          <VStack
            space="$md"
            alignItems="center"
            sx={{ '$md': { alignItems: 'flex-start' } }}
          >
            <Heading
              fontSize="$2xl"
              textAlign="$left"
              alignSelf="$left"
              my="$4"
              sx={{
                '$md': {
                  textAlign: '$left',
                  fontSize: '$2xl',
                },
              }}
            >
              Forgot Password?
            </Heading>
            <Text
              fontSize="$16"
              fontWeight="$light"
              textAlign="$left"
              sx={{
                '$md': {
                  textAlign: 'left',
                },
              }}
            >
              Not to worry! Enter email address associated with your account and
              we'll send a link to reset your password.
            </Text>
          </VStack>

          <FormControl
            my="$8"
            isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
            isRequired={true}
          >
            <FormControlLabel mb="$1">
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="email"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await forgotPasswordSchema.parseAsync({
                      email: value,
                    });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input mt="$1" backgroundColor="#f2f2f2" borderRadius="$12" borderColor="#f2f2f2" h="$12">
                  <InputField
                    fontSize={wp('4%')}
                    h={hp('5%')}
                    placeholder="Email"
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
              <FormControlErrorIcon as={AlertTriangle} size="$md" />
              <FormControlErrorText>
                {errors?.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <GradientButton
            onPress={handleSubmit(onSubmit)}
            text="Send OTP"
          />
        </Box>
      </VStack>
    </GuestLayout>
  );
}
