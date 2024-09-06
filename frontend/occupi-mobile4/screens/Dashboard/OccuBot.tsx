import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp , heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {Video} from 'expo-av';

const OccuBot = ({ onComplete }) => {
  const [statusText, setStatusText] = useState('Analyzing ...');

  useEffect(() => {
    const textInterval = setInterval(() => {
      setStatusText((prevText) => {
        switch (prevText) {
          case 'Searching...': return 'Processing...';
          case 'Processing...': return 'Analyzing ...';
          case 'Analyzing ...': return 'Searching...';
        }
      });
    }, 5000);

    const completionTimer = setTimeout(() => {
      clearInterval(textInterval);
      // onComplete();
    }, 10000); // Adjust time as needed

    return () => {
      clearInterval(textInterval);
      clearTimeout(completionTimer);
    };
  }, []);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']}
      style={{
        flex: 1,
        borderRadius: wp('5%'),
        padding: wp('5%'),
        justifyContent: 'space-between',
      }}
    >
       <Video
        source={require('../../screens/Dashboard/assets/aee94850e2461bb7a507a49764a1c1ba.mp4')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted={true}
      />

      {/* OccuBot Header */}
      <View style={{
        alignItems: 'center',
        marginTop: hp('10%'),
      }}>
        <View
          style={{
            // backgroundColor: '#CA32F4',
            paddingVertical: hp('0.5%'),
            paddingHorizontal: wp('5%'),
            borderRadius: wp('5%'),
          }}
        >
          <Text
            style={{
              
              fontSize: wp('5%'),
              color: 'white',
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 'bold',
            }}
          >
            OccuBot
          </Text>
        </View>
        <Text
          style={{
          
            fontSize: wp('3.5%'),
            color: '#9AE66E',
            marginTop: hp('1%'),
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          • Online
        </Text>
      </View>

      {/* Centered GIF */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image
          source={require('../../screens/Dashboard/assets/1d0f933ffa6ccaf0d1ae783f9a73d0-unscreen.gif')}
          style={{
            width: wp('90%'),
            height: wp('90%'),
            resizeMode: 'contain',
          }}
        />
      </View>

      {/* Status Text */}
      <View style={{
        alignItems: 'center',
        marginBottom: hp('20%'),
      }}>
        <Text
          style={{
           
            fontSize: wp('5%'),
            color: 'white',
            textAlign: 'center',
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          {statusText}
        </Text>
      </View>
    </LinearGradient>
  );
};

export default OccuBot;