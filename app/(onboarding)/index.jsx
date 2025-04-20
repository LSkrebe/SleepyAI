import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Onboarding() {
  const router = useRouter();

  const trustIndicators = [
    { icon: 'shield-checkmark', text: '100% Private Analysis' },
    { icon: 'medkit', text: 'Medical-Grade Assessment' },
    { icon: 'time', text: '2 Minute Completion' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>Tired of fighting sleep?</Text>
        <Text style={styles.subheadline}>
          Join 100,000+ others who transformed their sleep forever
        </Text>

        <View style={styles.trustContainer}>
          {trustIndicators.map((item, index) => (
            <View key={index} style={styles.trustItem}>
              <Ionicons name={item.icon} size={24} color="#4F46E5" />
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(onboarding)/sleep_time')}
      >
        <Text style={styles.buttonText}>Discover Your Sleep Score</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subheadline: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  trustContainer: {
    width: '100%',
    gap: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  trustText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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