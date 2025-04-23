import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Moon, Activity, BellRing, Brain } from 'lucide-react-native';

export default function SummaryScreen() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/(onboarding)/paywall');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Ready to improve your sleep?</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.description}>
            Based on your preferences, we'll create a personalized sleep plan
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          {[
            {
              title: 'Sleep Schedule',
              description: "We'll help you establish a consistent sleep routine",
              icon: Moon
            },
            {
              title: 'Sleep Tracking',
              description: 'Monitor your sleep patterns and progress',
              icon: Activity
            },
            {
              title: 'Smart Alarms',
              description: 'Wake up at the optimal time in your sleep cycle',
              icon: BellRing
            },
            {
              title: 'Sleep Tips',
              description: 'Get customized recommendations based on your habits',
              icon: Brain
            }
          ].map((feature, index) => (
            <View
              key={index}
              style={styles.summaryCard}
            >
              <View style={styles.summaryHeader}>
                <feature.icon size={24} color="#3B82F6" />
                <Text style={styles.summaryTitle}>
                  {feature.title.split(' ').join('\n')}
                </Text>
              </View>
              <Text style={styles.summaryText}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleComplete}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  header: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 2,
    marginTop: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  titleDecoration: {
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8, // Slightly reduced margin to accommodate multi-line title
  },
  summaryTitle: {
    color: '#E2E8F0',
    fontSize: 16, // Slightly reduced font size for multi-line title
    fontWeight: '600',
    lineHeight: 18, // Adjusted line height for better spacing
  },
  summaryText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3DD5AB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});