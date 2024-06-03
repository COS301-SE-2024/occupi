import React, { useRef, useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  VStack,
  Box,
  HStack,
  Text,
  Button,
  Image,
  Center,
  FormControl,
  Input,
  LinkText,
  FormControlHelperText,
  InputField,
  ButtonText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  Toast,
  ToastTitle,
  useToast,
  Heading,
} from '@gluestack-ui/themed';
import Logo from './assets/images/Occupi/file.png';
import { Alert, StyleSheet } from 'react-native';
import GuestLayout from '../../layouts/GuestLayout';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { router, useLocalSearchParams } from 'expo-router';
import * as MailComposer from 'expo-mail-composer';
import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';

const OTPSchema = z.object({
  OTP: z.string().min(6, 'OTP must be at least 6 characters in length'),
});

type OTPSchemaType = z.infer<typeof OTPSchema>;

const OTPVerification = () => {
  const [email, setemail] = useState('sabrina@deloitte.co.za');

  const [otp, setOtp] = useState('');
  // const [otpSent, setOtpSent] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60); // 1 minute

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
  
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(remainingTime-1);
      }, 1000);
    }
  
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [remainingTime]);

  const generateOtp = async (): Promise<string> => {
    const randomBytes = await Random.getRandomBytesAsync(3);
    const otp = Array.from(randomBytes).map(byte => byte % 10).join('');
    return otp;
  };



  // Dummy data for registered emails
  const registeredEmails = ['example@example.com', 'test@test.com'];

  const checkIfEmailIsRegistered = async (email: string): Promise<boolean> => {
    // Simulating an API call or database query
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if the email exists in the registeredEmails array
        const isRegistered = registeredEmails.includes(email);
        resolve(isRegistered);
      }, 1000); // Simulating a 1-second delay for demonstration purposes
    });
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
  const [validationError, setValidationError] = useState<string | null>(null); // State to hold validation error message

  const toast = useToast();

  const onSubmit = async (_data: OTPSchemaType) => {
    console.log('here');
    const pinValues = refList.map((ref) => ref?.current?.value);
    const pin = pinValues.join('');
    const Count = otpInput.filter((value) => value !== '').length;
    if (Count < 6) {
      setValidationError('OTP must be at least 6 characters in length');
      return;
    }
    setValidationError(null);
    console.log('here');

    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={id} variant="accent" action="success">
          <ToastTitle>Signup successful</ToastTitle>
        </Toast>
      ),
    });
    reset();
    console.log('here');
    router.push('/login');
  };

  // const handleverify = async () => {
  //   router.push('/home');
  // }

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
    <GuestLayout>
      <Box
        sx={{
          '@md': {
            display: 'none',
          },
        }}
        display="flex"
      ></Box>
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
        maxWidth={508}
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
            {/* <FormControlHelperText mt="$8">
              <ResendLink sendOtp={sendOtp} />
            </FormControlHelperText> */}

            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} size="md" />
              <FormControlErrorText>
                {errors?.OTP?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <Text fontSize="$md" mb="$40">{remainingTime} seconds remaining</Text>
            <GradientButton
              onPress={onSubmit}
              text="Verify"
            />
        </VStack>
        <AccountLink />
      </Box>
    </GuestLayout>
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
          variant="outline"
          w={50}
          h={50}
          mt="$5"
          backgroundColor="#f2f2f2"
          borderColor="#f2f2f2"
          borderRadius="$2xl"
        >
          <InputField
            //@ts-ignore
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
            w={100/2}
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
  const obfuscatedEmail = email.replace(/(.{2})(.*)(?=@)/,
    (gp1, gp2, gp3) => {
      for (let i = 0; i < gp3.length; i++) {
        gp2 += '*';
      } return gp2;
    });

  return (
    <VStack space="xs">
      <HStack space="md" alignItems="center" justifyContent="center" m="$12">
        <Image source={Logo} alt="occupi" style={{ width: 110, height: 110 }} />
      </HStack>
      <Heading
        fontSize="$2xl"
        fontWeight="$bold"
        color="black"
        sx={{
          '@md': { fontSize: '$2xl', pb: '$4' },
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
          fontSize="$20"
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
            fontSize="$20"
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
        fontSize="$sm"
      >
        Already have an account?
      </Text>
      <StyledExpoRouterLink href="/login"  mt="$4">
        <LinkText color="#7FFF00" fontSize="$sm">
          Login
        </LinkText>
      </StyledExpoRouterLink>
    </HStack>
  );
}

// interface ResendLinkProps {
//   sendOtp: () => void;
// }

// function ResendLink({ sendOtp }: ResendLinkProps) {
//   return (
//     <HStack py="$8" mt="$5">
//       <Text
//         color="$textLight800"
//         sx={{
//           _dark: {
//             color: '$textDark400',
//           },
//         }}
//         fontSize="$sm"
//       >
//         Didn't receive the OTP?
//       </Text>
//       <LinkText color="#7FFF00" ml="$2" fontSize="$sm" onPress={sendOtp}>
//         Resend OTP
//       </LinkText>
//     </HStack>
//   );
// }

export default OTPVerification;
