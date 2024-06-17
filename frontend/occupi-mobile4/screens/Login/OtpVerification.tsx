import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { VStack, Box, HStack, Image, Heading, Toast, useToast, ToastTitle, Text, } from '@gluestack-ui/themed';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams  } from 'expo-router';
import Logo from './assets/images/Occupi/file.png';
import StyledExpoRouterLink from '@/components/StyledExpoRouterLink';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';

const OTPSchema = z.object({
  OTP: z.string().min(6, 'OTP must be at least 6 characters in length'),
});

type OTPSchemaType = z.infer<typeof OTPSchema>;

const OTPVerification = () => {
  const emailParams = useLocalSearchParams();
  const email = emailParams.email ? String(emailParams.email) : '';
  // const email = 'kamo@gmail.com';
  const [remainingTime, setRemainingTime] = useState(60); // 1 minute
  const [otpSent, setOtpSent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  // console.log(email);

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

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
  });

  

  const onSubmit = async () => {
    console.log(email);
    const pin = otp.join('');
    const Count = otp.filter((value) => value !== '').length;
    if (Count < 6) {
      setValidationError('OTP must be at least 6 characters in length');
      return;
    }
    setValidationError(null);
    console.log(pin);
    setLoading(true);
    try {
      const response = await fetch('https://dev.occupi.tech/auth/verify-otp', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          otp: pin
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
                  <Toast nativeID={id} variant="accent" action="success">
                    <ToastTitle>{data.message}</ToastTitle>
                  </Toast>
                );
              },
            });
        router.push('/home');
      } else {
        setLoading(false);
        // console.log(data);
        toast.show({
              placement: 'top',
              render: ({ id }) => {
                return (
                  <Toast nativeID={id} variant="accent" action="error">
                    <ToastTitle>{data.message}</ToastTitle>
                  </Toast>
                );
              },
            });
      }
    } catch (error) {
      console.error('Error:', error);
      // setResponse('An error occurred');
    }
    // }, 3000);
    setLoading(false);
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

  return (
      <Box
        bg="$backgroundLight0"
        sx={{
          '@md': {
            p: '$8',
          },
          '_dark': {
            bg: '$backgroundDark800',
          },
        }}
        py="$8"
        px="$4"
        flex={1}
      >
        <MainText email={email}/>
        <VStack space="md">
        <OTPInput otp={otp} setOtp={setOtp}/>
        <Text>Entered OTP: {otp.join('')}</Text>
          <Text fontSize="$md">{remainingTime} seconds remaining</Text>
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

const MainText = (email : string) => {

  return (
    <VStack space="xs">
      <HStack space="md" alignItems="center" justifyContent="center" m="$12">
        <Image source={Logo} alt="occupi" style={{ width: wp('30%'), height: wp('30%') }} />
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
          mt="$2"
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
          We have sent the OTP code to
          <Text
            color="$black"
            sx={{
              _dark: {
                color: '$textDark400',
              },
            }}
            fontSize={wp('5%')}
            fontWeight="$light"
          >
            {' '+email}
          </Text>
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
      mt="auto"
      space="xs"
      alignItems="center"
      justifyContent="center"
    >
      <Text
        color="$textLight800"
        mt="$4"
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
        <Text style={{ color: '#7FFF00', fontSize: wp('4%') }}>
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
