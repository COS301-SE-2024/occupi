import React from 'react';
import {  StyleSheet } from 'react-native';
import { Text, View, Button, Icon, SearchIcon, CalendarDaysIcon, BellIcon } from '@gluestack-ui/themed';
import StyledExpoRouterLink from './StyledExpoRouterLink';
import { Feather } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Avatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
  } from "@gluestack-ui/themed"
import { BlurView } from 'expo-blur';
import { Appearance, useColorScheme } from 'react-native';

const NavBar = () => {
  let colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  return (
    <BlurView tint="light" pb="$8" backgroundColor={colorScheme === 'dark' ? 'black' : '#fff'} intensity={20} style={styles.container}>  
        <Button onPress={() => router.push('/home')} flex="$1" mt="$2" w="$22" backgroundColor="$none" title="Home"  flexDirection="$column"><Feather name="home" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} /><Text numberOfLines={1} w="$9" fontSize="$12" color={colorScheme === 'dark' ? 'white' : 'black'}>Home</Text></Button>
        <Button onPress={() => router.push('/bookings')} flex="$1" mt="$2" w="$22" backgroundColor="$none" title="Search"  flexDirection="$column"><Icon as={SearchIcon} w="$6" h="$6" color={colorScheme === 'dark' ? 'white' : 'black'} /><Text numberOfLines={1} w="$10" fontSize="$12" color={colorScheme === 'dark' ? 'white' : 'black'}>Search</Text></Button>
        <Button onPress={() => router.push('/bookings')} flex="$1" mt="$2" w="$22" backgroundColor="$none" title="Book"  flexDirection="$column"><Icon as={CalendarDaysIcon} w="$6" h="$6" color={colorScheme === 'dark' ? 'white' : 'black'} /><Text numberOfLines={1} numberOfLines={1} fontSize="$12" color={colorScheme === 'dark' ? 'white' : 'black'}>Book</Text></Button>
        <Button onPress={() => router.push('/bookings')} flex="$1" mt="$2" w="$22" backgroundColor="$none" title="Notifications"  flexDirection="$column"><Icon as={BellIcon} w="$6" h="$6" color={colorScheme === 'dark' ? 'white' : 'black'} /><Text pl="$1" numberOfLines={1} w="$20" fontSize="$12" color={colorScheme === 'dark' ? 'white' : 'black'}>Notifications</Text></Button>
        <Button onPress={() => router.push('/settings')} flex="$1" mt="$2" w="$22" backgroundColor="$none" title="Profile"  flexDirection="$column"><FontAwesome6 name="user" size={24} color="black" color={colorScheme === 'dark' ? 'white' : 'black'} /><Text pl="$1" numberOfLines={1} w="$12" fontSize="$12" color={colorScheme === 'dark' ? 'white' : 'black'}>Profile</Text></Button>
        {/* <Avatar bgColor="$amber600" size="md" borderRadius="$full">
            <AvatarFallbackText>Tinashe Austin</AvatarFallbackText>
        </Avatar> */}
    </BlurView>
  );
};

const getStyles = (colorScheme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 26,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)',
    // backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    // borderRadius: 20,
    borderTopColor: colorScheme === 'dark' ? '#444' : '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
  }
});

export default NavBar;
