import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Alert } from 'react-native';
import { Icon, Layout, Toggle, List, ListItem, Divider } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
// import { useTheme } from '../../app/_layout';
import { useTheme, ChevronDownIcon } from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [doNotDisturbEnabled, setDoNotDisturbEnabled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleDoNotDisturb = () => {
    setDoNotDisturbEnabled(!doNotDisturbEnabled);
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'login' }],
            });
          }
        }
      ]
    );
  };

  const renderItemIcon = (props, name) => (
    <Icon {...props} name={name} />
  );

  const renderItemAccessory = (props) => (checked, onChange) => (
    <Toggle {...props} checked={checked} onChange={onChange} />
  );

  const renderListItem = ({ item }) => (
    <ListItem
      style={[styles.listItem, theme === 'dark' ? styles.darkItem : styles.lightItem]}
      title={item.title}
      description={item.description}
      accessoryLeft={(props) => renderItemIcon(props, item.iconName)}
      accessoryRight={(props) => (
        <View style={styles.itemRight}>
          {item.accessoryRight ? item.accessoryRight(props) : <Icon name="arrow-ios-forward-outline" fill={theme === 'dark' ? '#fff' : 'black'} style={styles.arrowIcon} />}
        </View>
      )}
      onPress={item.onPress}
    />
  );

  const data = [
    { title: 'My account', description: 'Make changes to your account', iconName: 'person-outline', onPress: () => handleNavigate('AccountScreen') },
    { title: 'Notifications', description: 'Manage your notifications', iconName: 'bell-outline', accessoryRight: (props) => renderItemAccessory(props)(notificationsEnabled, toggleNotifications) },
    { title: 'Privacy Policy', description: 'View privacy policy', iconName: 'lock-outline', onPress: () => handleNavigate('PrivacyPolicyScreen') },
    { title: 'Security', description: 'Enhance your security', iconName: 'shield-outline', onPress: () => handleNavigate('SecurityScreen') },
    { title: 'Dark mode', description: 'Enable or disable dark mode', iconName: 'bulb-outline', accessoryRight: (props) => renderItemAccessory(props)(theme === 'dark', toggleTheme) },
    { title: 'Terms and Policies', description: 'View terms and policies', iconName: 'file-text-outline', onPress: () => handleNavigate('TermsPoliciesScreen') },
    { title: 'Report a problem', description: 'Report any issues', iconName: 'alert-circle-outline', onPress: () => handleNavigate('ReportProblemScreen') },
    { title: 'Support', description: 'Get support', iconName: 'headphones-outline', onPress: () => handleNavigate('SupportScreen') },
    { title: 'Log out', description: 'Log out from your account', iconName: 'log-out-outline', onPress: handleLogout },
    { title: 'About and Help', description: '', iconName: 'question-mark-circle-outline', onPress: () => handleNavigate('AboutHelpScreen') },
  ];

  return (
    <ScrollView style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <Layout style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.profileImage} 
          />
          <Icon name='camera-outline' style={styles.cameraIcon} fill={theme === 'dark' ? '#fff' : 'black'} />
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={[styles.profileName, theme === 'dark' ? styles.darkText : styles.lightText]}>Sabrina Carpenter</Text>
            <Icon name='edit-outline' style={styles.editIcon} fill={theme === 'dark' ? '#fff' : '#8F9BB3'} onPress={() => handleNavigate('EditProfileScreen')}/>
          </View>
          <Text style={[styles.profileTitle, theme === 'dark' ? styles.darkText : styles.lightText]}>Chief Executive Officer</Text>
        </View>
      </Layout>
      <Divider style={theme === 'dark' ? styles.darkDivider : styles.lightDivider} />
      <List
        data={data}
        ItemSeparatorComponent={() => <Divider style={theme === 'dark' ? styles.darkDivider : styles.lightDivider} />}
        renderItem={renderListItem}
      />
      <Layout style={styles.footerContainer}>
        <Text style={[styles.versionText, theme === 'dark' ? styles.darkText : styles.lightText]}>Version 0.1.0</Text>
      </Layout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 24,
    height: 24,
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
    fontSize: 25,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 14,
  },
  lightText: {
    color: 'black',
  },
  darkText: {
    color: '#fff',
  },
  editIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
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
});

export default Settings;
