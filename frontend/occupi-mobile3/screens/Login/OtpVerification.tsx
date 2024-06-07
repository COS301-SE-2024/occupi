import React, { useRef, useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { VStack, Box, HStack, Image, FormControl, Input, Button, Heading } from '@gluestack-ui/themed';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams  } from 'expo-router';
import * as MailComposer from 'expo-mail-composer';
import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';
import GuestLayout from '../../layouts/GuestLayout';
import Logo from '../Login/assets/images/Occupi/file.png';
import StyledExpoRouterLink from '@/components/StyledExpoRouterLink';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const OTPSchema = z.object({
  OTP: z.string().min(6, 'OTP must be at least 6 characters in length'),
});

type OTPSchemaType = z.infer<typeof OTPSchema>;

const OTPVerification = () => {
  const email = useLocalSearchParams();
  const [remainingTime, setRemainingTime] = useState(60); // 1 minute
  const [otpSent, setOtpSent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  // console.log(email);

  useEffect(() => {
    if (remainingTime > 0 && otpSent) {
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

  const generateOtp = async (): Promise<string> => {
    const randomBytes = await Random.getRandomBytesAsync(6);
    const otp = Array.from(randomBytes).map(byte => byte % 10).join('');
    return otp;
  };

  const sendOtp = async () => {
    const generatedOtp = await generateOtp();
    setRemainingTime(60);
    setOtpSent(true);

    await SecureStore.setItemAsync('user_otp', generatedOtp);

    // Send the OTP via email (example using Expo MailComposer)
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [email],
        subject: 'Your OTP Code',
        body: `Your OTP code is ${generatedOtp}`,
      });
    } else {
      Alert.alert('MailComposer is not available');
    }
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
  });

  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const firstInput = useRef<HTMLInputElement>(null);
  const secondInput = useRef<HTMLInputElement>(null);
  const thirdInput = useRef<HTMLInputElement>(null);
  const fourthInput = useRef<HTMLInputElement>(null);
  const fifthInput = useRef<HTMLInputElement>(null);
  const sixthInput = useRef<HTMLInputElement>(null);

  const refList = [
    firstInput,
    secondInput,
    thirdInput,
    fourthInput,
    fifthInput,
    sixthInput,
  ];

  const [inputFocus, setInputFocus] = useState<number>(-1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onSubmit = async (_data: OTPSchemaType) => {
    const pinValues = refList.map((ref) => ref?.current?.value);
    const pin = pinValues.join('');
    const Count = otpInput.filter((value) => value !== '').length;
    if (Count < 6) {
      setValidationError('OTP must be at least 6 characters in length');
      return;
    }
    setValidationError(null);

    // const storedOtp = await SecureStore.getItemAsync('user_otp');
    // if (pin === storedOtp) {
    //   Alert.alert('Signup successful');
    //   reset();
    //   router.push('/login');
    // } else {
    //   Alert.alert('Invalid OTP');
    // }

  };

  useEffect(() => {
    // Automatically send OTP when component mounts
    sendOtp();
  }, []);

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
    // <GuestLayout>
      // <Box
      //   sx={{
      //     '@md': {
      //       display: 'none',
      //     },
      //   }}
      //   display="flex"
      // ></Box>
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
        <MainText email={email} />
        <VStack space="md" mt="$6">
          <FormControl>
            <PinInput
              refList={refList}
              setInputFocus={setInputFocus}
              focusedIndex={inputFocus}
              otpInput={otpInput}
              setOtpInput={setOtpInput}
            />
            {validationError && (
              <Text fontSize="$sm" color="$error700">
                {validationError}
              </Text>
            )}
            {errors?.OTP && (
              <Text fontSize="$sm" color="$error700">
                {errors.OTP.message}
              </Text>
            )}
          </FormControl>
          <Text fontSize="$md" mb="$40">{remainingTime} seconds remaining</Text>
          <GradientButton onPress={handleSubmit(onSubmit)} text="Verify" />
          <GradientButton onPress={sendOtp} text="Resend OTP" />
        </VStack>
        <AccountLink />
      </Box>
    // </GuestLayout>
  );
};

interface PinInputProps {
  refList: React.RefObject<HTMLInputElement>[];
  setInputFocus: React.Dispatch<React.SetStateAction<number>>;
  focusedIndex: number;
  setOtpInput: (otpInput: Array<string>) => void;
  otpInput: any;
}

function PinInput({
  refList,
  setInputFocus,
  focusedIndex,
  setOtpInput,
  otpInput,
}: PinInputProps) {
  return (
    <HStack>
      {Array.from({ length: 6 }, (_, index) => (
        <Input
          ml="$2"
          key={index}
          // variant="outline"
          w={wp('12%')}
          h={hp('6%')}
          mt="$5"
          backgroundColor="#f2f2f2"
          borderColor="#f2f2f2"
          borderRadius="$2xl"
        >
          <Input
            ref={refList[index]}
            placeholder=""
            bg="#f2f2f2"
            sx={{
              '@md': {
                w: '$1/5',
              },
              '@lg': {
                w: '$25/2',
              },
              '_dark': {
                bgColor: '$backgroundDark400',
              },
            }}
            textAlign="center"
            maxLength={1}
            onChangeText={(text) => {
              if (text.length === 1 && index < 5) {
                refList[index + 1].current?.focus();
                setInputFocus(index + 1);
              } else if (text.length === 0 && index > 0) {
                refList[index - 1].current?.focus();
              }

              const updateOtpAtIndex = (index: number, value: string) => {
                const newOtpInput = [...otpInput];
                newOtpInput[index] = value;
                setOtpInput(newOtpInput);
              };
              updateOtpAtIndex(index, text);
            }}
          />
        </Input>
      ))}
    </HStack>
  );
}

function MainText({ email }: { email: string }) {

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
            fontWeight="$bold"
            color="$black"
            sx={{
              _dark: {
                color: '$textDark400',
              },
            }}
            fontSize={wp('5%')}
            fontWeight="$light"
          >
            {' ' + email}
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
      alignItems="$center"
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
});

export default OTPVerification;
