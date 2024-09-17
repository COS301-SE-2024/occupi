import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavBar';
import {
    Text,
    View,
    ScrollView,
    Pressable,
    Button,
    VStack,
    HStack,
    Avatar,
    Divider,
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme, RefreshControl } from 'react-native';
import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';
import { Skeleton } from 'moti/skeleton';
import { useTheme } from '@/components/ThemeContext';
import { getUserNotifications } from '@/utils/notifications';

const Notifications = () => {
    const colorscheme = useColorScheme();
    const { theme } = useTheme();
    const [accentColour, setAccentColour] = useState<string>('greenyellow');
    const currentTheme = theme === "system" ? colorscheme : theme;
    const isDarkMode = currentTheme === "dark";
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const getSettings = async () => {
            let accentcolour = await SecureStore.getItemAsync('accentColour');
            setAccentColour(accentcolour);
        };
        getSettings();
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const fetchedNotifications = await getUserNotifications();
        setNotifications(fetchedNotifications);
        setLoading(false);
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchNotifications().then(() => setRefreshing(false));
    }, []);

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

    const categorizeNotifications = () => {
        const today = [];
        const yesterday = [];
        const older = [];
        const bookingInvitations = [];

        notifications.forEach(notification => {
            const formattedDate = formatNotificationDate(notification.send_time);
            
            if (notification.title === "Booking Invitation") {
                bookingInvitations.push(notification);
            } else if (formattedDate.includes('hours ago') || formattedDate.includes('hour ago')) {
                today.push(notification);
            } else if (formattedDate === 'yesterday') {
                yesterday.push(notification);
            } else {
                older.push(notification);
            }
        });

        return { today, yesterday, older, bookingInvitations };
    };

    const { today, yesterday, older, bookingInvitations } = categorizeNotifications();

    const renderNotification = (notification, index, notificationList) => (
        <View key={notification.id}>
            <Pressable 
                onPress={() => console.log('Notification pressed:', notification.id)}
                style={({ pressed }) => [
                    {
                        backgroundColor: pressed 
                            ? isDarkMode ? '#3A3A3C' : '#E5E5E5'
                            : isDarkMode ? '#2C2C2E' : '#F3F3F3',
                        marginVertical: 8,
                        padding: 16,
                        borderRadius: 16,
                    }
                ]}
            >
                <HStack space="md" alignItems="center">
                    <Avatar 
                        size="md"
                        backgroundColor={accentColour}
                    >
                        <AntDesign 
                            name={notification.title === "Booking Invitation" ? "addusergroup" : "clockcircleo"} 
                            size={24} 
                            color="black" 
                        />
                    </Avatar>
                    <VStack flex={1} space="xs">
                        <Text bold color={isDarkMode ? 'white' : 'black'}>
                            {notification.title}
                        </Text>
                        <Text color={isDarkMode ? 'white' : 'black'}>
                            {notification.message}
                        </Text>
                        <Text color="gray.500" fontSize="xs">
                            {formatNotificationDate(notification.send_time)}
                        </Text>
                    </VStack>
                </HStack>
            </Pressable>
            {(notification.title === "Booking Invitation" || notification.title === "Booking Starting Soon") && 
             index < notificationList.length - 1 && (
                <Divider 
                    my="$2" 
                    backgroundColor={isDarkMode ? 'gray.600' : 'gray.200'}
                />
            )}
        </View>
    );

    const renderNotificationSection = (title, notificationList) => (
        notificationList.length > 0 && (
            <VStack space="sm" mb="$4">
                <Text bold fontSize="$lg" color={isDarkMode ? 'white' : 'black'}>
                    {title}
                </Text>
                {notificationList.map((notification, index) => 
                    renderNotification(notification, index, notificationList)
                )}
            </VStack>
        )
    );

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? 'black' : 'white' }}>
            <VStack space="md" p="$4" pt="$16">
                <HStack justifyContent="space-between" alignItems="center">
                    <Text bold fontSize="$2xl" color={isDarkMode ? 'white' : 'black'}>
                        Notifications
                    </Text>
                    <Pressable 
                        onPress={() => console.log('Settings pressed')}
                        style={({ pressed }) => ({
                            backgroundColor: pressed ? `${accentColour}80` : accentColour,
                            padding: 8,
                            borderRadius: 12,
                        })}
                    >
                        <Ionicons name="settings-outline" size={26} color="black" />
                    </Pressable>
                </HStack>
                <HStack space="sm" justifyContent="space-between">
                    {['All', 'Invitations', 'Updates'].map((tab) => (
                        <Button
                            key={tab}
                            onPress={() => setActiveTab(tab.toLowerCase())}
                            variant={activeTab === tab.toLowerCase() ? "solid" : "outline"}
                            backgroundColor={activeTab === tab.toLowerCase() ? accentColour : 'transparent'}
                            borderColor={accentColour}
                            borderRadius="$full"
                            px="$4"
                            py="$2"
                        >
                            <Text 
                                color={activeTab === tab.toLowerCase() ? 'black' : (isDarkMode ? 'white' : 'black')}
                                fontWeight="bold"
                            >
                                {tab}
                            </Text>
                        </Button>
                    ))}
                </HStack>
            </VStack>
            
            {loading ? (
                <VStack space="md" p="$4">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton
                            key={index}
                            colorMode={isDarkMode ? 'dark' : 'light'}
                            height={80}
                            width="100%"
                            radius={16}
                        />
                    ))}
                </VStack>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {activeTab === 'all' && (
                        <>
                            {renderNotificationSection('Today', today)}
                            {renderNotificationSection('Yesterday', yesterday)}
                            {renderNotificationSection('Older', older)}
                        </>
                    )}
                    {activeTab === 'invitations' && renderNotificationSection('Booking Invitations', bookingInvitations)}
                    {activeTab === 'updates' && (
                        <>
                            {renderNotificationSection('Today', today)}
                            {renderNotificationSection('Yesterday', yesterday)}
                            {renderNotificationSection('Older', older)}
                        </>
                    )}
                    {notifications.length === 0 && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                            <Text fontSize="$lg" color={isDarkMode ? 'white' : 'black'}>
                                No notifications to display
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
            <Navbar />
        </View>
    );
};

export default Notifications;