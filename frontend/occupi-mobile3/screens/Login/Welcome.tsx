import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Button,
  Box,
  Image,
  Center,
  Text,
  Heading,
} from '@gluestack-ui/themed';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
        <Text style={styles.subHeading}>Predict. Plan. Perfect.</Text>
        <GradientButton
          onPress={() => router.push('/login')}
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
  registerText: {
    fontWeight: 'bold',
    marginTop: hp('3%'),
    fontSize: wp('4%'),
  },
});

export default Welcome;
