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


const Onboarding1 = () => {
  return (
      <View style={{backgroundColor: 'white' }} p="$4">
        <Center h="$full" >
            <Image
              alt="logo"
              source={require('../../screens/Login/assets/images/Occupi/11.png')}
              style={{ width: 350, height: 350 }}
              mb="$12"
            />
            <Heading alignSelf="$left" pl="$4" mb="$4" mt="$6">Capacity Prediction</Heading>
            <Text alignSelf="$left" fontSize="$24" p="$4" fontWeight="$light" mb="$8">
              Predictive AI to help you plan when you go to the office better
            </Text>
            <GradientButton
              onPress={() => router.push('/onboarding2')}
              text="Next"
            />
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
  
export default Onboarding1