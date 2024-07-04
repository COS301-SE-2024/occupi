import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { Heading } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const GradientButton = ({ onPress, text,testID }) => {
  return (
  <LinearGradient
    colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
    locations={[0.02, 0.31, 0.67, 0.97]}
    start={[0, 1]}
    end={[1, 0]}
    style={styles.buttonContainer}
  >
    <Heading style={styles.buttonText} onPress={onPress} testID={testID}>
      {text}
    </Heading>
  </LinearGradient>
  )
};

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
  },
});

export default GradientButton