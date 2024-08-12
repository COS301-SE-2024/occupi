import React, { useRef, useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
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
  Image,
  ChevronLeftIcon,
  Heading,
  Center,
  FormControlLabel,
  FormControlLabelText,
} from '@gluestack-ui/themed';
import GuestLayout from '../../layouts/GuestLayout';
import Logo from '../../screens/Login/assets/images/Occupi/Occupi-gradient.png';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Keyboard, StyleSheet, TextInput, Animated, Easing } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AlertTriangle } from 'lucide-react-native';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { useNavigation } from '@react-navigation/native';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email(),
});
type SignUpSchemaType = z.infer<typeof forgotPasswordSchema>;



export default function ForgotPassword() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

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
    <View pt="$10" flex="$1" backgroundColor='white'>
      <StyledExpoRouterLink href="/login">
        <Icon
          as={ChevronLeftIcon}
          color="$textLight800"
          m="$0" w="$10" h="$16"
          sx={{ _dark: { color: '$textDark800' } }}
        />
      </StyledExpoRouterLink>
        <Box>
          <HStack space="$md" alignItems="center" justifyContent="center">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Image
                alt="logo"
                source={Logo}
                style={{ width: 150, height: 150 }}
              />
            </Animated.View>
          </HStack>
        </Box>
        <Box sx={{ '$md': { display: 'flex' } }} display="none" flex={1}>

        </Box>
          <View
            space="md"
            alignItems="center"
            px="$4"
          >
            <Heading
              fontSize="$2xl"
              textAlign="left"
              alignSelf="left"
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
          </View>

          <FormControl
            my={24}
            isInvalid={(!!errors.email) && !!errors.email}
            isRequired={true}
            px="$4"
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
    </View>
  );
}
