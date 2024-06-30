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

const Onboarding2 = () => {
  return (
    <View style={styles.container}>
      <Center style={styles.center}>
        <Image
          alt="logo"
          source={require('../../screens/Login/assets/images/Occupi/7.png')}
          style={styles.image}
        />
        <Heading style={styles.heading}>Day to day Occupancy analysis</Heading>
        <Text style={styles.text}>
          Uses historical data to provide day to day analysis and statistics 
        </Text>
        <GradientButton
          onPress={() => router.replace('/onboarding3')}
          text="Next"
        />
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
  image: {
    width: wp('70%'),
    height: wp('70%'),
    marginBottom: hp('3%'),
  },
  heading: {
    alignSelf: 'flex-start',
    paddingLeft: wp('4%'),
    marginBottom: hp('2%'),
    marginTop: hp('6%'),
    fontSize: wp('8%'),
  },
  text: {
    alignSelf: 'flex-start',
    fontSize: wp('5%'),
    padding: wp('4%'),
    fontWeight: '300',
    marginBottom: hp('4%'),
  }
});

export default Onboarding2;
