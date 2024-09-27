import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, useColorScheme, Image, StyleSheet } from 'react-native';
import { Text, Heading } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Svg, { Path } from 'react-native-svg'; 
import { router } from 'expo-router';
import Tooltip from '@/components/Tooltip';
import {TextGenerateEffect} from '../../components/TextGenerateEffect';

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
      <View
        style={{
          backgroundColor: '#E0FF7B',
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
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          OccuBot
         
                <Tooltip 
        content="OccuBot uses AI-powered technology to fetch yourlatest and personalized office experience. "
        placement="bottom"
      />
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
          source={require('./assets/LCPW-unscreen.gif')}
          style={{ width: 400, height: 400 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Subheading */}
      <TextGenerateEffect
        words="Get your personalized data today!"
        className="font-roboto-bold text-2xl text-center mb-10 z-1"
        filter={true}
        duration={0.5}
      />

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
        onPress={() =>  router.replace('stats')}
      >
        <Text
          style={{
            fontFamily: 'Roboto-Bold',
            color: isDarkMode ? 'black' : 'white',
            fontSize: 20,
            textAlign: 'center',
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          Fetch My Stats
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoadingScreen;