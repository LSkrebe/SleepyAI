import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

export default function PreferencesScreen() {
  const router = useRouter();

  // Disable the back button on Android
  useEffect(() => {
    const backAction = () => {
      return false;  // Returning true prevents the back action
    };

    // Adding event listener for back button press
    BackHandler.addEventListener('hardwareBackPress', backAction);

    // Cleanup the event listener when the component unmounts
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  const handleNext = () => {
    router.push('/(onboarding)/paywall');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Header simplified, no back arrow or progress bar */}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Sleep Quality Analysis Results</Text>
        {/* TO DO */}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20, // Adjusted for no back arrow or progress bar
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
