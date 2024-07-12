import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import {
  Icon,
  View,
  Text
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { useColorScheme, Switch } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';

const FONTS = {
  h3: { fontSize: 20, fontWeight: 'bold' },
  body3: { fontSize: 16 },
};

const SIZES = {
  padding: 16,
  base: 8,
  radius: 8,
};

const Notifications = () => {
  let colorScheme = useColorScheme();
  //retrieve user settings ad assign variables accordingly
  const [isEnabled1, setIsEnabled1] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [isEnabled3, setIsEnabled3] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const toggleSwitch1 = () => {
    setIsEnabled1(previousState => !previousState)
    setIsSaved(false);
  };
  const toggleSwitch2 = () => {
    setIsEnabled2(previousState => !previousState)
    setIsSaved(false);
  };
  const toggleSwitch3 = () => {
    setIsEnabled3(previousState => !previousState)
    setIsSaved(false);
  };

  const onSave = () => {
      //integration here
  };

  const handleBack = () => {
    if (isSaved === false) {
      Alert.alert(
        'Save Changes',
        'You have unsaved changes. Would you like to save them?',
        [
          {
            text: 'Leave without saving',
            onPress: () => router.back(),
            style: 'cancel',
          },
          { text: 'Save', onPress: () =>onSave() },
        ],
        { cancelable: false }
      );
    }
    else {
      router.back();
    }
  }

  return (
    <View flex={1} backgroundColor={colorScheme === 'dark' ? 'black' : 'white'} px="$4" pt="$16">
      <View style={styles.header}>
        <Icon
          as={Feather}
          name="chevron-left"
          size="xl"
          color={colorScheme === 'dark' ? 'white' : 'black'}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle} color={colorScheme === 'dark' ? 'white' : 'black'}>
          Notifications
        </Text>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={colorScheme === 'dark' ? 'white' : 'black'}
          style={styles.icon}
        />
      </View>

      <View flexDirection="column">
        <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
          <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Notify when someone invites me</Text>
          <Switch
            trackColor={{false: 'lightgray', true: 'lightgray'}}
            thumbColor={isEnabled1 ? 'greenyellow' : 'white'}
            ios_backgroundColor="lightgray"
            onValueChange={toggleSwitch1}
            value={isEnabled1}
          />
        </View>
        <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14}  backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
          <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Notify 15 minutes before booking time</Text>
          <Switch
            trackColor={{false: 'lightgray', true: 'lightgray'}}
            thumbColor={isEnabled2 ? 'greenyellow' : 'white'}
            ios_backgroundColor="lightgray"
            onValueChange={toggleSwitch2}
            value={isEnabled2}
          />
        </View>
        <View my="$2" h="$12" justifyContent="space-between" alignItems="center" flexDirection="row" px="$3" borderRadius={14}  backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
          <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Notify when building is full</Text>
          <Switch
            trackColor={{false: 'lightgray', true: 'lightgray'}}
            thumbColor={isEnabled3 ? 'greenyellow' : 'white'}
            ios_backgroundColor="lightgray"
            onValueChange={toggleSwitch3}
            value={isEnabled3}
          />
        </View>
      </View>
      <View position="absolute" left={0} right={0} bottom={36}>
        <GradientButton
          onPress={onSave}
          text="Save"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  icon: {
    marginRight: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h3,
  },

});

export default Notifications;
