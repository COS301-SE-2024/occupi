import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
  const [name, setName] = useState('Sabrina Carpenter');
  const [email, setEmail] = useState('sabrina@deloitte.co.za');
  const [employeeId, setEmployeeId] = useState('31115087');
  const [phoneNumber, setPhoneNumber] = useState('082 083 3988');
  const [pronouns, setPronouns] = useState('she/her');
  const [date, setDate] = useState(new Date(2000, 6, 7));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  let colorScheme = useColorScheme();

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

  const onSave = () => {
    Alert.alert(
      'Profile Saved',
      `Name: ${name}\nDOB: ${date.toLocaleDateString()}\nGender: ${
        ['Male', 'Female', 'N-Bin'][selectedGenderIndex]
      }\nEmail: ${email}\nEmployee ID: ${employeeId}\nPhone: ${phoneNumber}\nPronouns: ${pronouns}`
    );
  };

  return (
    <SafeAreaView
      style={colorScheme === 'dark' ? styles.containerdark : styles.containerlight}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Icon
            as={Feather}
            name="chevron-left"
            size="30"
            color={colorScheme === 'dark' ? 'white' : 'black'}
            onPress={() => router.push('/settings')}
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
          placeholder={name}
          placeholderTextColor={COLORS.gray}
          onChangeText={setName}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Date of birth</Text>
        <TouchableOpacity
          onPress={showDatePicker}
          style={colorScheme === 'dark' ? styles.dateInputContainerdark : styles.dateInputContainerlight}
        >
          <Text style={colorScheme === 'dark' ? styles.dateTextdark : styles.dateTextlight}>
            {date.toLocaleDateString()}
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
        <RadioGroup mb="$4" onChange={(index) => setSelectedGenderIndex(index)}>
          <VStack flexDirection="row" justifyContent="space-between" space="$2">
            <Radio
              backgroundColor={colorScheme === 'dark' ? '#5A5A5A' : '#f2f2f2'}
              borderRadius="$15"
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
              borderRadius="$15"
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
              borderRadius="$15"
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
        </RadioGroup>

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Email Address</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder={email}
          placeholderTextColor={COLORS.gray}
          onChangeText={setEmail}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Employee ID</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder={employeeId}
          placeholderTextColor={COLORS.gray}
          onChangeText={setEmployeeId}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Number</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder={phoneNumber}
          placeholderTextColor={COLORS.gray}
          onChangeText={setPhoneNumber}
        />

        <Text style={colorScheme === 'dark' ? styles.labeldark : styles.labellight}>Pronouns (optional)</Text>
        <TextInput
          style={colorScheme === 'dark' ? styles.inputdark : styles.inputlight}
          placeholder="she/her"
          placeholderTextColor={COLORS.gray}
          onChangeText={setPronouns}
        />

        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <LinearGradient
            colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
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
