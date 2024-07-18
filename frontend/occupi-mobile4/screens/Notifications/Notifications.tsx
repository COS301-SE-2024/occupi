import { useState, useEffect } from 'react';
import Navbar from '../../components/NavBar';
import {
    Text,
    View,
    Toast,
    useToast,
    ToastTitle,
    Divider,
    ScrollView
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import { StatusBar, useColorScheme, Dimensions } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Skeleton } from 'moti/skeleton';

const Notifications = () => {
    const colorScheme = useColorScheme();
    const toast = useToast();
    const [notifications, setNotifications] = useState();
    const [loading, setLoading] = useState(true);

    const apiUrl = process.env.EXPO_PUBLIC_DEVELOP_API_URL;

    useEffect(() => {
        const getNotifications = async () => {
            let userEmail = await SecureStore.getItemAsync('Email');
            let authToken = await SecureStore.getItemAsync('Token');
            const baseUrl = 'https://dev.occupi.tech/api/get-notifications';
            const params = new URLSearchParams();
            params.append('filter', '{"emails":["kamogelomoeketse@gmail.com"]}');

            const url = `${baseUrl}?${params.toString()}`;

            try {
                const response = await fetch(baseUrl, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `${authToken}`
                    },
                    credentials: "include"
                });
                const data = await response.json();
                console.log(`Response Data: ${JSON.stringify(data.data)}`);
                // console.log(data);
                if (response.ok) {
                    setNotifications(data.data || []); // Ensure data is an array
                    // console.log(data);
                    setLoading(false);
                } else {
                    console.log(data);
                    setLoading(false);
                    toast.show({
                        placement: 'top',
                        render: ({ id }) => {
                            return (
                                <Toast nativeID={id} variant="accent" action="error">
                                    <ToastTitle>{data.error.message}</ToastTitle>
                                </Toast>
                            );
                        },
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                toast.show({
                    placement: 'top',
                    render: ({ id }) => {
                        return (
                            <Toast nativeID={id} variant="accent" action="error">
                                <ToastTitle>Network Error: {error.message}</ToastTitle>
                            </Toast>
                        );
                    },
                });
            }
        };
        getNotifications();
    }, [apiUrl, toast])

    return (

        <View pt="$20" px="$4" flex={1} flexDirection="column" backgroundColor={colorScheme === 'dark' ? '$black' : '$white'}>
            <View flexDirection='row' justifyContent='space-between'>
                <Text fontWeight="$bold" fontSize={28} color={colorScheme === 'dark' ? '$white' : '$black'}>Notifications</Text>
                <View style={{ backgroundColor: '#ADFF2F', alignItems: 'center', padding: 8, borderRadius: 12 }}>
                    <Entypo name="sound-mix" size={26} color="black" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
            </View>
            {loading === true ? (
                <ScrollView>
                {Array.from({ length: 8 }, (_, index) => (
                  <View mt={index === 0 ? '$4' : '$2'}>
                    <Skeleton colorMode={colorScheme ? 'dark' : 'light'} height={80} width={"100%"} />
                  </View>
                ))}
              </ScrollView>
            ) : (
                <ScrollView>
                    {notifications.map((notification, idx) => (
                        <Text color={colorScheme === 'dark' ? '$white' : '$black'}>{notification.message}</Text>
                    ))}

                </ScrollView>

            )}

            <Navbar />
        </View>
    )
}

export default Notifications