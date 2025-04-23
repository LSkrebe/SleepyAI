import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SleepGoalsScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState([]);

  // Concise and simplified sleep goals
  const sleepGoals = [
    {
      title: 'Sleep Quality & Duration',
      description: 'Improve sleep quality and duration',
      icon: 'star'
    },
    {
      title: 'Regular Sleep Schedule',
      description: 'Stick to a consistent sleep-wake cycle',
      icon: 'time'
    },
    {
      title: 'Fall Asleep & Stay Asleep',
      description: 'Fall asleep faster, stay asleep longer',
      icon: 'speedometer'
    },
    {
      title: 'Daytime Energy',
      description: 'Feel more alert and productive',
      icon: 'flash'
    }
  ];

  const toggleGoal = (goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleNext = () => {
    router.push('/(onboarding)/sleep_results');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What would you like to improve about your sleep?</Text>
        <Text style={styles.subheader}>Select your primary set of sleep goals to follow.</Text>

        {sleepGoals.map((goal, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.goalButton,
              selectedGoals.includes(goal.title) && styles.selectedGoal
            ]}
            onPress={() => toggleGoal(goal.title)}
          >
            <View style={styles.goalContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={goal.icon}
                  size={20} // Adjusted icon size
                  color={selectedGoals.includes(goal.title) ? '#4F46E5' : '#9CA3AF'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.goalTitle,
                  selectedGoals.includes(goal.title) && styles.selectedGoalText
                ]}>
                  {goal.title}
                </Text>
                <Text style={styles.goalDescription}>
                  {goal.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, selectedGoals.length === 0 && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={selectedGoals.length === 0}
      >
        <Text style={styles.buttonText}>Finish</Text>
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
  goalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'center',
    height: 80, // Fixed height for each option
  },
  selectedGoal: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
    borderWidth: 1,
  },
  goalContent: {
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
  goalTitle: {
    color: '#FFFFFF',
    fontSize: 16,  // Adjusted font size
    fontWeight: '600',
    marginBottom: 4,
  },
  goalDescription: {
    color: '#9CA3AF',
    fontSize: 12,  // Adjusted font size
  },
  selectedGoalText: {
    color: '#4F46E5',
  },
  button: {
    backgroundColor: '#34D399',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(52, 211, 153, 0.5)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
