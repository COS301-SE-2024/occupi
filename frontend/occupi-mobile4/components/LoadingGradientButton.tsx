import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const LoadingGradientButton = () => {
  return (
    <LinearGradient
      testID="gradient-loading-button"
      colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
      locations={[0.02, 0.31, 0.67, 0.97]}
      start={[0, 1]}
      end={[1, 0]}
      style={{
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 15,
        marginTop: hp('2%'),
        width: wp('90%'),
        height: hp('6%'),
        alignSelf: 'center',
      }}
    >
      <ActivityIndicator testID="loading-indicator" size="small" color="#000" />
    </LinearGradient>
  );
};

export default LoadingGradientButton;
