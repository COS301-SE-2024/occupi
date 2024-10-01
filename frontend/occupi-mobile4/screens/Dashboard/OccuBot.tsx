import React, { useState, useEffect,useRef } from 'react';
import { View, Text, Image, useColorScheme,Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';

const OccuBot = ({ onComplete }) => {
  const [statusText, setStatusText] = useState('Analyzing ...');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const textInterval = setInterval(() => {
      setStatusText((prevText) => {
        switch (prevText) {
          case 'Searching...': return 'Processing...';
          case 'Processing...': return 'Analyzing ...';
          case 'Analyzing ...': return 'Searching...';
          default: return 'Analyzing ...';
        }
      });
    }, 2000);

    const completionTimer = setTimeout(() => {
      clearInterval(textInterval);
      router.replace('stats');
    }, 15000); // Adjust time as needed

    return () => {
      clearInterval(textInterval);
      clearTimeout(completionTimer);
    };
  }, []);

  return (
    <LinearGradient
      colors={isDarkMode ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F0F0F0']}
      style={{
        flex: 1,
        borderRadius: wp('5%'),
        padding: wp('5%'),
        justifyContent: 'space-between',
      }}
    >
      {/* OccuBot Header */}
      <View style={{ alignItems: 'center', marginTop: hp('10%') }}>
        <Text
          style={{
            fontSize: wp('5%'),
            color: isDarkMode ? '#FFFFFF' : '#000000',
            textAlign: 'center',
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          OccuBot
        </Text>
        <Text
          style={{
            fontSize: wp('3.5%'),
            color: '#E0FF7B',
            marginTop: hp('1%'),
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          • Online
        </Text>
      </View>

      {/* Centered GIF */}
      <Animated.View
        style={{
          transform: [{ translateY }],
          marginBottom: 20,
          shadowColor: '#E0FF7B',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 80,
          elevation: 50,
          zIndex: 1,
        }}
        >
        <Image
          source={require('../../screens/Dashboard/assets/1d0f933ffa6ccaf0d1ae783f9a73d0-unscreen.gif')}
          style={{ width: 350, height: 400 }}
              resizeMode="contain"
        />
      </Animated.View>

      {/* Status Text */}
      <View style={{ alignItems: 'center', marginBottom: hp('20%') }}>
        <Text
          style={{
            fontSize: wp('5%'),
            color: isDarkMode ? '#FFFFFF' : '#000000',
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
