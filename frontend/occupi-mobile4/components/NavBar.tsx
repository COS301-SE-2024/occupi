import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Button, Icon, CalendarDaysIcon, BellIcon } from '@gluestack-ui/themed';
import { Feather } from '@expo/vector-icons';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavBar } from './NavBarProvider';
import { useTheme } from './ThemeContext';

const NavBar = () => {
  const colorscheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorscheme : theme;
  const styles = getStyles(currentTheme);
  const [accentColour, setAccentColour] = useState<string>('greenyellow');
  const { currentTab, setCurrentTab } = useNavBar();

  const handleTabPress = (tabName, route) => {
    setCurrentTab(tabName);
    router.replace(route);
  };

  useEffect(() => {
    const getSettings = async () => {
        let accentcolour = await SecureStore.getItemAsync('accentColour');
        setAccentColour(accentcolour);
    };
    getSettings();
}, []);
  // console.log(currentTab);

  return (
    <BlurView
      tint="light"
      pb={hp('3%')}
      backgroundColor={currentTheme === 'dark' ? 'black' : '#fff'}
      intensity={20}
      style={styles.container}
    >
      <Button
        onPress={() => handleTabPress('Home', '/home')}
        flex={1}
        mt={hp('1%')}
        w={wp('20%')}
        backgroundColor="none"
        title="Home"
        flexDirection="column"
      >
        <Feather
          name="home"
          size={hp('3%')}
          color={currentTab === 'Home' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        />
        <Text
          numberOfLines={1}
          w={wp('9%')}
          fontSize={wp('3%')}
          color={currentTab === 'Home' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        >
          Home
        </Text>
      </Button>
      <Button
        onPress={() => handleTabPress('ViewBookings', '/viewbookings')}
        flex={1}
        mt={hp('1%')}
        w={wp('20%')}
        backgroundColor="none"
        title="Search"
        flexDirection="column"
      >
        <Ionicons
          name="receipt-outline"
          size={24}
          color={currentTab === 'ViewBookings' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        />
        <Text
          numberOfLines={1}
          w={wp('19%')}
          fontSize={wp('3%')}
          color={currentTab === 'ViewBookings' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        >
          My bookings
        </Text>
      </Button>
      <Button
        onPress={() => handleTabPress('Book', '/bookings')}
        flex={1}
        mt={hp('1%')}
        w={wp('20%')}
        backgroundColor="none"
        title="Book"
        flexDirection="column"
      >
        <Icon
          as={CalendarDaysIcon}
          w={hp('3%')}
          h={hp('3%')}
          color={currentTab === 'Book' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        />
        <Text
          numberOfLines={1}
          w={wp('7.4%')}
          fontSize={wp('3%')}
          color={currentTab === 'Book' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        >
          Book
        </Text>
      </Button>
      <Button
        onPress={() => handleTabPress('Notifications', '/notifications')}
        flex={1}
        mt={hp('1%')}
        w={wp('20%')}
        backgroundColor="none"
        title="Notifications"
        flexDirection="column"
      >
        <Icon
          as={BellIcon}
          w={hp('3%')}
          h={hp('3%')}
          color={currentTab === 'Notifications' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        />
        <Text
          pl={wp('1%')}
          numberOfLines={1}
          w={wp('20%')}
          fontSize={wp('3%')}
          color={currentTab === 'Notifications' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        >
          Notifications
        </Text>
      </Button>
      <Button
        onPress={() => handleTabPress('Profile', '/settings')}
        flex={1}
        mt={hp('1%')}
        w={wp('20%')}
        backgroundColor="none"
        title="Profile"
        flexDirection="column"
      >
        <FontAwesome6
          name="user"
          size={hp('3%')}
          color={currentTab === 'Profile' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        />
        <Text
          pl={wp('1%')}
          numberOfLines={1}
          w={wp('12%')}
          fontSize={wp('3%')}
          color={currentTab === 'Profile' ? `${accentColour}` : currentTheme === 'dark' ? 'white' : 'black'}
        >
          Profile
        </Text>
      </Button>
    </BlurView>
  );
};

const getStyles = (currentTheme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('3%'),
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)',
    paddingVertical: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: currentTheme === 'dark' ? '#444' : '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
  }
});

export default NavBar;
