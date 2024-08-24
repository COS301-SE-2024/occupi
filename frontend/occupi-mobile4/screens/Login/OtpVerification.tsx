import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput,Animated, Easing } from 'react-native';
import { VStack, Box, HStack, Image, Heading, Toast, useToast, ToastTitle, Text, } from '@gluestack-ui/themed';
// import { useForm } from 'react-hook-form';
import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import Logo from '../../screens/Login/assets/images/Occupi/Occupi-gradient.png';
import StyledExpoRouterLink from '@/components/StyledExpoRouterLink';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { VerifyUserOtpLogin, verifyUserOtpRegister } from '@/utils/auth';

const OTPSchema = z.object({
  OTP: z.string().min(6, 'OTP must be at least 6 characters in length'),
});

type OTPSchemaType = z.infer<typeof OTPSchema>;

const OTPVerification = () => {
  const [email, setEmail] = useState("");
  // const email = 'kamo@gmail.com';
  const [remainingTime, setRemainingTime] = useState(10); // 1 minute
  const otpSent = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [state, setState] = useState();

  useEffect(() => {
    if (remainingTime > 0 && !otpSent) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (remainingTime === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [remainingTime, otpSent]);

  useEffect(() => {
    const getUserEmail = async () => {
      let email = await SecureStore.getItemAsync('Email');
      const state = await SecureStore.getItemAsync('AppState');
      setState(state);
      setEmail(email);
    };
    getUserEmail();
  }, []);

  // console.log("here",email);

  const onSubmit = async () => {
    console.log(email);
    const pin = otp.join('');
    // const Count = otp.filter((value) => value !== '').length;
    // if (Count < 6) {
    //   setValidationError('OTP must be at least 6 characters in length');
    //   return;
    // }
    // setValidationError(null);
    setLoading(true);
    console.log(state);
    if (state === 'verify_otp_register') {
      const response = await verifyUserOtpRegister(email, pin);
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={String(id)} variant="accent" action={response === 'Successful login!' ? 'success' : 'error'}>
              <ToastTitle>Registration Successful</ToastTitle>
            </Toast>
          );
        }
      });
    }
    else {
      const response = await VerifyUserOtpLogin(email, pin);
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
    }
    setLoading(false);
  };

  const GradientButton = ({ onPress, text }) => (
    <LinearGradient
      colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
      locations={[0.02, 0.31, 0.67, 0.97]}
      start={[0, 1]}
      end={[1, 0]}
      style={{ 
        ...styles.buttonContainer, 
        marginTop: 16, 
      }}
    >
      <Heading style={styles.buttonText} onPress={onPress}>
        {text}
      </Heading>
    </LinearGradient>
  );

  return (
    <Box
      bg="$backgroundLight0"
      sx={{
        '@md': {
          p: '$5',
        },
        '_dark': {
          bg: '$backgroundDark800',
        },
      }}
      py="$8"
      px="$4"
      flex={1}
       mt="$4"
          mb="$4"
    >
      <MainText email={email} />
      <VStack >
        <OTPInput otp={otp} setOtp={setOtp} />
        <HStack justifyContent="space-between" width="100%">
          <Text>Entered OTP: {otp.join('')}</Text>
          {/* <Text fontSize="$sm">{remainingTime} minutes remaining</Text> */}
        </HStack>
        {loading ? (
          <GradientButton
            onPress={onSubmit}
            text="Verifying OTP..."
          />
        ) : (
          <GradientButton
            onPress={onSubmit}
            text="Verify"
          />
        )}
        <GradientButton text="Resend OTP" />
      </VStack>
      <AccountLink />
    </Box>
  );
};

const MainText = (email) => {
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
    <VStack space="xs">
      <HStack space="md" alignItems="center" justifyContent="center" m="$12">
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Image source={Logo} alt="occupi" style={{ width: wp('30%'), height: wp('30%') }} />
        </Animated.View>
      </HStack>
      <Heading
        fontSize={wp('8%')}
        fontWeight="$bold"
        color="black"
        sx={{
          '@md': { fontSize: wp('8%'), pb: '$4' },
        }}
      >
        We sent you an email code
      </Heading>
      <HStack space="sm" alignItems="center">
        <Text
          color="$black"
          mt="$4"
          mb="$4"
          sx={{
            '@md': {
              pb: '$12',
            },
            '_dark': {
              color: '$textDark400',
            },
          }}
          fontSize={wp('5%')}
          fontWeight="$light"
        >
          We have sent the OTP code to <Text fontWeight="bold">{email.email}</Text>
        </Text>
      </HStack>
    </VStack>
  );
}

function AccountLink() {
  return (
    <HStack
      sx={{
        '@md': {
          mt: '$40',
        },
      }}
      mt="$5"
      alignItems="center"
      justifyContent="center"
    >
      <Text
        color="$textLight800"
        
        sx={{
          _dark: {
            color: '$textDark400',
          },
        }}
        fontSize={wp('4%')}
      >
        Already have an account?
      </Text>
      <StyledExpoRouterLink href="/login">
        <Text style={{ color: '#7FFF00', fontSize: wp('4%') }} >
          Login
        </Text>
      </StyledExpoRouterLink>
    </HStack>
  );
}

const OTPInput = ({ otp, setOtp }) => {
  const inputRefs = useRef([]);

  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    } else if (index === 5) {
      inputRefs.current[index].blur(); // Dismiss the keyboard after entering the 6th digit
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          style={styles.input}
          keyboardType="numeric"
          maxLength={1}
          ref={(ref) => inputRefs.current[index] = ref}
        // autoFocus={index === inputRefs.current[index]} // Auto focus the first input on mount
        />
      ))}
    </View>
  );
};

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
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default OTPVerification;
