import { useState, useEffect } from 'react';
import Navbar from '../../components/NavBar';
import {
    Text,
    View,
    Divider,
    ScrollView
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Skeleton } from 'moti/skeleton';
import { useTheme } from '@/components/ThemeContext';
import { getUserNotifications } from '@/utils/notifications';

const Notifications = () => {
    const colorscheme = useColorScheme();
    const { theme } = useTheme();
    const [accentColour, setAccentColour] = useState<string>('greenyellow');
    const currentTheme = theme === "system" ? colorscheme : theme;
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const todayNotifications = [];
    const yesterdayNotifications = [];
    const olderNotifications = [];

    useEffect(() => {
        const getSettings = async () => {
            let accentcolour = await SecureStore.getItemAsync('accentColour');
            setAccentColour(accentcolour);
        };
        getSettings();
    }, []);

    const formatNotificationDate = (sendTime) => {
        const now = new Date();
        // console.log(now);
        const notificationDate = new Date(sendTime);
        // console.log(notificationDate);

        const differenceInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
        const differenceInDays = Math.floor(differenceInHours / 24);

        if (differenceInDays === 0) {
            // console.log(differenceInDays);
            return differenceInHours < 1 ? 'less than an hour ago' : `${differenceInHours} hours ago`;
        } else if (differenceInDays === 1) {
            return 'yesterday';
        } else {
            return notificationDate.toLocaleDateString();
        }
    };

    if (notifications) {
        // console.log('yurpp');
        notifications.forEach(notification => {
            const formattedDate = formatNotificationDate(notification.send_time);
    
            if (formattedDate.includes('hours ago') || formattedDate.includes('hour ago')) {
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
            const notifications = await getUserNotifications();
            // console.log(notifications);
            setNotifications(notifications);
            setLoading(false);
        };
        getNotifications();
    }, [])

    const renderNotifications = (notificationList) => (
        notificationList.map((notification, idx) => (
            <View key={idx} backgroundColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} my="$2" py="$1" px="$2" rounded='$2xl'>
                <View pr="$2" flexDirection='row' alignItems='center'>
                    <AntDesign name={notification.title === "Booking Invitation" ? "addusergroup" : "clockcircleo"} size={30} color={currentTheme === 'dark' ? '#FFFFFF' : '#000000'} />
                    <Text pl={16} pr="$4" py={4} style={{ color: currentTheme === 'dark' ? '#FFFFFF' : '#000000' }}>
                        {notification.message} · <Text style={{ color: 'grey' }}>{formatNotificationDate(notification.send_time)}</Text>
                    </Text>
                </View>
            </View>
        ))
    );

    return (

        <View pt="$20" px="$2" flex={1} flexDirection="column" backgroundColor={currentTheme === 'dark' ? '$black' : '$white'}>
            <View flexDirection='row' justifyContent='space-between' mb="$2">
                <Text fontWeight="$bold" fontSize={28} color={currentTheme === 'dark' ? '$white' : '$black'}>Notifications</Text>
                <View style={{ backgroundColor: `${accentColour}`, alignItems: 'center', padding: 8, borderRadius: 12 }}>
                    <Entypo name="sound-mix" size={26} color="black" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
            </View>
            {loading === true ? (
                <>
                    {Array.from({ length: 8 }, (_, index) => (
                        <View key={index} mt={index === 0 ? '$4' : '$2'}>
                            <Skeleton colorMode={currentTheme === 'dark' ? 'dark' : 'light'} height={80} width={"100%"} />
                        </View>
                    ))}
                </>
            ) : (
                <ScrollView>
                    <View>
                        <Text mb="$2" style={{ fontWeight: 'bold', fontSize: 16 }} color={currentTheme === 'dark' ? '$white' : '$black'}>Recent</Text>
                        {renderNotifications(todayNotifications)}
                        <Divider my="$2" bgColor='grey' />
                        <Text my="$2" style={{ fontWeight: 'bold', fontSize: 16 }} color={currentTheme === 'dark' ? '$white' : '$black'}>Yesterday</Text>
                        {renderNotifications(yesterdayNotifications)}
                        <Divider my="$2" bgColor='grey' />
                        <Text my="$2" style={{ fontWeight: 'bold', fontSize: 16 }} color={currentTheme === 'dark' ? '$white' : '$black'}>Older</Text>
                        {renderNotifications(olderNotifications)}
                    </View>
                </ScrollView>
            )}
            <Navbar />
        </View>
    )
}

export default Notifications