import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
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
import { useColorScheme } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';
import LoadingGradientButton from '@/components/LoadingGradientButton';

const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  gray: '#BEBEBE',
  primary: '#3366FF',
};

const FONTS = {
  h3: { fontSize: 20, fontWeight: 'bold' },
  body3: { fontSize: 16 },
};

const SIZES = {
  padding: 16,
  base: 8,
  radius: 8,
};

const Profile = () => {
  const [selectedGenderIndex, setSelectedGenderIndex] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  let colorScheme = useColorScheme();
  const apiUrl = process.env.EXPO_PUBLIC_DEVELOP_API_URL;
  const getUserDetailsUrl= process.env.EXPO_PUBLIC_GET_USER_DETAILS;
  const updateDetailsUrl = process.env.EXPO_PUBLIC_UPDATE_USER_DETAILS;
  console.log(apiUrl, getUserDetailsUrl, updateDetailsUrl);

  useEffect(() => {
    const getUserDetails = async () => {
      let result = await SecureStore.getItemAsync('UserData');
      console.log("UserData:",result);
      // setUserDetails(JSON.parse(result).data);
      let jsonresult = JSON.parse(result);
      // console.log(jsonresult.data.details.name);
      setName(String(jsonresult?.data?.details?.name));
      setEmail(String(jsonresult?.data?.email));
      setEmployeeId(String(jsonresult?.data?.occupiId));
      setPhoneNumber(String(jsonresult?.data?.details?.contactNo));
      setPronouns(String(jsonresult?.data?.details?.pronouns));
      const dateString = jsonresult?.data?.details?.dob;
      const date = new Date(dateString);

      // Get the day, month, and year
      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are zero-based
      const year = date.getFullYear();

      // Format the date as MM/DD/YYYY
      const formatted = `${month}/${day}/${year}`;

      // Set the formatted date in the state
      setDate(formatted)

      // console.log(JSON.parse(result).data.details.name);
    };
    getUserDetails();
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const onSave = async () => {
    const body = {
      "email": email,
      "details": {
        "contactNo": phoneNumber,
        "gender": "Male",
        "name": name,
        "pronouns": pronouns
      }
    };
    // console.log(JSON.stringify(body));
    setIsLoading(true);
    try {
      let authToken = await SecureStore.getItemAsync('Token');
      const response = await fetch(`${apiUrl}${updateDetailsUrl}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
        body: JSON.stringify(body),
        credentials: "include"
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log(response);
        setIsLoading(false);
        alert('Details updated successfully');
      } else {
        console.log(data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
      // setResponse('An error occurred');
    }

    try {
      let authToken = await SecureStore.getItemAsync('Token');
      const response = await fetch(`${apiUrl}${getUserDetailsUrl}?email=${email}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok) {
        saveUserData(JSON.stringify(data));
        console.log(data);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  async function saveUserData(value) {
    await SecureStore.setItemAsync('UserData', value);
  }

  return (
    <SafeAreaView
      style={colorScheme === 'dark' ? styles.containerdark : styles.containerlight}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Icon
            as={Feather}
            name={"chevron-left"}
            size="xl"
            color={colorScheme === 'dark' ? 'white' : 'black'}
            testID="settings-link"
            onPress={() => router.replace('/settings')}
          />
          <Text style={[styles.headerTitle, colorScheme === 'dark' ? styles.textdark : styles.textlight]}>
            My account
          </Text>
          <MaterialIcons
            name="person-outline"
            size={24}
            color={colorScheme === 'dark' ? 'white' : 'black'}
            style={styles.icon}
          />
        </View>

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Full name</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          value={name}
          placeholderTextColor={COLORS.gray}
          onChangeText={setName}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Date of birth</Text>
        <TouchableOpacity
          onPress={showDatePicker}
          style={colorScheme === 'dark' ? styles.dateInputContainerdark : styles.dateInputContainerlight}
        >
          <Text style={colorScheme === 'dark' ? styles.dateTextdark : styles.dateTextlight}>
            {date}
          </Text>
          <MaterialIcons name="calendar-today" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Gender</Text>
        {/* <RadioGroup mb="$4" onChange={(index) => setSelectedGenderIndex(index)}>
          <VStack flexDirection="row" justifyContent="space-between" space="sm">
            <Radio
              backgroundColor={colorScheme === 'dark' ? '#5A5A5A' : '#f2f2f2'}
              borderRadius="$xl"
              borderColor="#f2f2f2"
              h={hp('5%')}
              px="$4"
            >
              <RadioLabel color={colorScheme === 'dark' ? 'white' : 'black'}>Male</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
            <Radio
              backgroundColor={colorScheme === 'dark' ? '#5A5A5A' : '#f2f2f2'}
              borderRadius="$xl"
              borderColor="#f2f2f2"
              h={hp('5%')}
              px="$4"
            >
              <RadioLabel color={colorScheme === 'dark' ? 'white' : 'black'}>Female</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
            <Radio
              backgroundColor={colorScheme === 'dark' ? '#5A5A5A' : '#f2f2f2'}
              borderRadius="$xl"
              borderColor="#f2f2f2"
              h={hp('5%')}
              px="$4"
            >
              <RadioLabel color={colorScheme === 'dark' ? 'white' : 'black'}>Other</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
          </VStack>
        </RadioGroup> */}

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Email Address</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder={email}
          placeholderTextColor={COLORS.gray}
          editable={false}
          onChangeText={setEmail}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Occupi ID</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder={employeeId}
          placeholderTextColor={COLORS.gray}
          editable={false}
          onChangeText={setEmployeeId}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Cell No</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          value={phoneNumber}
          placeholderTextColor={COLORS.gray}
          onChangeText={setPhoneNumber}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Pronouns (optional)</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          value={pronouns}
          placeholderTextColor={COLORS.gray}
          onChangeText={setPronouns}
        />
        {isLoading ? (
          <LoadingGradientButton />
        ) : (
          <GradientButton
            onPress={onSave}
            text="Save"
          />
        )
        }

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerlight: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  containerdark: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
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
  labeldark: {
    ...FONTS.body3,
    color: COLORS.white,
    marginBottom: SIZES.base,
  },
  labellight: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  inputdark: {
    height: 44,
    borderWidth: 1,
    borderColor: '#5A5A5A',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    color: COLORS.white,
    backgroundColor: '#5A5A5A',
  },
  inputlight: {
    height: 44,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    color: COLORS.black,
    backgroundColor: '#f2f2f2',
  },
  dateInputContainerdark: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5A5A5A',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    height: 44,
    color: COLORS.white,
    backgroundColor: '#5A5A5A',
  },
  dateInputContainerlight: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f2f2f2',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    height: 44,
    color: COLORS.black,
    backgroundColor: '#f2f2f2',
  },
  textdark: {
    color: COLORS.white,
  },
  textlight: {
    color: COLORS.black,
  },
  dateTextdark: {
    flex: 1,
    color: COLORS.white,
  },
  dateTextlight: {
    flex: 1,
    color: COLORS.black,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  saveButton: {
    height: 50,
    borderRadius: 15,
    marginTop: SIZES.padding,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'darkslategrey',
    ...FONTS.h3,
  },
});

export default Profile;
