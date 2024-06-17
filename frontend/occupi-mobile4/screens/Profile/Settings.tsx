import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Alert } from 'react-native';
import {
  VStack,
  HStack,
  Box,
  Center,
  Icon,
  Heading,
  Switch,
  Divider,
  Pressable,
  useColorMode,
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Navbar from '../../components/NavBar';
import { Appearance, useColorScheme } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [name, setName] = useState('Sabrina Carpenter');
  const navigation = useNavigation();
  let colorScheme = useColorScheme();

  const handleNameChange = () => {
    setName('Sabrina Palmer');
    router.push('/profile');
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleColorMode = () => {
    colorScheme = !colorScheme;
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => handleNavigate('login'),
      },
    ]);
  };

  const data = [
    { title: 'My account', description: 'Make changes to your account', iconName: 'user', onPress: handleNameChange },
    {
      title: 'Notifications',
      description: 'Manage your notifications',
      iconName: 'bell',
      accessoryRight: () => (
        <Switch isChecked={notificationsEnabled} onToggle={toggleNotifications} />
      ),
    },
    { title: 'Privacy Policy', description: 'View privacy policy', iconName: 'lock', onPress: () => handleNavigate('PrivacyPolicyScreen') },
    { title: 'Security', description: 'Enhance your security', iconName: 'shield', onPress: () => handleNavigate('SecurityScreen') },
    // {
    //   title: 'Dark mode',
    //   description: 'Enable or disable dark mode',
    //   iconName: 'moon',
    //   accessoryRight: () => (
    //     <Switch isChecked={colorScheme === 'dark'} onToggle={toggleColorMode} />
    //   ),
    // },
    { title: 'Terms and Policies', description: 'View terms and policies', iconName: 'file-text', onPress: () => handleNavigate('TermsPoliciesScreen') },
    { title: 'Report a problem', description: 'Report any issues', iconName: 'alert-circle', onPress: () => handleNavigate('ReportProblemScreen') },
    { title: 'Support', description: 'Get support', iconName: 'headphones', onPress: () => handleNavigate('SupportScreen') },
    { title: 'Log out', description: 'Log out from your account', iconName: 'log-out', onPress: handleLogout },
    { title: 'About and Help', description: '', iconName: 'info', onPress: () => handleNavigate('AboutHelpScreen') },
  ];

  const renderListItem = ({ item }) => (
    <Pressable
      onPress={item.onPress}
      style={[styles.listItem, colorScheme === 'dark' ? styles.darkItem : styles.lightItem]}
    >
      <HStack space={3} justifyContent="space-between" alignItems="center">
        <View flexDirection="row">
          <Box mr="$6" p="$3" borderRadius="$full" backgroundColor={colorScheme === 'dark' ? '#5A5A5A' : '$gainsboro'}>
            <Icon as={Feather} name={item.iconName} size="lg" color={colorScheme === 'dark' ? 'white' : 'black'} />
          </Box>
          <VStack>
            <Text style={[styles.title, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{item.title}</Text>
            <Text style={[styles.description, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{item.description}</Text>
          </VStack>
        </View>
        {item.accessoryRight ? item.accessoryRight() : <Icon as={Feather} name="chevron-right" size="30" color={colorScheme === 'dark' ? 'white' : 'black'} />}
      </HStack>
    </Pressable>
  );

  return (
    <>
      <ScrollView style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
        <Box style={styles.profileContainer}>
          <Center style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://bookingagentinfo.com/wp-content/uploads/2022/09/Sabrina-Carpenter-1.jpg' }}
              style={styles.profileImage}
            />
            <Icon as={MaterialIcons} name="camera-alt" size="md" color={colorScheme === 'dark' ? 'white' : 'black'} style={styles.cameraIcon} />
          </Center>
          <Box style={styles.profileInfo}>
            <HStack space={2} alignItems="center">
              <Text style={[styles.profileName, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{name}</Text>
              {/* <Icon as={Feather} name="edit" size="sm" color={colorScheme === 'dark' ? 'white' : '#8F9BB3'} onPress={() => handleNavigate('EditProfileScreen')} /> */}
            </HStack>
            <Text style={[styles.profileTitle, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Chief Executive Officer</Text>
          </Box>
        </Box>
        <Divider my={2} style={colorScheme === 'dark' ? styles.darkDivider : styles.lightDivider} />
        <VStack space={4}>
          {data.map((item, index) => (
            <View key={index}>
              {renderListItem({ item })}
              {index < data.length - 1 && <Divider my={2} style={colorScheme === 'dark' ? styles.darkDivider : styles.lightDivider} />}
            </View>
          ))}
        </VStack>
        <Center style={styles.footerContainer}>
          <Text style={[styles.versionText, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Version 0.1.0</Text>
        </Center>
      </ScrollView>
      <Navbar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    top: 0,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: 'black',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    width: wp('25%'),
    height: wp('25%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    left: wp('17.5%'),
    width: wp('6%'),
    height: wp('6%'),
  },
  profileInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: wp('3.5%'),
  },
  lightText: {
    color: 'black',
  },
  darkText: {
    color: '#fff',
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    color: '#8F9BB3',
  },
  listItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  lightItem: {
    backgroundColor: '#fff',
  },
  darkItem: {
    backgroundColor: 'black',
  },
  lightDivider: {
    backgroundColor: '#e0e0e0',
  },
  darkDivider: {
    backgroundColor: '#303030',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  title: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginRight: 60,
  },
  description: {
    fontSize: wp('3.5%'),
    fontWeight: 'light',
  },
});

export default Settings;
