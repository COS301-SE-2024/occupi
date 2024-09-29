import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Pressable,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import {
  Radio,
  RadioGroup,
  RadioLabel,
  RadioIndicator,
  RadioIcon,
  VStack,
  CircleIcon,
  Icon,
} from '@gluestack-ui/themed';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { router } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';
import LoadingGradientButton from '@/components/LoadingGradientButton';
import { useTheme } from '@/components/ThemeContext';
import { extractDateFromTimestamp } from '@/utils/utils';
import { Toast, useToast, ToastTitle } from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { updateDetails } from '@/utils/user';

const Profile = () => {
  const [selectedGenderIndex, setSelectedGenderIndex] = useState('Male');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('OCCUPI20242417');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const toast = useToast();

  useEffect(() => {
    const getUserDetails = async () => {
      let result = await SecureStore.getItemAsync('UserData');
      console.log(result);
      const email = await SecureStore.getItemAsync('Email');
      let user = JSON.parse(result);
      setName(user?.name);
      setEmail(email);
      setEmployeeId(user?.employeeid);
      setPhoneNumber(user?.number);
      setPronouns(user?.pronouns);
      setSelectedGenderIndex(user?.gender);
      const dateString = user?.dob;

      const [datePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const formatted = dateString.split('T')[0];
      console.log(dateString);
      setDate(formatted);
    };
    getUserDetails();
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate: string) => {
    setDate(extractDateFromTimestamp(selectedDate));
    hideDatePicker();
  };

  const onSave = async () => {
    const response = await updateDetails(name, date, selectedGenderIndex, phoneNumber, pronouns);
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={String(id)} variant="accent" action={response === "Details updated successfully" ? 'success' : 'error'}>
          <ToastTitle>{response}</ToastTitle>
        </Toast>
      ),
    });
  };

  const handleBack = () => {
    if (name 
      || date 
      || selectedGenderIndex 
      || phoneNumber 
      || pronouns
    ) {
      Alert.alert(
        'Save Changes',
        'You have unsaved changes. Would you like to save them?',
        [
          {
            text: 'Leave',
            onPress: () => router.replace('/settings'),
            style: 'cancel',
          },
          { text: 'Save', onPress: () => onSave() },
        ],
        { cancelable: false }
      );
    } else {
      router.back();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme === 'dark' ? '#000' : '#FFF' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={currentTheme === 'dark' ? ['#1A1A1A', '#000'] : ['#F0F0F0', '#FFF']}
          style={{
            paddingTop: hp('3%'),
            paddingHorizontal: wp('4%'),
            paddingBottom: hp('1%'),
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: hp('2%'),
          }}>
             <TouchableOpacity onPress={handleBack} style={{ padding: 10 }}>
              <Icon
                as={Feather}
                name="chevron-left"
                size="xl"
                color={currentTheme === 'dark' ? 'white' : 'black'}
                testID="back-button"
              />
            </TouchableOpacity>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: currentTheme === 'dark' ? 'white' : 'black',
            }}>
              My Account
            </Text>
            <Icon
              as={MaterialIcons}
              name="person-outline"
              size="xl"
              color={currentTheme === 'dark' ? 'white' : 'black'}
            />
          </View>
        </LinearGradient>

        <View style={{ padding: wp('4%') }}>
          {/* Full Name */}
          <Text style={{
            fontSize: wp('4.5%'),
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: hp('1%'),
          }}>Full name</Text>
          <TextInput
            style={{
              height: 44,
              borderWidth: 1,
              borderColor: currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2',
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
              color: currentTheme === 'dark' ? '#FFF' : '#333',
              backgroundColor: currentTheme === 'dark' ? '#333' : '#F0F0F0',
            }}
            value={name}
            placeholderTextColor="#AAA"
            onChangeText={setName}
          />

          {/* Date of Birth */}
          <Text style={{
            fontSize: wp('4.5%'),
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: hp('1%'),
          }}>Date of birth</Text>
          <TouchableOpacity onPress={showDatePicker} style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2',
            borderRadius: 8,
            paddingHorizontal: 16,
            marginBottom: 16,
            height: 44,
            backgroundColor: currentTheme === 'dark' ? '#333' : '#F0F0F0',
          }}>
            <Text style={{ flex: 1, color: currentTheme === 'dark' ? '#FFF' : '#333' }}>{date}</Text>
            <MaterialIcons name="calendar-today" size={24} color={currentTheme === 'dark' ? '#FFF' : '#333'} />
          </TouchableOpacity>
          <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirm} onCancel={hideDatePicker} />

          {/* Gender */}
          <Text style={{
            fontSize: wp('4.5%'),
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: hp('1%'),
          }}>Gender</Text>
          <RadioGroup value={selectedGenderIndex} onChange={setSelectedGenderIndex}>
            <VStack flexDirection="row" justifyContent="space-between" space="sm">
              {['Male', 'Female', 'Other'].map((gender) => (
                <Radio key={gender} value={gender} borderRadius="$xl" h={hp('5%')} px="$4"
                  backgroundColor={currentTheme === 'dark' ? '#333' : '#F0F0F0'}>
                  <RadioLabel color={currentTheme === 'dark' ? '#FFF' : '#333'}>{gender}</RadioLabel>
                  <RadioIndicator ml="$2">
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                </Radio>
              ))}
            </VStack>
          </RadioGroup>

          {/* Email Address */}
          <Text style={{
            fontSize: wp('4.5%'),
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: hp('1%'),
          }}>Email Address</Text>
          <TextInput
            style={{
              height: 44,
              borderWidth: 1,
              borderColor: currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2',
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
              color: currentTheme === 'dark' ? '#FFF' : '#333',
              backgroundColor: currentTheme === 'dark' ? '#333' : '#F0F0F0',
            }}
            placeholder={email}
            editable={false}
          />

          {/* Occupi ID */}
          <Text style={{
            fontSize: wp('4.5%'),
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: hp('1%'),
          }}>Occupi ID</Text>
          <TextInput
            style={{
              height: 44,
              borderWidth: 1,
              borderColor: currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2',
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
              color: currentTheme === 'dark' ? '#FFF' : '#333',
              backgroundColor: currentTheme === 'dark' ? '#333' : '#F0F0F0',
            }}
            placeholder={employeeId}
            editable={false}
          />

          {/* Cell Number */}
          <Text style={{
            fontSize: wp('4.5%'),
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: hp('1%'),
          }}>Cell No</Text>
          <TextInput
            style={{
              height: 44,
              borderWidth: 1,
              borderColor: currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2',
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
              color: currentTheme === 'dark' ? '#FFF' : '#333',
              backgroundColor: currentTheme === 'dark' ? '#333' : '#F0F0F0',
            }}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          {/* Pronouns */}
          <Text style={{
            fontSize: wp('4.5%'),
            color: currentTheme === 'dark' ? '#FFF' : '#333',
            marginBottom: hp('1%'),
          }}>Pronouns (optional)</Text>
          <TextInput
            style={{
              height: 44,
              borderWidth: 1,
              borderColor: currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2',
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
              color: currentTheme === 'dark' ? '#FFF' : '#333',
              backgroundColor: currentTheme === 'dark' ? '#333' : '#F0F0F0',
            }}
            value={pronouns}
            onChangeText={setPronouns}
          />

          {/* Save Button */}
          {isLoading ? <LoadingGradientButton /> : <GradientButton onPress={onSave} text="Save" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
