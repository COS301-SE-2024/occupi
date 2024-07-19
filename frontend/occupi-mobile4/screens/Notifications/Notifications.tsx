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
import { Entypo, FontAwesome6 } from '@expo/vector-icons';
import { Skeleton } from 'moti/skeleton';
import axios from 'axios';

const Notifications = () => {
    const colorScheme = useColorScheme();
    const toast = useToast();
    const [notifications, setNotifications] = useState();
    const [loading, setLoading] = useState(true);
    const todayNotifications = [];
    const yesterdayNotifications = [];
    const olderNotifications = [];

    const apiUrl = process.env.EXPO_PUBLIC_DEVELOP_API_URL;

    const formatNotificationDate = (sendTime) => {
        const now = new Date();
        const notificationDate = new Date(sendTime);

        const differenceInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
        const differenceInDays = Math.floor(differenceInHours / 24);

        if (differenceInDays === 0) {
            return differenceInHours < 1 ? 'less than an hour ago' : `${differenceInHours} hours ago`;
        } else if (differenceInDays === 1) {
            return 'yesterday';
        } else {
            return notificationDate.toLocaleDateString();
        }
    };

    if (notifications) {
        notifications.forEach(notification => {
            const formattedDate = formatNotificationDate(notification.send_time);

            if (formattedDate.includes('hours ago')) {
                todayNotifications.push(notification);
            } else if (formattedDate === 'yesterday') {
                yesterdayNotifications.push(notification);
            } else {
                olderNotifications.push(notification);
            }
        });
    }


    useEffect(() => {
        const getNotifications = async () => {
            let userEmail = await SecureStore.getItemAsync('Email');
            let authToken = await SecureStore.getItemAsync('Token');
            // const baseUrl = 'https://dev.occupi.tech/api/get-notifications';
            const params = new URLSearchParams();
            params.append('filter', '{"emails":["kamogelomoeketse@gmail.com"]}');

            // const url = `${baseUrl}?${params.toString()}`;

            try {
                const response = await axios.get('https://dev.occupi.tech/api/get-notifications', {
                    params: {
                        filter: {
                            emails: [{ userEmail }]
                        },
                        order_desc: "send_time"
                    },
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `${authToken}`
                    },
                    withCredentials: true
                });
                const data = response.data;
                // console.log(`Response Data: ${JSON.stringify(data.data)}`);
                // console.log(data);
                if (response.status === 200) {
                    setNotifications(data.data || []); // Ensure data is an array

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

    const renderNotifications = (notificationList) => (
        notificationList.map((notification, idx) => (
            <View key={idx}>
                <View flexDirection='row' alignItems='center'>
                    <FontAwesome6 name="circle-user" size={40} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
                    <Text py={2} style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}>
                        {notification.message} · <Text style={{ color: 'grey' }}>{formatNotificationDate(notification.send_time)}</Text>
                    </Text>
                </View>
            </View>
        ))
    );

    return (

        <View pt="$20" px="$4" flex={1} flexDirection="column" backgroundColor={colorScheme === 'dark' ? '$black' : '$white'}>
            <View flexDirection='row' justifyContent='space-between' mb="$2">
                <Text fontWeight="$bold" fontSize={28} color={colorScheme === 'dark' ? '$white' : '$black'}>Notifications</Text>
                <View style={{ backgroundColor: '#ADFF2F', alignItems: 'center', padding: 8, borderRadius: 12 }}>
                    <Entypo name="sound-mix" size={26} color="black" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
            </View>
            {loading === true ? (
                <>
                    {Array.from({ length: 8 }, (_, index) => (
                        <View mt={index === 0 ? '$4' : '$2'}>
                            <Skeleton colorMode={colorScheme === 'dark' ? 'dark' : 'light'} height={80} width={"100%"} />
                        </View>
                    ))}
                </>
            ) : (
                <ScrollView>
                    <View>
                        <Text pr="$4" mb="$2" style={{ fontWeight: 'bold', fontSize: 16 }} color={colorScheme === 'dark' ? '$white' : '$black'}>Recent</Text>
                        {renderNotifications(todayNotifications)}
                        <Divider my="$2" bgColor='grey' />
                        <Text my="$2" style={{ fontWeight: 'bold', fontSize: 16 }} color={colorScheme === 'dark' ? '$white' : '$black'}>Yesterday</Text>
                        {renderNotifications(yesterdayNotifications)}
                        <Divider my="$2" bgColor='grey' />
                        <Text my="$2" style={{ fontWeight: 'bold', fontSize: 16 }} color={colorScheme === 'dark' ? '$white' : '$black'}>Older</Text>
                        {renderNotifications(olderNotifications)}
                    </View>
                </ScrollView>
            )}
            <Navbar />
        </View>
    )
}

export default Notifications