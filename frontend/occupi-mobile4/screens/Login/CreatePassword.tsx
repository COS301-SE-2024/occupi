import React, { useState } from 'react';
import {
  VStack,
  Box,
  HStack,
  Icon,
  Text,
  Button,
  Image,
  Center,
  ArrowLeftIcon,
  FormControl,
  Heading,
  FormControlHelperText,
  EyeIcon,
  EyeOffIcon,
  ButtonText,
  Input,
  useToast,
  Toast,
  InputField,
  ToastTitle,
  FormControlHelper,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  InputIcon,
  InputSlot,
  ScrollView,
  FormControlLabel,
  FormControlLabelText,
} from '@gluestack-ui/themed';
import { AlertTriangle } from 'lucide-react-native';
import Logo from './assets/images/Occupi/file.png';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Keyboard } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GuestLayout from '../../layouts/GuestLayout';
import { router } from 'expo-router';
import { styled } from '@gluestack-style/react';

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

  const onSubmit = (data: CreatePasswordSchemaType) => {
    if (data.password === data.confirmpassword) {
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="success">
              <ToastTitle>Password updated successfully</ToastTitle>
            </Toast>
          );
        },
      });

      // Navigate screen to appropriate location
      router.replace('/');

      reset();
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
    return (
      <VStack space="md">
         <HStack space="md" alignItems="center" justifyContent="center">
          <Image
            alt="logo"
            source={Logo}
            style={{ width: wp('27%'), height: wp('27%') }}
          />
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

  function WebSideContainer() {
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
          alt="Gluestack-ui pro"
          resizeMode="contain"
          source={require('./assets/images/gluestackUiProLogo_web_light.svg')}
        />
      </Center>
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
        <WebSideContainer />
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
                    <Input   borderRadius="$full" backgroundColor="#f2f2f2">
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
                    <Input   borderRadius="$full" backgroundColor="#f2f2f2">
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
