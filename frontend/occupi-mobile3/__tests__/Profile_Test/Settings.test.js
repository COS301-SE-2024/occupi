import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Settings from '../../screens/Profile/Settings';
import { useNavigation, NavigationContainer } from '@react-navigation/native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      reset: jest.fn(),
    }),
  };
});

jest.mock('@gluestack-ui/themed', () => ({
  useTheme: jest.fn(() => ({ theme: 'light', toggleTheme: jest.fn() })),
  Switch: jest.fn(({ checked, onValueChange }) => (
    <switch onValueChange={onValueChange} value={checked} />
  )),
  Icon: jest.fn(({ name, fill }) => (
    <icon name={name} fill={fill} />
  )),
  Divider: jest.fn(({ style }) => (
    <divider style={style} />
  )),
  Box: jest.fn(({ data, renderItem, ItemSeparatorComponent }) => (
    <box>
      {data.map((item, index) => (
        <React.Fragment key={index}>
          {renderItem({ item })}
          {index < data.length - 1 && <ItemSeparatorComponent />}
        </React.Fragment>
      ))}
    </box>
  )),
}));

describe('Settings Component', () => {
  const renderSettings = () => (
    <NavigationContainer>
      <Settings />
    </NavigationContainer>
  );

  it('renders correctly', () => {
    const { getByText, getByAltText } = render(renderSettings());

    expect(getByAltText('logo')).toBeTruthy();
    expect(getByText('Sabrina Carpenter')).toBeTruthy();
    expect(getByText('Chief Executive Officer')).toBeTruthy();
    expect(getByText('Version 0.1.0')).toBeTruthy();
  });

  it('navigates to correct screen when list item is pressed', () => {
    const { getByText } = render(renderSettings());
    const navigation = useNavigation();

    fireEvent.press(getByText('My account'));
    expect(navigation.navigate).toHaveBeenCalledWith('AccountScreen');

    fireEvent.press(getByText('Privacy Policy'));
    expect(navigation.navigate).toHaveBeenCalledWith('PrivacyPolicyScreen');
  });

  it('toggles notifications correctly', () => {
    const { getByText, getByValue } = render(renderSettings());

    const notificationsToggle = getByValue(true); // assuming true is the initial value
    fireEvent(notificationsToggle, 'valueChange', false);

    expect(notificationsToggle.props.value).toBe(false);
  });

  it('toggles dark mode correctly', () => {
    const { getByText, getByValue } = render(renderSettings());
    const themeToggle = getByValue(false); // assuming false is the initial value

    fireEvent(themeToggle, 'valueChange', true);

    expect(themeToggle.props.value).toBe(true);
  });

  it('logs out correctly', async () => {
    const { getByText, getByAltText } = render(renderSettings());
    const navigation = useNavigation();

    fireEvent.press(getByText('Log out'));
    fireEvent.press(getByText('OK'));

    expect(AsyncStorage.clear).toHaveBeenCalled();
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'login' }],
    });
  });
});
