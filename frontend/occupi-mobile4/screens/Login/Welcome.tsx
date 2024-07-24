import React from 'react';
import {
  Image,
  Center,
  Text,
  Heading,
} from '@gluestack-ui/themed';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';

const Welcome = () => {
  return (
    <View style={styles.container}>
      <Center style={styles.center}>
        <Image
          alt="logo"
          source={require('../../screens/Login/assets/images/Occupi/logo-white.png')}
          style={styles.logo}
        />
        <Heading style={styles.heading}>Log in. Let's Plan.</Heading>
        <Text testID="welcome-text" style={styles.subHeading}>Predict. Plan. Perfect.</Text>
        <GradientButton
          onPress={() => router.replace('/login')}
          text="Login"
          testID="login-button"
          
        />
        <Text testID="register-text" style={styles.registerText} onClick={() => router.push('/signup')}>Register</Text>
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
