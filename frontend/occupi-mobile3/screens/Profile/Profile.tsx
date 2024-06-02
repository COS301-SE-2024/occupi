import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Radio, RadioGroup, RadioLabel, RadioIndicator, RadioIcon, VStack, CircleIcon, Icon, useColorMode } from "@gluestack-ui/themed";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const COLORS = {
  white: "#FFFFFF",
  black: "#000000",
  gray: "#BEBEBE",
  primary: "#3366FF",
};

const FONTS = {
  h3: { fontSize: 20, fontWeight: "bold" },
  body3: { fontSize: 16 },
};

const SIZES = {
  padding: 16,
  base: 8,
  radius: 8,
};



const Profile = () => {

  // this needs integration
  const [selectedGenderIndex, setSelectedGenderIndex] = useState(1);
  const [name, setName] = useState("Sabrina Carpenter");
  const [email, setEmail] = useState("u21546551@tuks.co.za");
  const [employeeId, setEmployeeId] = useState("21546551");
  const [phoneNumber, setPhoneNumber] = useState("011 101 1111");
  const [pronouns, setPronouns] = useState("she/her");
  const [date, setDate] = useState(new Date(2000, 6, 7));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

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
      "Profile Saved",
      `Name: ${name}\nDOB: ${date.toLocaleDateString()}\nGender: ${['Male', 'Female', 'N-Bin'][selectedGenderIndex]}\nEmail: ${email}\nEmployee ID: ${employeeId}\nPhone: ${phoneNumber}\nPronouns: ${pronouns}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Icon as={Feather} name="chevron-left" size="30" color={colorMode === 'dark' ? 'white' : 'black'} onPress={() => router.push('settings')} />
          <Text style={styles.headerTitle}>My account</Text>
          <MaterialIcons
            name="person-outline"
            size={24}
            color="black"
            style={styles.icon}
          />
        </View>

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Sabrina Carpenter"
          placeholderTextColor={COLORS.gray}
          placeholder={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Date of birth</Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.dateInputContainer}>
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          <MaterialIcons name="calendar-today" size={24} color="black" />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <Text style={styles.label}>Gender</Text>
        {/* <RadioGroup
          selectedIndex={selectedGenderIndex}
          onChange={(index) => setSelectedGenderIndex(index)}
          style={styles.radioGroup}
        >
          <RadioLabel>Male</RadioLabel>
          <RadioLabel>Female</RadioLabel>
          <RadioLabel>Non-Binary</RadioLabel>
        </RadioGroup> */}
        <RadioGroup mb="$4" onChange={(index) => setSelectedGenderIndex(index)}>
          <VStack flexDirection="$row" justifyContent="$space-between" space="$2">
            <Radio backgroundColor="#f2f2f2" borderRadius="$15" borderColor="$#f2f2f2" h="$12" px="$4">
              <RadioLabel color="$black">Male</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
            <Radio backgroundColor="#f2f2f2" borderRadius="$15" borderColor="$#f2f2f2" h="$12" px="$4">
              <RadioLabel color="$black">Female</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
            <Radio backgroundColor="#f2f2f2" borderRadius="$15" borderColor="$#f2f2f2" h="$12" px="$4"> 
              <RadioLabel color="$black">Other</RadioLabel>
              <RadioIndicator ml="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
          </VStack>
        </RadioGroup>


        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="**********@deloitte.co.za"
          placeholderTextColor={COLORS.gray}
          // value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          style={styles.input}
          placeholder="2******"
          placeholderTextColor={COLORS.gray}
          // placeholder={employeeId}
          onChangeText={setEmployeeId}
        />

        <Text style={styles.label}>Number</Text>
        <TextInput
          style={styles.input}
          placeholder="011 *** ****"
          placeholderTextColor={COLORS.gray}
          // placeholder={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Text style={styles.label}>Pronouns (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="she/her"
          placeholderTextColor={COLORS.gray}
          placeholder={pronouns}
          onChangeText={setPronouns}
        />

        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <LinearGradient
            colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SIZES.padding,
  },
  icon: {
    marginRight: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h3,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    color: COLORS.black,
    backgroundColor: "#f2f2f2"
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f2f2f2",
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    height: 44,
    backgroundColor: "#f2f2f2"
  },
  dateText: {
    flex: 1,
    color: COLORS.black,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding,
  },
  radio: {
    flex: 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    padding: 5,
    margin: 10, // Add this line
    backgroundColor: 'gray', // Add this line
},
  saveButton: {
    height: 50,
    borderRadius: 15,
    marginTop: SIZES.padding,
    overflow: "hidden",
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  saveButtonText: {
    color: 'darkslategrey', // Change this line
    ...FONTS.h3,
},
});

export default Profile;
