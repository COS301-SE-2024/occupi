import React, { useEffect, useRef } from 'react';
import {
  Image,
  Center,
  Text,
  Heading,
} from '@gluestack-ui/themed';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';

const Welcome = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
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
    <View style={styles.container}>
      <Center style={styles.center}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            alt="logo"
            source={require('../../screens/Login/assets/images/Occupi/Occupi-gradient.png')}
            style={styles.logo}
          />
        </Animated.View>
        <Heading style={styles.heading}>Log in. Let's Plan.</Heading>
        <Text style={styles.subHeading}>Predict. Plan. Perfect.</Text>
        <GradientButton
          onPress={() => router.replace('/login')}
          text="Login"
        />
        <Text style={styles.registerText} onPress={() => router.push('/signup')}>Register</Text>
      </Center>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: wp('4%'),
  },
  center: {
    height: '100%',
    justifyContent: 'center',
  },
  logo: {
    width: wp('50%'),
    height: wp('50%'),
    marginBottom: hp('3%'),
    marginTop: hp('3%'),
  },
  heading: {
    alignSelf: 'center',
    fontSize: wp('8%'),
    paddingLeft: wp('4%'),
    marginBottom: hp('2%'),
    marginTop: hp('4%'),
  },
  subHeading: {
    alignSelf: 'center',
    fontSize: wp('5%'),
    padding: wp('4%'),
    fontWeight: '300',
    marginBottom: hp('6%'),
  },
  registerText: {
    fontWeight: 'bold',
    marginTop: hp('3%'),
    fontSize: wp('4%'),
  },
});

export default Welcome;
