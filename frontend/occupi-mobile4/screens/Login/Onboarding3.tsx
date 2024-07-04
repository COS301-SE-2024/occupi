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


const Onboarding3 = () => {
  return (
    <View style={styles.container}>
      <Center style={styles.center}>
        <Image
          alt="logo"
          source={require("../../screens/Login/assets/images/Occupi/14.png")}
          style={styles.image}
        />
        <Heading style={styles.heading}>Real time updates</Heading>
        <Text testID="onboarding3-text" style={styles.text}>
          Provides real time updates for occupancy and capacity
        </Text>
        <GradientButton
          onPress={() => router.replace('/welcome')}
          text="Next"
        />
      </Center>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: wp("4%"),
  },
  center: {
    height: "100%",
    justifyContent: "center",
  },
  image: {
    width: wp("70%"),
    height: wp("70%"),
    marginBottom: hp("3%"),
  },
  heading: {
    alignSelf: "flex-start",
    paddingLeft: wp("4%"),
    marginBottom: hp("2%"),
    marginTop: hp("6%"),
    fontSize: wp("8%"),
  },
  text: {
    alignSelf: 'flex-start',
    fontSize: wp('5%'),
    padding: wp('4%'),
    fontWeight: '300',
    marginBottom: hp('4%'),
  }
});

export default Onboarding3;
