import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Button, Icon, SearchIcon, CalendarDaysIcon, BellIcon } from '@gluestack-ui/themed';
import { Feather } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const NavBar = () => {
  let colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  return (
    <BlurView tint="light" pb={hp('3%')} backgroundColor={colorScheme === 'dark' ? 'black' : '#fff'} intensity={20} style={styles.container}>  
      <Button onPress={() => router.push('/home')} flex={1} mt={hp('1%')} w={wp('20%')} backgroundColor="none" title="Home" flexDirection="column">
        <Feather name="home" size={hp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'} />
        <Text numberOfLines={1} w={wp('9%')} fontSize={wp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'}>Home</Text>
      </Button>
      <Button onPress={() => router.push('/viewbookings')} flex={1} mt={hp('1%')} w={wp('20%')} backgroundColor="none" title="Search" flexDirection="column">
        <Icon as={SearchIcon} w={hp('3%')} h={hp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'} />
        <Text numberOfLines={1} w={wp('20%')} fontSize={wp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'}>My bookings</Text>
      </Button>
      <Button onPress={() => router.push('/bookings')} flex={1} mt={hp('1%')} w={wp('20%')} backgroundColor="none" title="Book" flexDirection="column">
        <Icon as={CalendarDaysIcon} w={hp('3%')} h={hp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'} />
        <Text numberOfLines={1} w={wp('7.4%')} fontSize={wp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'}>Book</Text>
      </Button>
      <Button onPress={() => router.push('/bookings')} flex={1} mt={hp('1%')} w={wp('20%')} backgroundColor="none" title="Notifications" flexDirection="column">
        <Icon as={BellIcon} w={hp('3%')} h={hp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'} />
        <Text pl={wp('1%')} numberOfLines={1} w={wp('20%')} fontSize={wp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'}>Notifications</Text>
      </Button>
      <Button onPress={() => router.push('/settings')} flex={1} mt={hp('1%')} w={wp('20%')} backgroundColor="none" title="Profile" flexDirection="column">
        <FontAwesome6 name="user" size={hp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'} />
        <Text pl={wp('1%')} numberOfLines={1} w={wp('12%')} fontSize={wp('3%')} color={colorScheme === 'dark' ? 'white' : 'black'}>Profile</Text>
      </Button>
    </BlurView>
  );
};

const getStyles = (colorScheme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('3%'),
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)',
    paddingVertical: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: colorScheme === 'dark' ? '#444' : '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
  }
});

export default NavBar;
