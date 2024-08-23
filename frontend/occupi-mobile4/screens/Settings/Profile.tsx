import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
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
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';
import LoadingGradientButton from '@/components/LoadingGradientButton';
import { useTheme } from '@/components/ThemeContext';
import { extractDateFromTimestamp } from '@/utils/utils';
import { Toast, useToast } from '@gluestack-ui/themed';
import { ToastTitle } from '@gluestack-ui/themed';
import { updateDetails } from '@/utils/user';

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
  const [selectedGenderIndex, setSelectedGenderIndex] = useState('Male');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('OCCUPI20242417');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const colorscheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorscheme : theme;
  const toast = useToast();
  // console.log(apiUrl, getUserDetailsUrl, updateDetailsUrl);

  useEffect(() => {
    const getUserDetails = async () => {
      let result = await SecureStore.getItemAsync('UserData');
      console.log(result);
      const email =  await SecureStore.getItemAsync('Email');
  
      let user = JSON.parse(result);
      setName(String(user?.name));
      setEmail(String(email));
      setEmployeeId(String(user?.employeeid));
      setPhoneNumber(String(user?.number));
      setPronouns(String(user?.pronouns));
      setSelectedGenderIndex(String(user?.gender))
      const dateString = user?.dob;
      console.log('dateee',dateString);

      // Manually parse the date string
      const [datePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);

      // Create a new Date object
      const date = new Date(year, month, day);
      console.log(date.getDate());

      // Get the day, month, and year
      const formattedDay = date.getDate();
      const formattedMonth = date.getMonth(); // Months are zero-based
      const formattedYear = date.getFullYear();

      // Format the date as MM/DD/YYYY
      const formatted = `${formattedYear}-${formattedMonth}-${formattedDay}`;
      // console.log(formatted);

      // Set the formatted date in the state
      setDate(formatted);
    };
    getUserDetails();
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate: string) => {
    console.log('selected',extractDateFromTimestamp(selectedDate));
    setDate(extractDateFromTimestamp(selectedDate));
    hideDatePicker();
  };


  const onSave = async () => {
    const response = await updateDetails(name,date,selectedGenderIndex,phoneNumber,pronouns)
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <Toast nativeID={String(id)} variant="accent" action={response === "Details updated successfully" ? 'success' : 'error'}>
            <ToastTitle>{response}</ToastTitle>
          </Toast>
        );
      },
    });
  };


  return (
    <SafeAreaView
      style={currentTheme === 'dark' ? styles.containerdark : styles.containerlight}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Icon
            as={Feather}
            name={"chevron-left"}
            size="xl"
            color={currentTheme === 'dark' ? 'white' : 'black'}
            onPress={() => router.replace('/settings')}
          />
          <Text style={[styles.headerTitle, currentTheme === 'dark' ? styles.textdark : styles.textlight]}>
            My account
          </Text>
          <MaterialIcons
            name="person-outline"
            size={24}
            color={currentTheme === 'dark' ? 'white' : 'black'}
            style={styles.icon}
          />
        </View>

        <Text style={currentTheme === 'dark' ? styles.labeldark : styles.labellight}>Full name</Text>
        <TextInput
          style={currentTheme === 'dark' ? styles.inputdark : styles.inputlight}
          value={name}
          placeholderTextColor={COLORS.gray}
          onChangeText={setName}
        />

        <Text style={currentTheme === 'dark' ? styles.labeldark : styles.labellight}>Date of birth</Text>
        <TouchableOpacity
          onPress={showDatePicker}
          style={currentTheme === 'dark' ? styles.dateInputContainerdark : styles.dateInputContainerlight}
        >
          <Text style={currentTheme === 'dark' ? styles.dateTextdark : styles.dateTextlight}>
            {date}
          </Text>
          <MaterialIcons name="calendar-today" size={24} color={currentTheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <Text style={currentTheme === 'dark' ? styles.labeldark : styles.labellight}>Gender</Text>
        <RadioGroup mb="$4" value={selectedGenderIndex} onChange={(index) => setSelectedGenderIndex(index)}>
          <VStack flexDirection="row" justifyContent="space-between" space="sm">
            <Radio
              backgroundColor={currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2'}
              value={"Male"}
              borderRadius="$xl"
              borderColor="#f2f2f2"
              h={hp('5%')}
              px="$4"

            >
              <RadioLabel color={currentTheme === 'dark' ? 'white' : 'black'}>Male</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
            <Radio
              backgroundColor={currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2'}
              value={"Female"}
              borderRadius="$xl"
              borderColor="#f2f2f2"
              h={hp('5%')}
              px="$4"
            >
              <RadioLabel color={currentTheme === 'dark' ? 'white' : 'black'}>Female</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
            <Radio
              backgroundColor={currentTheme === 'dark' ? '#5A5A5A' : '#f2f2f2'}
              borderRadius="$xl"
              value={"Other"}
              borderColor="#f2f2f2"
              h={hp('5%')}
              px="$4"
            >
              <RadioLabel color={currentTheme === 'dark' ? 'white' : 'black'}>Other</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
          </VStack>
        </RadioGroup>
        <Text style={currentTheme === 'dark' ? styles.labeldark : styles.labellight}>Email Address</Text>
        <TextInput
          style={currentTheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder={email}
          placeholderTextColor={COLORS.gray}
          editable={false}
          onChangeText={setEmail}
        />

        <Text style={currentTheme === 'dark' ? styles.labeldark : styles.labellight}>Occupi ID</Text>
        <TextInput
          style={currentTheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder={employeeId}
          placeholderTextColor={COLORS.gray}
          editable={false}
          onChangeText={setEmployeeId}
        />

        <Text style={currentTheme === 'dark' ? styles.labeldark : styles.labellight}>Cell No</Text>
        <TextInput
          style={currentTheme === 'dark' ? styles.inputdark : styles.inputlight}
          value={phoneNumber}
          placeholderTextColor={COLORS.gray}
          onChangeText={setPhoneNumber}
        />

        <Text style={currentTheme === 'dark' ? styles.labeldark : styles.labellight}>Pronouns (optional)</Text>
        <TextInput
          style={currentTheme === 'dark' ? styles.inputdark : styles.inputlight}
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
