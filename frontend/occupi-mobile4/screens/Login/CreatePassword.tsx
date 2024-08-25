import React, { useRef, useState, useEffect } from 'react';
import {
  VStack,
  Box,
  HStack,
  Text,
  Image,
  Center,
  FormControl,
  Heading,
  FormControlHelperText,
  EyeIcon,
  EyeOffIcon,
  Input,
  useToast,
  Toast,
  Icon,
  InputField,
  ToastTitle,
  FormControlHelper,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  ChevronLeftIcon,
  InputIcon,
  InputSlot,
  ScrollView,
  FormControlLabel,
  FormControlLabelText,
} from '@gluestack-ui/themed';
import { AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../screens/Login/assets/images/Occupi/Occupi-gradient.png';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Keyboard,StyleSheet, TextInput,Animated, Easing } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GuestLayout from '../../layouts/GuestLayout';
import { router } from 'expo-router';
import { styled } from '@gluestack-style/react';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { userResetPassword } from '@/utils/auth';

const StyledImage = styled(Image, {
  props: {
    style: {
      height: wp('10%'),
      width: wp('80%'),
    },
  },
});
const createPasswordSchema = z.object({
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
});

type CreatePasswordSchemaType = z.infer<typeof createPasswordSchema>;

export default function CreatePassword() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CreatePasswordSchemaType>({
    resolver: zodResolver(createPasswordSchema),
  });

  const toast = useToast();

  const onSubmit = async (data: CreatePasswordSchemaType) => {
    if (data.password === data.confirmpassword) {
      const response = await userResetPassword(data.password, data.confirmpassword);
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="success">
              <ToastTitle>{response === "Successful login!" ? "Password updated successfully!" : response}</ToastTitle>
            </Toast>
          );
        },
      });
    } else {
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="error">
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

  const handleConfirmPasswordState = () => {
    setShowConfirmPassword((showConfirmPassword) => {
      return !showConfirmPassword;
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

  function ScreenText() {
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
      <VStack space="md">
        <StyledExpoRouterLink href="/login">
        <Icon
          as={ChevronLeftIcon}
          color="$textLight800"
          m="$0" w="$10" h="$16"
          sx={{ _dark: { color: '$textDark800' } }}
        />
      </StyledExpoRouterLink>
         <HStack space="md" alignItems="center" justifyContent="center">
         <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            alt="logo"
            source={Logo}
            style={{ width: wp('27%'), height: wp('27%') }}
          />
           </Animated.View>
        </HStack>
        <Heading
          fontSize={wp('6%')}
          sx={{
            '@md': { fontSize: wp('8%') },
          }}
        >
          Create new password
        </Heading>
        <Text fontSize={wp('4%')}>
          Your new password must be different from previous used passwords and
          must be of at least 8 characters.
        </Text>
      </VStack>
    );
  }

  
  return (
    <GuestLayout>
      <Box
        sx={{
          '@md': { display: 'none' },
        }}
      >
      </Box>
      <Box
        display="none"
        sx={{
          '@md': { display: 'flex' },
        }}
        flex={1}
      >
      </Box>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        flex={1}
        bounces={false}
      >
        <Box
          bg="$backgroundLight0"
          pt="$8"
          pb="$4"
          px="$4"
          sx={{
            '@md': {
              p: '$8',
            },
            '_dark': { bg: '$backgroundDark800' },
          }}
          flex={1}
        >
          <ScreenText />
          <VStack
            mt="$7"
            space="md"
            sx={{
              '@md': { mt: '$8' },
            }}
          >
            <Box sx={{ '@base': { w: '$full' }, '@md': { width: '$80' } }}>
              <FormControl isInvalid={!!errors.password} isRequired={true}>
              <FormControlLabel mb="$1">
            <FormControlLabelText>Create Password</FormControlLabelText>
          </FormControlLabel>
                <Controller
                  defaultValue=""
                  name="password"
                  control={control}
                  rules={{
                    validate: async (value) => {
                      try {
                        await createPasswordSchema.parseAsync({
                          password: value,
                        });
                        return true;
                      } catch (error: any) {
                        return error.message;
                      }
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input backgroundColor="#F3F3F3" borderColor="#F3F3F3" borderRadius="$xl" h={hp('6%')}>
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
                      <InputSlot onPress={handleState} mr="$2">
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
                <FormControlHelperText>
                  <Text size="xs">Must be at least 8 characters</Text>
                </FormControlHelperText>
                <FormControlHelper></FormControlHelper>
              </FormControl>
            </Box>

            <Box
              sx={{
                '@base': { w: '$full' },
                '@md': { width: '$80' },
              }}
            >
              <FormControl
                isInvalid={!!errors.confirmpassword}
                isRequired={true}
              >
                <FormControlLabel mb="$1">
            <FormControlLabelText>Confirm Password</FormControlLabelText>
          </FormControlLabel>
                <Controller
                  defaultValue=""
                  name="confirmpassword"
                  control={control}
                  rules={{
                    validate: async (value) => {
                      try {
                        await createPasswordSchema.parseAsync({
                          confirmpassword: value,
                        });
                        return true;
                      } catch (error: any) {
                        return error.message;
                      }
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input backgroundColor="#F3F3F3" borderColor="#F3F3F3" borderRadius="$xl" h={hp('6%')}>
                      <InputField
                        fontSize={wp('4%')}
                        placeholder="Confirm Password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        onSubmitEditing={handleKeyPress}
                        returnKeyType="done"
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <InputSlot onPress={handleConfirmPasswordState} mr="$2">
                        <InputIcon
                          as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                        />
                      </InputSlot>
                    </Input>
                  )}
                />

                <FormControlError>
                  <FormControlErrorIcon size="md" as={AlertTriangle} />
                  <FormControlErrorText>
                    {errors?.confirmpassword?.message}
                  </FormControlErrorText>
                </FormControlError>
                <FormControlHelperText>
                  <Text size="xs"> Both Password must match</Text>
                </FormControlHelperText>
                <FormControlErrorText>
                  <Text size="xs">{errors.confirmpassword?.message}</Text>
                </FormControlErrorText>
              </FormControl>
            </Box>
          </VStack>

          <GradientButton
            onPress={handleSubmit(onSubmit)}
            text="Update Password"
          />
        </Box>
      </ScrollView>
    </GuestLayout>
  );
}
