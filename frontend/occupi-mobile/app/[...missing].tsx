import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { StyledProvider } from '@gluestack-style/react'; // Import StyledProvider

export default function NotFoundScreen() {
  return (
    <StyledProvider config={{}}> {/* Pass an empty object as the config */}
      <>
        <Stack.Screen options={{ title: 'Oops!' }} />
        <View style={styles.container}>
          <Text style={styles.title}>This screen doesn't exist.</Text>
          <Link href="/" style={styles.link}>
            <Text style={styles.linkText}>Go to home screen!</Text>
          </Link>
        </View>
      </>
    </StyledProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
