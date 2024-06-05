import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Box,
  Image,
  Center,
  Heading,
} from '@gluestack-ui/themed';
import { styled } from '@gluestack-style/react';
import { ViewPager } from '@ui-kitten/components';
import { router } from 'expo-router';

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
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();

    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleValue, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: spin }, { scale: scaleValue }],
  };

  return (
    <View style={styles.logoContainer}>
      <Animated.Image
        source={require('../../screens/Login/assets/images/Occupi/occupi-white-trans.png')}
        style={[styles.logo, animatedStyle]}
        resizeMode="contain"
      />
    </View>
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
      router.navigate('/home'); // Navigate to Onboarding1 screen
    }, 5000); // 8 seconds

    return () => clearTimeout(timer); // Clean up timer on component unmount
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ViewPager
        selectedIndex={selectedIndex}
        onSelect={(index) => setSelectedIndex(index)}
        style={{ flex: 1 }}
      >
        <OnboardingScreen onFinish={() => console.log('Onboarding finished')} />
      </ViewPager>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
  },
  buttonContainer: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
    width: 150,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
