import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Button,
  Box,
  Image,
  Center,
  Text,
  Heading,
} from '@gluestack-ui/themed';
import GuestLayout from '../../layouts/GuestLayout';
import { styled } from '@gluestack-style/react';
import { ViewPager } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';


('');
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
        alt="logo"
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
        alt="logo"
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

const OnboardingScreen = ({ onFinish }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
      <LinearGradient
        colors={['#351DB5', '#4490A5', '#6CC87F', '#C1F56C', '#FEFFB9']}
        start={[0, 1]}
        end={[0, 0]}
        style={styles.container}
      >
        <Center w="100%" flex={1}>
          <Box
            maxWidth="508px"
            w="100%"
            minHeight="authcard"
            justifyContent="center"
          >
            <HeaderLogo />
          </Box>
        </Center>
      </LinearGradient>
  );
};

export default function SplashScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedIndex(1); // Assuming Onboarding1 is at index 1
      router.push('/settings'); // Navigate to Onboarding1 screen
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); // Clean up timer on component unmount
  }, []);

  return (
    <GuestLayout>
      <ViewPager
        selectedIndex={selectedIndex}
        onSelect={(index) => setSelectedIndex(index)}
        style={{ flex: 1 }}
      >
        <OnboardingScreen onFinish={() => console.log('Onboarding finished')} />
      </ViewPager>
    </GuestLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
    color: 'black',
    marginTop: 20,
  },
  buttonContainer: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
    width: 150
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#7DD3FC',
    
  },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
