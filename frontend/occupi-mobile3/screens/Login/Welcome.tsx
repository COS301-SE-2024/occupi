import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Button,
    Box,
    Image,
    Center,
    Text,
    Heading,
  } from '@gluestack-ui/themed';
import { Animated, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

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

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();

    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleValue, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: spin }, { scale: scaleValue }],
  };


const Welcome = () => {
  return (
      <View style={{backgroundColor: 'white' }} p="$4">
        <Center h="$full" >
            <Image
              alt="logo"
              source={require('../../screens/Login/assets/images/Occupi/logo-white.png')}
              style={{ width: 200, height: 200 }}
              style={[styles.logo, animatedStyle]}
              mb="$12"
              mt="$12"
            />
            <Heading alignSelf="$center" fontSize="$3xl" pl="$4" mb="$2" mt="$4">Log in. Let's Plan.</Heading>
            <Text alignSelf="$center" fontSize="$xl" p="$4" fontWeight="$light" mb="$16">
              Predict. Plan. Perfect. 
            </Text>
            <GradientButton
              onPress={() => router.push('/login')}
              text="Login"
            />
            <Text fontWeight="$bold" mt="$6" onPress={() => router.push('/signup')}>Register</Text>
        </Center>
      </View>
  )
}

const styles = StyleSheet.create({
    buttonContainer: {
      borderRadius: 15,
      marginTop: 20,
      alignSelf: 'center',
      width: 360,
      height: 50
    },
    buttonText: {
      color: 'black',
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 50,
    }
  });
  
export default Welcome