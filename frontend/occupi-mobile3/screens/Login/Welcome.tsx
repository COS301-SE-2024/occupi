import React from 'react'
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


const Onboarding3 = () => {
  return (
      <View style={{backgroundColor: 'white' }} p="$4">
        <Center h="$full" >
            <Image
              alt="logo"
              source={require('../../screens/Login/assets/images/Occupi/logo-white.png')}
              style={{ width: 200, height: 200 }}
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
  
export default Onboarding3