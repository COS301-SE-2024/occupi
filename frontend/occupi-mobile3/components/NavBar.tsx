import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Icon, SearchIcon, CalendarDaysIcon, BellIcon } from '@gluestack-ui/themed';
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

const NavBar = () => {
  return (
    <View intensity={60} style={styles.container}>  
        <Button onPress={() => router.push('/home')} mt="$2" w="$22" backgroundColor="$none" title="Search"  flexDirection="$column"><Feather name="home" size={24} color="black" /><Text fontSize="$4" top="$8">Home</Text></Button>
        <Button onPress={() => router.push('/bookings')} mt="$2" w="$22" backgroundColor="$none" title="Search"  flexDirection="$column"><Icon as={SearchIcon} w="$6" h="$6" /><Text m="$0" top="$8">Search</Text></Button>
        <Button onPress={() => router.push('/bookings')} mt="$2" w="$22" backgroundColor="$none" title="Search"  flexDirection="$column"><Icon as={CalendarDaysIcon} w="$6" h="$6" /><Text m="$0" top="$8">Book</Text></Button>
        <Button onPress={() => router.push('/bookings')} mt="$2" w="$22" backgroundColor="$none" title="Search"  flexDirection="$column"><Icon as={BellIcon} w="$6" h="$6" /><Text m="$0" top="$8">Notifications</Text></Button>
        <Button onPress={() => router.push('/bookings')} mt="$2" w="$22" backgroundColor="$none" title="Search"  flexDirection="$column"><FontAwesome6 name="user" size={24} color="black" /><Text m="$0" top="$8">Profile</Text></Button>
        {/* <Avatar bgColor="$amber600" size="md" borderRadius="$full">
            <AvatarFallbackText>Tinashe Austin</AvatarFallbackText>
        </Avatar> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 26,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    // backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 20,
    borderTopColor: '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
  }
});

export default NavBar;
