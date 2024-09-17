import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, Alert } from 'react-native';
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
import { useNavBar } from '@/components/NavBarProvider';
import * as ImagePicker from 'expo-image-picker';

const Settings = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [profileImage, setProfileImage] = useState('https://www.kamogelomoeketse.online/assets/main-D2LspijS.png');
  const toast = useToast();
  const colorscheme = useColorScheme();
  const { theme } = useTheme();
  const { setCurrentTab } = useNavBar();
  const currentTheme = theme === "system" ? colorscheme : theme;

  useEffect(() => {
    const getUserDetails = async () => {
      let result = await SecureStore.getItemAsync('UserData');
      let jsonresult = JSON.parse(result);
      // console.log(jsonresult);
      setName(String(jsonresult.name));
    };
     const fetchProfileImage = async () => {
      const image = await SecureStore.getItemAsync('image');
      // if (image) {
      //   const jsonuserdata = JSON.parse(image);
      //   console.log(jsonuserdata);
        setProfileImage(image);
      // }
    };

    fetchProfileImage();
    getUserDetails();
  }, []);

  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // const image = await SecureStore.getItemAsync('image');
      // const userdata = image;
      // const jsonuserdata = JSON.parse(image);
      // const updatedimage = jsonuserdata;
      const newImage = result.assets[0].uri;
      console.log('New Image', newImage);
      await SecureStore.setItemAsync('image', newImage);

      toast.show({
        placement: 'bottom',
        render: ({ id }) => {
          return (
            <Toast nativeID={String(id)} variant="accent" action="success">
              <ToastTitle>Profile picture updated successfully!</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Show an "Are you sure?" prompt
      Alert.alert(
        'Logout',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: async () => {
              const userResponse = await UserLogout();
              if (userResponse === 'Logged out successfully!') {
                // Clear cookies or any other authentication-related storage
                await SecureStore.deleteItemAsync('UserData');
                setCurrentTab('Home');
                // Show a success toast
                toast.show({
                  placement: 'bottom',
                  render: ({ id }) => {
                    return (
                      <Toast nativeID={String(id)} variant="accent" action="success">
                        <ToastTitle>{userResponse}</ToastTitle>
                      </Toast>
                    );
                  },
                });
              } else {
                // Show an error toast
                toast.show({
                  placement: 'bottom',
                  render: ({ id }) => {
                    return (
                      <Toast nativeID={String(id)} variant="accent" action="error">
                        <ToastTitle>{userResponse}</ToastTitle>
                      </Toast>
                    );
                  },
                });
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      // Handle any errors that may occur during the logout process
      console.error('Error logging out:', error);
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={String(id)} variant="accent" action="error">
              <ToastTitle>Failed to log out. Please try again.</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const data = [
    { title: 'My account', description: 'Make changes to your account', iconName: 'user', onPress: () => router.replace('/profile')},
    { title: 'Notifications', description: 'Manage your notifications', iconName: 'bell', onPress: () => router.push('set-notifications')},
    { title: 'Security', description: 'Enhance your security', iconName: 'shield', onPress: () => router.push('/set-security') },
    { title: 'Appearance', description: 'Customize your viewing experience', iconName: 'image', onPress: () => router.push('/set-appearance') },
    { title: 'FAQ', description: "View the community's FAQ", iconName: 'help-circle', onPress: () => router.push('faqpage') },
    { title: 'About and Help', description: "View the Ts & Cs and Privacy Policy", iconName: 'info', onPress: () => router.push('info') },
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
          <Pressable onPress={handleImageUpload} style={styles.cameraIconContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
             </Pressable>
            
              <Icon as={MaterialIcons} name="camera-alt" size="md" color={currentTheme === 'dark' ? 'white' : 'black'} style={styles.cameraIcon} />
           
          </Center>
          <Box style={styles.profileInfo}>
            <HStack space="xs" alignItems="center">
              <Text style={[styles.profileName, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>{name}</Text>
            </HStack>
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
    left: wp('20.5%'),
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
