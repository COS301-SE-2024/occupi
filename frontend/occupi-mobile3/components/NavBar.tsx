import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@gluestack-ui/themed';

const NavBar = () => {
  return (
    <View style={styles.container}>
      <Button style={styles.button} title="Home" />
      <Button style={styles.button} title="Search" />
      <Button style={styles.button} title="Notifications" />
      <Button style={styles.button} title="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  button: {
    flex: 1,
  },
});

export default NavBar;
