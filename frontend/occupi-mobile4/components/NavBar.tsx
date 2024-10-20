import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavBar } from './NavBarProvider';
import { useTheme } from './ThemeContext';

const { width } = Dimensions.get('window');

const NavBar = () => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const styles = getStyles(currentTheme);
  const [accentColour, setAccentColour] = useState('greenyellow');
  const { currentTab, setCurrentTab } = useNavBar();
  const [showPopup, setShowPopup] = useState(false);
  const isDarkMode = currentTheme === "dark";
  const popupAnimation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const getSettings = async () => {
      let savedAccentColour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(savedAccentColour || '#FF6B35');
    };
    getSettings();
  }, []);

  const handleTabPress = (tabName, route) => {
    setCurrentTab(tabName);
    router.replace(route);
    togglePopup();
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
    Animated.timing(popupAnimation, {
      toValue: showPopup ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const renderTabButton = (tabName, iconName, route, isHomeButton = false) => {
    const isActive = currentTab === tabName;
    const buttonColor = isActive ? accentColour : 'gray';
    const backgroundColor = isActive ? (isDarkMode ? '#242424' : 'darkgrey') : 'transparent';

    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          { backgroundColor },
          isHomeButton && styles.homeButton
        ]}
        onPress={() => handleTabPress(tabName, route)}
      >
        <Feather name={iconName} size={hp('3%')} color={buttonColor} />
        {isActive && !isHomeButton && (
          <Text style={[styles.label, { color: buttonColor }]}>{tabName}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderPopup = () => {
    const popupHeight = popupAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, hp('10%')],
    });

    return (
      <Animated.View style={[styles.popupContainer, { height: popupHeight }]}>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.leftButtons}>
          {/* {renderTabButton('Book', 'book', '/bookings')} */}
          {renderTabButton('Bookings', 'book', '/viewbookings')}
        </View>
        {renderTabButton('Home', 'home', '/home', true)}
        <View style={styles.rightButtons}>
          {renderTabButton('Notifications', 'bell', '/notifications')}
          {renderTabButton('Profile', 'user', '/settings')}
        </View>
      </View>
      {showPopup && renderPopup()}
    </View>
  );
};

const getStyles = (currentTheme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp('2%'),
    left: wp('5%'),
    right: wp('5%'),
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: currentTheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
    borderRadius: 30,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftButtons: {
    flexDirection: 'row',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
    borderRadius: 20,
    marginHorizontal: wp('1%'),
  },
  homeButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  label: {
    fontSize: wp('3%'),
    marginLeft: wp('1%'),
    color: (currentTheme === 'dark') ? 'white' : 'black', 
  },
  popupContainer: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.9,
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  popupText: {
    color: 'white',
    fontSize: wp('4%'),
    padding: 10,
  },
});

export default NavBar;