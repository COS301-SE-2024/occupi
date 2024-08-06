import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import {
  VStack,
  HStack,
  Box,
  Center,
  Icon,
  Divider,
  Pressable,
  Toast,
  ToastTitle,
  Text
} from '@gluestack-ui/themed';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Navbar from '../../components/NavBar';
import { useColorScheme } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import { useToast } from '@gluestack-ui/themed';
import { UserLogout } from '@/utils/auth';
import { useTheme } from '@/components/ThemeContext';

const Settings = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const toast = useToast();
  const colorscheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorscheme : theme;

  useEffect(() => {
    const getUserDetails = async () => {
      let result = await SecureStore.getItemAsync('UserData');
      let jsonresult = JSON.parse(result);
      setName(String(jsonresult.name));
      setPosition(String(jsonresult.position));
    };
    getUserDetails();
  }, []);

  const handleLogout = async () => {
    const response = await UserLogout();
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <Toast nativeID={String(id)} variant="accent" action={response === 'Logged out successfully!' ? 'success' : 'error'}>
            <ToastTitle>{response}</ToastTitle>
          </Toast>
        );
      }
    });
  }

  const data = [
    { title: 'My account', description: 'Make changes to your account', iconName: 'user', onPress: () => router.replace('/profile')},
    { title: 'Notifications', description: 'Manage your notifications', iconName: 'bell', onPress: () => router.push('set-notifications')},
    { title: 'Security', description: 'Enhance your security', iconName: 'shield', onPress: () => router.push('/set-security') },
    { title: 'Appearance', description: 'Customize your viewing experience', iconName: 'image', onPress: () => router.push('/set-appearance') },
    { title: 'FAQ', description: "View the community's FAQ", iconName: 'info', onPress: () => router.push('faqpage') },
    { title: 'Log out', description: 'Log out from your account', iconName: 'log-out', onPress: () => handleLogout() },
  ];

  const renderListItem = ({ item }) => (
    <Pressable
      onPress={item.onPress}
      style={[styles.listItem, currentTheme === 'dark' ? styles.darkItem : styles.lightItem]}
    >
      <HStack space={3} justifyContent="space-between" alignItems="center">
        <View flexDirection="row">
          <Box mr="$6" p="$3" borderRadius="$full" backgroundColor={currentTheme === 'dark' ? '#5A5A5A' : '$gainsboro'}>
            <Icon as={Feather} name={item.iconName} size="lg" color={currentTheme === 'dark' ? 'white' : 'black'} />
          </Box>
          <VStack>
            <Text style={[styles.title, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>{item.title}</Text>
            <Text fontWeight={'$light'} style={[styles.description, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>{item.description}</Text>
          </VStack>
        </View>
        {item.accessoryRight ? item.accessoryRight() : <Icon as={Feather} name="chevron-right" size="lg" color={currentTheme === 'dark' ? 'white' : 'black'} />}
      </HStack>
    </Pressable>
  );

  return (
    <>
      <ScrollView style={[styles.container, currentTheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
        <Box style={styles.profileContainer}>
          <Center style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://www.kamogelomoeketse.online/assets/main-D2LspijS.png' }}
              style={styles.profileImage}
            />
            <Icon as={MaterialIcons} name="camera-alt" size="md" color={currentTheme === 'dark' ? 'white' : 'black'} style={styles.cameraIcon} />
          </Center>
          <Box style={styles.profileInfo}>
            <HStack space="xs" alignItems="center">
              <Text style={[styles.profileName, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>{name}</Text>
              {/* <Icon as={Feather} name="edit" size="sm" color={currentTheme === 'dark' ? 'white' : '#8F9BB3'} onPress={() => handleNavigate('EditProfileScreen')} /> */}
            </HStack>
            {/* <Text style={[styles.profileTitle, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>{position}</Text> */}
          </Box>
        </Box>
        <Divider my={2} style={currentTheme === 'dark' ? styles.darkDivider : styles.lightDivider} />
        <VStack space="2xs" marginBottom={20}>
          {data.map((item, index) => (
            <View key={index}>
              {renderListItem({ item })}
              <Divider my={2} style={currentTheme === 'dark' ? styles.darkDivider : styles.lightDivider} />
            </View>
          ))}
        </VStack>
        <Center style={styles.footerContainer}>
          <Text style={[styles.versionText, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>Version 0.1.0</Text>
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
    // padding: 16,
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
  },
});

export default Settings;
