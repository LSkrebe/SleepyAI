import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LifestyleHabitsScreen() {
  const router = useRouter();
  const [selectedHabits, setSelectedHabits] = useState([]);

  // Concise version of the habits
  const lifestyleHabits = [
    {
      title: 'Caffeine & Alcohol',
      description: 'Consuming caffeinated drinks or alcohol before bed',
      icon: 'cafe'
    },
    {
      title: 'Exercise & Stress',
      description: 'Physical activity or high stress levels before bed',
      icon: 'fitness'
    },
    {
      title: 'Diet & Eating',
      description: 'Late meals or irregular eating patterns',
      icon: 'nutrition'
    },
    {
      title: 'Work & Environment',
      description: 'Shift work or poor sleep environment',
      icon: 'time'
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
    router.push('/(onboarding)/sleep_goals');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '85%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>How do your daily habits affect sleep?</Text>
        <Text style={styles.description}>
          Select the habits that impact your sleep quality.
        </Text>

        {lifestyleHabits.map((habit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.habitButton,
              selectedHabits.includes(habit.title) && styles.selectedHabit
            ]}
            onPress={() => toggleHabit(habit.title)}
          >
            <View style={styles.habitContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={habit.icon}
                  size={20} // Adjusted icon size
                  color={selectedHabits.includes(habit.title) ? '#4F46E5' : '#9CA3AF'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.habitTitle,
                  selectedHabits.includes(habit.title) && styles.selectedHabitText
                ]}>
                  {habit.title}
                </Text>
                <Text style={styles.habitDescription}>
                  {habit.description}
                </Text>
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
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  habitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'center',
    height: 80, // Fixed height for each option
  },
  selectedHabit: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
    borderWidth: 1,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,  // Smaller icon size
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  habitTitle: {
    color: '#FFFFFF',
    fontSize: 16,  // Adjusted font size
    fontWeight: '600',
    marginBottom: 4,
  },
  habitDescription: {
    color: '#9CA3AF',
    fontSize: 12,  // Adjusted font size
  },
  selectedHabitText: {
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
