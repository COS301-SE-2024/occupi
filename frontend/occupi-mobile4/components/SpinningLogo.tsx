import { Animated, Easing } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import React, { useEffect, useRef } from 'react';
import { HStack, Image } from '@gluestack-ui/themed';
import Logo from '../screens/Login/assets/images/Occupi/Occupi-gradient.png';

const SpinningLogo = () => {

    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 2,
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <HStack space="md" alignItems="center" justifyContent="center">
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            alt="Occupi Logo"
            source={Logo}
            style={{ width: wp('40%'), height: wp('40%') }}
          />
           </Animated.View>
        </HStack>
    )
}

export default SpinningLogo