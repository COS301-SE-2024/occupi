import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, useColorScheme, Image, StyleSheet } from 'react-native';
import { Text, Heading } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Svg, { Path } from 'react-native-svg'; 

const LoadingScreen: React.FC<{ onFetchStats: () => void }> = ({ onFetchStats }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY]);

  const generateContourPaths = () => {
    const paths = [];
    for (let i = 0; i < 25; i++) {
      const yOffset = i * 15;
      paths.push(
        <Path
          key={i}
          d={`M0 ${10 + yOffset} Q50 ${30 + yOffset}, 100 ${10 + yOffset} T200 ${30 + yOffset}`}
          stroke={isDarkMode ? '#2F2F2F' : '#D3D3D3'}
          strokeWidth="0.8"
          fill="none"
        />
      );
    }
    return paths;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? 'black' : 'white',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Contour Background */}
      <Svg
        height="100%"
        width="100%"
        style={StyleSheet.absoluteFill}
        viewBox="0 0 200 200"
      >
        {generateContourPaths()}
      </Svg>

     
      {/* OccuBot Header */}
      <View
        style={{
          backgroundColor: '#C6F432',
          paddingVertical: 5,
          paddingHorizontal: 20,
          borderRadius: 15,
          marginBottom: 20,
          zIndex: 1,
        }}
      >
        <Text
          style={{
            fontFamily: 'Roboto-Bold',
            fontSize: 16,
            color: 'black',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          OccuBot
        </Text>
      </View>

      {/* Animated OccuBot Image with Glow Effect */}
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
          source={require('./assets/OccuBot.png')}
          style={{ width: 200, height: 400 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Subheading */}
      <Heading
        style={{
          fontFamily: 'Roboto-Bold',
          fontSize: 28,
          color: isDarkMode ? 'white' : 'black',
          textAlign: 'center',
          marginBottom: 40,
          zIndex: 1,
        }}
      >
        How may I help{'\n'}you today!
      </Heading>

      {/* Fetch My Stats Button */}
      <TouchableOpacity
        style={{
          backgroundColor: isDarkMode ? 'white' : 'black',
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 25,
          marginTop: hp('2%'),
          alignSelf: 'center',
          width: wp('90%'),
          height: hp('6%'),
          zIndex: 1,
        }}
        onPress={onFetchStats}
      >
        <Text
          style={{
            fontFamily: 'Roboto-Bold',
            color: isDarkMode ? 'black' : 'white',
            fontSize: 20,
            textAlign: 'center',
          }}
        >
          Fetch My Stats
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoadingScreen;