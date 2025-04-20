import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SleepBasicsScreen() {
  const router = useRouter();
  const [bedtimeWindow, setBedtimeWindow] = useState('');

  const bedtimeOptions = [
    {
      title: 'Before 11 PM',
      description: 'Early bedtime',
      icon: 'time-outline',
    },
    {
      title: '11 PM–1 AM',
      description: 'Late bedtime',
      icon: 'cloudy-night-outline',
    },
    {
      title: 'After 1 AM',
      description: 'Very late sleeper',
      icon: 'partly-sunny-outline',
    },
    {
      title: 'Varies often',
      description: 'Inconsistent schedule',
      icon: 'shuffle-outline',
    },
  ];

  const handleNext = () => {
    router.push('/(onboarding)/sleep_quality');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '28%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>What is your typical bedtime?</Text>
        <Text style={styles.subheader}>
          Select your most common bedtime window.
        </Text>

        {bedtimeOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              bedtimeWindow === option.title && styles.selectedCard
            ]}
            onPress={() => setBedtimeWindow(option.title)}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={bedtimeWindow === option.title ? '#4F46E5' : '#9CA3AF'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    bedtimeWindow === option.title && styles.selectedText
                  ]}
                >
                  {option.title}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !bedtimeWindow && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!bedtimeWindow}
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
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
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
  subheader: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'center',
    height: 80,
  },
  selectedCard: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  selectedText: {
    color: '#4F46E5',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(79, 70, 229, 0.5)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
