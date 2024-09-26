import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, FlatList, RefreshControl, Pressable, TouchableOpacity } from 'react-native';
import { View, Text, VStack, HStack, Avatar, Input, InputField, Icon, Button } from '@gluestack-ui/themed';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { Skeleton } from 'moti/skeleton';
import * as SecureStore from 'expo-secure-store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useColorScheme } from 'react-native';
import Tooltip from '@/components/Tooltip';
import { useTheme } from '@/components/ThemeContext';
import { getUserNotifications, deleteNotification } from '@/utils/notifications';
import { MotiView } from 'moti';
import Navbar from '../../components/NavBar';

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

const NotificationItem = ({ notification, accentColour, isDarkMode, onSwipeLeft }) => {
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ flexDirection: 'row', width: 60 }}>
        <TouchableOpacity
          onPress={() => onSwipeLeft('delete', notification.id)}
          style={{
            flex: 1,
            backgroundColor: '#c30101',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
            height: 80,
            marginTop: 50
          }}
        >
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable
        onPress={() => console.log('Notification pressed:', notification.id)}
        style={{
          backgroundColor: isDarkMode ? '#2C2C2E' : '#F3F3F3',
          marginVertical: 8,
          padding: 16,
          borderRadius: 16,
        }}
      >
        <HStack space="md" alignItems="center">
          <Avatar size="md" backgroundColor={accentColour}>
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
            <Text color="gray.500" fontSize="$xs">
              {formatNotificationDate(notification.send_time)}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
    </Swipeable>
  );
};

const Notifications = () => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const isDarkMode = currentTheme === 'dark';
  const [accentColour, setAccentColour] = useState('greenyellow');
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getSettings = async () => {
      const storedAccentColour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(storedAccentColour || 'greenyellow');
    };
    getSettings();
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeTab, searchQuery]);

  const fetchNotifications = async () => {
    setLoading(true);
    const fetchedNotifications = await getUserNotifications();
    setNotifications(fetchedNotifications);
    setLoading(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().then(() => setRefreshing(false));
  }, []);

  const filterNotifications = () => {
    let filtered = notifications;
    
    if (activeTab === 'invitations') {
      filtered = filtered.filter(notification => notification.title === "Booking Invitation");
    } else if (activeTab === 'updates') {
      filtered = filtered.filter(notification => notification.title !== "Booking Invitation");
    }
    
    if (searchQuery) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredNotifications(filtered);
  };

  const handleSwipeLeft = async (action, notificationId) => {
    if (action === 'delete') {
      await deleteNotification(notificationId);
    }
    fetchNotifications();
  }
  
  const renderNotificationItem = ({ item }) => (
    <NotificationItem
      notification={item}
      accentColour={accentColour}
      isDarkMode={isDarkMode}
      onSwipeLeft={handleSwipeLeft}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#FFF' }}>
        <View px="$4" style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#FFF'}}>
          <View style={{ flexDirection: 'column' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
           
              <Text fontWeight="$bold" fontSize={24} color={isDarkMode ? 'white' : 'black'}>Notifications</Text>
              {/* <Tooltip
                content="View and manage your notifications here. Swipe left for actions."
                placement="bottom"
              /> */}
                <Icon as={Feather} name="info" size="lg" color={isDarkMode ? 'white' : 'black'} />
            </View>
            <Input 
              my="$6" 
              w="$full" 
              backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} 
              borderRadius="$xl" 
              borderColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} 
              h={hp('5%')}
            >
              <InputField
                placeholder="Quick search for notifications"
                fontSize={wp('4%')}
                type="text"
                returnKeyType="done"
                color={isDarkMode ? 'white' : 'black'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              
            </Input>
            <View flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
              <HStack space="sm">
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
            </View>
          </View>

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
            <FlatList
              data={filteredNotifications}
              renderItem={({ item }) => (
                <NotificationItem
                  notification={item}
                  accentColour={accentColour}
                  isDarkMode={isDarkMode}
                  onSwipeLeft={handleSwipeLeft}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 84 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColour} />
              }
              ListEmptyComponent={
                <MotiView
                  from={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', duration: 500 }}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}
                >
                  <Icon as={Feather} name="bell-off" size="4xl" color={isDarkMode ? 'white' : 'black'} mb="$4" />
                  <Text fontSize="$lg" color={isDarkMode ? 'white' : 'black'} textAlign="center">
                    No notifications to display
                  </Text>
                </MotiView>
              }
            />
          )}
        </View>
        <Navbar style={{ position: 'absolute', bottom: 0, width: '100%' }} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Notifications;