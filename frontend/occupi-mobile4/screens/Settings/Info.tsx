import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Button, Animated, Easing } from 'react-native';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { View, Text, Icon } from '@gluestack-ui/themed';
import SpinningLogo from '@/components/SpinningLogo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '@/components/ThemeContext';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
const FONTS = {
    h3: { fontSize: 20, fontWeight: 'bold' },
    body3: { fontSize: 16 },
};

const SIZES = {
    padding: 16,
    base: 8,
    radius: 8,
};

const Info = () => {
    const colorscheme = useColorScheme();
    const { theme } = useTheme();
    const currentTheme = theme === "system" ? colorscheme : theme;
    const [result, setResult] = useState(null);

    const handlePressPrivacy = async () => {
        let result = await WebBrowser.openBrowserAsync('https://www.freeprivacypolicy.com/live/8f124563-97fc-43fa-bf37-7a82ba153ea3');
        setResult(result);
    };

    return (
        <View flex={1} pt="$16" px="$6" backgroundColor={currentTheme === 'dark' ? 'black' : 'white'}>
            <View style={styles.header}>
                <Icon
                    as={Feather}
                    name="chevron-left"
                    size="xl"
                    color={currentTheme === 'dark' ? 'white' : 'black'}
                    onPress={() => router.back()}
                    testID="back-button"
                />
                <Text style={styles.headerTitle} color={currentTheme === 'dark' ? 'white' : 'black'}>
                    About and Info
                </Text>
                <Ionicons
                    name="information"
                    size={24}
                    color={currentTheme === 'dark' ? 'white' : 'black'}
                    style={styles.icon}
                />
            </View>
            <SpinningLogo />
            <View flexDirection='column' alignItems='center' justifyContent='center' mt="$4">
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} fontSize={30} fontWeight='bold'>
                    Occupi.
                </Text>
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} fontWeight="$100" fontSize={23} mt="$3">
                    Predict. Plan. Perfect.
                </Text>
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} fontWeight='$light' fontSize={20} mt="$6">
                    version: 1.0.2
                </Text>
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} fontWeight='$light' fontSize={20} mt="$1">
                    {Device.deviceName}
                </Text>
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} fontWeight='$light' fontSize={20} mt="$1">
                    {Device.osName} {Device.osVersion}
                </Text>
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} underline fontWeight='$light' fontSize={20} mt="$1" onPress={handlePressPrivacy}>
                    privacy policy
                </Text>
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} underline fontWeight='$light' fontSize={20} mt="$1">
                    terms of service
                </Text>
                <Text color={currentTheme === 'dark' ? 'white' : 'black'} underline fontWeight='$light' fontSize={20} mt="$1">
                    user manual
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    icon: {
        marginRight: SIZES.base,
    },
    headerTitle: {
        ...FONTS.h3,
    },

});

export default Info;