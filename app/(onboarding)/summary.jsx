import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SummaryScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('/(authenticated)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={48} color="#4F46E5" />
          </View>
        </View>

        <Text style={styles.title}>All Set!</Text>
        <Text style={styles.description}>
          Your personalized sleep plan is ready. Let's start improving your sleep quality!
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="moon" size={24} color="#4F46E5" />
            <Text style={styles.featureText}>Sleep Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="stats-chart" size={24} color="#4F46E5" />
            <Text style={styles.featureText}>Smart Insights</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="alarm" size={24} color="#4F46E5" />
            <Text style={styles.featureText}>Smart Alarms</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleStart}
      >
        <Text style={styles.buttonText}>Start Using SleepyAI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  checkmarkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 32,
  },
  featuresContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 48,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 