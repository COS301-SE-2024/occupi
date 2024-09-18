import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, Alert, Dimensions } from 'react-native';
import { VStack, HStack, Box, Center, Icon, Pressable, Toast, ToastTitle, Text, Button } from '@gluestack-ui/themed';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Navbar from '../../components/NavBar';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useToast } from '@gluestack-ui/themed';
import { UserLogout } from '@/utils/auth';
import { useTheme } from '@/components/ThemeContext';
import { useNavBar } from '@/components/NavBarProvider';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Settings = () => {
  const [name, setName] = useState('');
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
      setName(String(jsonresult.name));
    };
    const fetchProfileImage = async () => {
      const image = await SecureStore.getItemAsync('image');
      if (image) setProfileImage(image);
    };

    fetchProfileImage();
    getUserDetails();
  }, []);

  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission denied", "You need to allow access to your photos to change your profile picture.");
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
      await SecureStore.setItemAsync('image', result.assets[0].uri);
      showToast('Profile picture updated successfully!', 'success');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout',
          onPress: async () => {
            try {
              const userResponse = await UserLogout();
              if (userResponse === 'Logged out successfully!') {
                await SecureStore.deleteItemAsync('UserData');
                setCurrentTab('Home');
                showToast(userResponse, 'success');
              } else {
                showToast(userResponse, 'error');
              }
            } catch (error) {
              console.error('Error logging out:', error);
              showToast('Failed to log out. Please try again.', 'error');
            }
          }
        },
      ],
      { cancelable: true }
    );
  };

  const showToast = (message, type) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={String(id)} variant="accent" action={type}>
          <ToastTitle>{message}</ToastTitle>
        </Toast>
      ),
    });
  };

  const data = [
    { title: 'My account', description: 'Make changes to your account', iconName: 'user', onPress: () => router.replace('/profile')},
    { title: 'Notifications', description: 'Manage your notifications', iconName: 'bell', onPress: () => router.push('set-notifications')},
    { title: 'Security', description: 'Enhance your security', iconName: 'shield', onPress: () => router.push('/set-security') },
    { title: 'Appearance', description: 'Customize your viewing experience', iconName: 'image', onPress: () => router.push('/set-appearance') },
    { title: 'FAQ', description: "View the community's FAQ", iconName: 'help-circle', onPress: () => router.push('faqpage') },
    { title: 'About and Help', description: "View the Ts & Cs and Privacy Policy", iconName: 'info', onPress: () => router.push('info') },
  ];

  const renderListItem = ({ item, index }) => (
    <Pressable
      onPress={item.onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        backgroundColor: currentTheme === 'dark' ? '#1A1A1A' : '#F0F0F0',
        borderRadius: 15,
        shadowColor: currentTheme === 'dark' ? '#000' : '#888',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Box style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: currentTheme === 'dark' ? '#333' : '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
      }}>
        <Icon as={Feather} name={item.iconName} size="xl" color={currentTheme === 'dark' ? '#FFF' : '#333'} />
      </Box>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: currentTheme === 'dark' ? '#FFF' : '#333',
          marginBottom: 4,
        }}>{item.title}</Text>
        <Text style={{
          fontSize: 14,
          color: currentTheme === 'dark' ? '#AAA' : '#666',
        }}>{item.description}</Text>
      </View>
      <Icon as={Ionicons} name="chevron-forward" size="lg" color={currentTheme === 'dark' ? '#AAA' : '#666'} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme === 'dark' ? '#000' : '#FFF' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <LinearGradient
          colors={currentTheme === 'dark' ? ['#1A1A1A', '#000'] : ['#F0F0F0', '#FFF']}
          style={{
            padding: 20,
            alignItems: 'center',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          <Pressable onPress={handleImageUpload} style={{
            width: width * 0.3,
            height: width * 0.3,
            borderRadius: width * 0.15,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
            <Image
              source={{ uri: profileImage }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: width * 0.15,
              }}
            />
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: currentTheme === 'dark' ? '#333' : '#FFF',
              borderRadius: 20,
              padding: 8,
            }}>
              <Icon as={MaterialIcons} name="camera-alt" size="md" color={currentTheme === 'dark' ? '#FFF' : '#333'} />
            </View>
          </Pressable>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: 5,
          }}>{name}</Text>
          
        </LinearGradient>

        <View style={{ padding: 20 }}>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {renderListItem({ item, index })}
            </React.Fragment>
          ))}
        </View>

        <Button
          onPress={handleLogout}
          style={{
            backgroundColor: currentTheme === 'dark' ? '#FF3B30' : '#007AFF',
            paddingVertical: 5,
            marginHorizontal: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            marginBottom: 10,
            borderRadius: 15,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Log out</Text>
        </Button>
      </ScrollView>
      <Navbar />
    </View>
  );
};

export default Settings;