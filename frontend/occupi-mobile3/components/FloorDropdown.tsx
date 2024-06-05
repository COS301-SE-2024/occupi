// DropdownExample.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useTheme, Icon, ChevronDownIcon } from '@gluestack-ui/themed';

export const theme = {
  colors: {
    primary: 'lightgrey',
    secondary: '#03dac6',
    background: '#f6f6f6',
    surface: '#ffffff',
    error: '#b00020',
    text: '#000000',
    // Add more colors as needed
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    // Add more spacing as needed
  },
  fontSizes: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    // Add more font sizes as needed
  },
  // Add more theme properties as needed
};

const FloorDropdown = () => {
  const [selectedValue, setSelectedValue] = useState("");

  return (
    <View>
      <RNPickerSelect
        onValueChange={(value) => setSelectedValue(value)}
        items={[
          { label: 'Floor 1', value: 'Floor 1' },
          { label: 'Floor 2', value: 'Floor 2' },
          { label: 'Floor 3', value: 'Floor 3' },
          { label: 'Floor 4', value: 'Floor 4' },
          { label: 'Floor 5', value: 'Floor 5' },
          { label: 'Floor 6', value: 'Floor 6' },
          { label: 'Floor 7', value: 'Floor 7' },
          { label: 'Floor 8', value: 'Floor 8' },
        ]}
        placeholder={{ label: 'Select a floor', value: null, color: theme.colors.primary }}
        style={{
          inputIOS: {
            placeholder: "floor",
            fontSize: 16,
            paddingVertical: 8,
            paddingHorizontal: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: 10,
            color: theme.colors.text,
            paddingRight: 30, // to ensure the text is never behind the icon
          },
          inputAndroid: {
            fontSize: theme.fontSizes.md,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: 4,
            color: theme.colors.text,
            paddingRight: 30, // to ensure the text is never behind the icon
          },
        }}
        Icon={() => {
          return <Icon as={ChevronDownIcon} m="$2" w="$4" h="$4" alignSelf="center"/>;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    marginBottom: 10,
  },
  selectedValue: {
    marginTop: 20,
  },
});

export default FloorDropdown;
