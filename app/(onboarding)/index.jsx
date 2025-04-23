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
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <View style={styles.headerGlow} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.headline}>Tired of fighting sleep?</Text>
            <View style={styles.titleDecoration} />
            <Text style={styles.subheadline}>
              Join 100,000+ others who transformed their sleep forever
            </Text>
          </View>
        </View>

        <View style={styles.trustContainer}>
          {trustIndicators.map((item, index) => (
            <View key={index} style={styles.trustItem}>
              <View style={styles.trustIconContainer}>
                <Ionicons name={item.icon} size={24} color="#3B82F6" />
              </View>
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(onboarding)/sleep_time')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'visible',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  headerGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    opacity: 0.1,
    transform: [{ scale: 1.5 }],
  },
  titleContainer: {
    position: 'relative',
    zIndex: 2,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(226, 232, 240, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleDecoration: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  subheadline: {
    fontSize: 18,
    color: '#94A3B8',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  trustContainer: {
    width: '100%',
    gap: 16,
    marginTop: 40,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    gap: 12,
  },
  trustIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  trustText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3B82F6',
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