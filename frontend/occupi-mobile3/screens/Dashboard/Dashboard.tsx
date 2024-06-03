import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import Navbar from "../../components/NavBar";
import {
    StyleSheet,
    Text,
    View,
    Image,
    Card,
    Toast,
    useToast,
    ToastTitle,
    Button,
    ButtonText,
    Icon,
    ArrowRightIcon
} from '@gluestack-ui/themed';
import { router } from 'expo-router';

const Dashboard = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [checkedIn, setCheckedIn] = useState(false);
    const toast = useToast();

    useEffect(() => {
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);

    const checkIn = () => {
        setCheckedIn(!checkedIn);
        if (checkedIn === false) {
            toast.show({
                placement: 'top',
                render: ({ id }) => {
                    return (
                        <Toast nativeID={id} variant="accent" action="info">
                            <ToastTitle>Travel safe. Have a lovely day further!</ToastTitle>
                        </Toast>
                    );
                },
            });
        } else {
            toast.show({
                placement: 'top',
                render: ({ id }) => {
                    return (
                        <Toast nativeID={id} variant="accent" action="info">
                            <ToastTitle>Check in successful. Have a productive day!</ToastTitle>
                        </Toast>
                    );
                },
            });
        }
        
    }

    const backgroundColor = isDarkMode ? '#1C1C1E' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';
    const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';

    return (
        <View pt="$16" px="$4" flex="$1" flexDirection="column" backgroundColor={backgroundColor}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View flexDirection="row" justifyContent="space-between">
                <View>
                    <Text fontSize="$lg" fontWeight="$light" color={textColor}>Hi Sabrina 👋</Text>
                    <Text mt="$4" fontSize="$2xl" fontWeight="$bold" color={textColor}>Welcome to Occupi</Text>
                </View>
                <Image
                    alt="logo"
                    p="$10"
                    source={require('../../screens/Login/assets/images/Occupi/file.png')}
                    style={{ width: 30, height: 30, flexDirection: 'column', tintColor: isDarkMode ? 'white' : 'black' }}
                />
            </View>
            <Card size="lg" variant="elevated" mt="$4" w="$full" h="$32" backgroundColor={cardBackgroundColor} borderRadius="$20">
            </Card>
            <View display="flex" flexDirection="row" rowGap="$4" mt="$1" justifyContent="space-between">
                <Card size="lg" variant="elevated" mt="$4" style={{ width: 170, height: 100 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
                </Card>
                <Card size="lg" variant="elevated" mt="$4" style={{ width: 170, height: 100 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
                </Card>
            </View >
            <View flexDirection="row" justifyContent="space-between" mt="$6" mb="$4" h="$8" alignItems="center">
                <Text color={textColor}>Office analytics</Text>
                {/* <Button w="$36" borderRadius="$12" backgroundColor="greenyellow" onPress={() => router.push('/bookings')}><ButtoText color="dimgrey">Check in</ButtoText><Icon as={ArrowRightIcon} ml="$1" w="$4" h="$4" /></Button> */}
                {checkedIn ? (
                    <Button w="$36" borderRadius="$12" backgroundColor="greenyellow" onPress={checkIn}><ButtonText color="dimgrey">Check out</ButtonText></Button>
                ) : (
                    <Button w="$36" borderRadius="$12" backgroundColor="lightblue" onPress={checkIn}><ButtonText color="dimgrey">Check in</ButtonText></Button>
                )}
            </View>
            <Image
                alt="logo"
                p="$10"
                source={require('./assets/graph.png')}
                style={{ width: "full", height: 260, flexDirection: 'column', tintColor: isDarkMode ? 'white' : 'black' }}
            />
            <Navbar />
        </View>
    );
};

export default Dashboard;