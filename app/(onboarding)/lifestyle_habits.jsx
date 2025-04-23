import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LifestyleHabitsScreen() {
  const router = useRouter();
  const [selectedHabits, setSelectedHabits] = useState([]);

  const lifestyleHabits = [
    {
      title: 'Caffeine & Alcohol',
      description: 'Coffee, tea, energy drinks',
      icon: 'cafe'
    },
    {
      title: 'Exercise & Activity',
      description: 'Physical activity',
      icon: 'fitness'
    },
    {
      title: 'Screen Time',
      description: 'Device usage before bed',
      icon: 'phone-portrait'
    },
    {
      title: 'Stress & Relaxation',
      description: 'Work, personal stress',
      icon: 'heart'
    }
  ];

  const toggleHabit = (habit) => {
    setSelectedHabits(prev =>
      prev.includes(habit)
        ? prev.filter(h => h !== habit)
        : [...prev, habit]
    );
  };

  const handleNext = () => {
    router.push('/(onboarding)/summary');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '86%' }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>What affects your daily routine?</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.description}>
            Select habits that impact your sleep
          </Text>
        </View>

        {lifestyleHabits.map((habit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              selectedHabits.includes(habit.title) && styles.selectedCard
            ]}
            onPress={() => toggleHabit(habit.title)}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={habit.icon}
                  size={20}
                  color={selectedHabits.includes(habit.title) ? '#3B82F6' : '#94A3B8'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    selectedHabits.includes(habit.title) && styles.selectedText
                  ]}
                >
                  {habit.title}
                </Text>
                <Text style={styles.optionDescription}>{habit.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, selectedHabits.length === 0 && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={selectedHabits.length === 0}
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
    fontSize: 24,
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
  },
  optionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'center',
    height: 80,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  selectedCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  selectedText: {
    color: '#3B82F6',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
