import React, { useState } from 'react';
import { StyleSheet, Pressable, Animated, Easing, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { View, Text, Icon } from '@gluestack-ui/themed';
import SpinningLogo from '@/components/SpinningLogo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '@/components/ThemeContext';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Info = () => {
    const colorscheme = useColorScheme();
    const { theme } = useTheme();
    const currentTheme = theme === "system" ? colorscheme : theme;
    const [result, setResult] = useState(null);

    const handlePressPrivacy = async () => {
        let result = await WebBrowser.openBrowserAsync('https://www.freeprivacypolicy.com/live/8f124563-97fc-43fa-bf37-7a82ba153ea3');
        setResult(result);
    };

    const handlePressTerms = async () => {
        // Replace with actual Terms of Service URL
        let result = await WebBrowser.openBrowserAsync('https://example.com/terms-of-service');
        setResult(result);
    };

    const handlePressManual = async () => {
        // Replace with actual User Manual URL
        let result = await WebBrowser.openBrowserAsync('https://drive.google.com/file/d/1Bljn7L4Bfw71cE3YSctkyA-lgBkzr9G-/view?usp=drive_link');
        setResult(result);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme === 'dark' ? '#000' : '#FFF' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <LinearGradient
                    colors={currentTheme === 'dark' ? ['#1A1A1A', '#000'] : ['#F0F0F0', '#FFF']}
                    style={{
                        paddingTop: hp('3%'),
                        paddingHorizontal: wp('4%'),
                        paddingBottom: hp('1%'),
                        borderBottomLeftRadius: 30,
                        borderBottomRightRadius: 30,
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: hp('2%'),
                    }}>
                        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
                            <Icon
                                as={Feather}
                                name="chevron-left"
                                size="xl"
                                color={currentTheme === 'dark' ? 'white' : 'black'}
                                testID="back-button"
                            />
                        </Pressable>
                        <Text style={{
                            fontSize: wp('5%'),
                            fontWeight: 'bold',
                            color: currentTheme === 'dark' ? 'white' : 'black',
                        }}>
                            About and Info
                        </Text>
                        <Icon
                            as={Ionicons}
                            name="information-circle"
                            size="xl"
                            color={currentTheme === 'dark' ? 'white' : 'black'}
                        />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <SpinningLogo />
                        <Text style={{
                            color: currentTheme === 'dark' ? 'white' : 'black',
                            fontSize: wp('8%'),
                            fontWeight: 'bold',
                            marginTop: hp('2%'),
                        }}>
                            Occupi.
                        </Text>
                        <Text style={{
                            color: currentTheme === 'dark' ? '#AAA' : '#666',
                            fontSize: wp('5%'),
                            marginTop: hp('1%'),
                        }}>
                            Predict. Plan. Perfect.
                        </Text>
                    </View>
                </LinearGradient>

                <View style={{ padding: wp('4%'), alignItems: 'center' }}>
                    <InfoCard
                        title="App Version"
                        content="1.0.2"
                        icon="tag"
                        theme={currentTheme}
                    />
                    <InfoCard
                        title="Device"
                        content={Device.deviceName}
                        icon="smartphone"
                        theme={currentTheme}
                    />
                    <InfoCard
                        title="Operating System"
                        content={`${Device.osName} ${Device.osVersion}`}
                        icon="cpu"
                        theme={currentTheme}
                    />
                </View>

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginTop: hp('2%'),
                    paddingBottom: hp('4%'),
                }}>
                    <LinkButton
                        title="Privacy Policy"
                        onPress={handlePressPrivacy}
                        theme={currentTheme}
                    />
                    <LinkButton
                        title="Terms of Service"
                        onPress={handlePressTerms}
                        theme={currentTheme}
                    />
                    <LinkButton
                        title="User Manual"
                        onPress={handlePressManual}
                        theme={currentTheme}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoCard = ({ title, content, icon, theme }) => (
    <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? '#1A1A1A' : '#F0F0F0',
        borderRadius: 15,
        padding: wp('4%'),
        marginBottom: hp('2%'),
        width: '100%',
        shadowColor: theme === 'dark' ? '#000' : '#888',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }}>
        <Icon
            as={Feather}
            name={icon}
            size="xl"
            color={theme === 'dark' ? '#FFF' : '#333'}
            style={{ marginRight: wp('4%') }}
        />
        <View>
            <Text style={{
                fontSize: wp('4%'),
                fontWeight: 'bold',
                color: theme === 'dark' ? '#FFF' : '#333',
            }}>
                {title}
            </Text>
            <Text style={{
                fontSize: wp('3.5%'),
                color: theme === 'dark' ? '#AAA' : '#666',
            }}>
                {content}
            </Text>
        </View>
    </View>
);

const LinkButton = ({ title, onPress, theme }) => (
    <Pressable
        onPress={onPress}
        style={{
            backgroundColor: theme === 'dark' ? '#333' : '#E0E0E0',
            paddingVertical: hp('1%'),
            paddingHorizontal: wp('3%'),
            borderRadius: 20,
        }}
    >
        <Text style={{
            color: theme === 'dark' ? '#FFF' : '#333',
            fontSize: wp('3.5%'),
            fontWeight: 'bold',
        }}>
            {title}
        </Text>
    </Pressable>
);

export default Info;