import React from 'react';
import {
  Box,
  VStack,
  Button,
  Image,
  Center,
  ButtonText,
} from '@gluestack-ui/themed';
import GuestLayout from '../../layouts/GuestLayout';
import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { styled } from '@gluestack-style/react';
import { LinearGradient } from 'expo-linear-gradient';

const StyledImage = styled(Image, {
  '@sm': {
    props: {
      style: {
        height: 40,
        width: 320,
      },
    },
  },
  '@md': {
    props: {
      style: {
        height: 141,
        width: 275,
      },
    },
  },
});


function HeaderLogo() {
  return (
    <Box alignItems="center" justifyContent="center">
      <StyledImage
        resizeMode="contain"
        source={require('../../screens/Login/assets/images/Occupi/occupi-white-trans.png')}
        style={{ width: 110, height: 110 }}
        sx={{
          '@md': {
            display: 'flex',
          },
        }}
        display="none"
      />
      <StyledImage
        sx={{
          '@md': {
            display: 'none',
          },
        }}
        style={{ width: 110, height: 110 }}
        display="flex"
        source={require('../../screens/Login/assets/images/Occupi/occupi-white-trans.png')}
      />
    </Box>
  );
}

export default function SplashScreen() {
  return (
    <GuestLayout>
      <Center w="$full" flex={1}>
        <LinearGradient
          colors={['#2F2270', '#8CE39E', '#BBF65A', '#EEF060']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, width: '100%', justifyContent: 'center' }}
        >
          <Box
            maxWidth="$508"
            w="$full"
            minHeight="$authcard"
            px="$4"
            justifyContent="center"
          >
            <HeaderLogo />
          </Box>
        </LinearGradient>
      </Center>
    </GuestLayout>
  );
}
