import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CircadianRhythmScreen() {
  const router = useRouter();
  const [selectedChronotype, setSelectedChronotype] = useState(null);

  const chronotypes = [
    {
      title: 'Early Bird',
      description: 'Wake up early, productive mornings',
      icon: 'sunny'
    },
    {
      title: 'Night Owl',
      description: 'Stay up late, productive nights',
      icon: 'moon'
    },
    {
      title: 'Flexible',
      description: 'Adapt to different sleep schedules',
      icon: 'time'
    },
    {
      title: 'Irregular',
      description: 'Sleep schedule varies greatly',
      icon: 'sync'
    }
  ];

  const handleNext = () => {
    router.push('/(onboarding)/environmental_factors');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '57%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Which best describes your natural sleep pattern?</Text>
        <Text style={styles.description}>
          Understanding your chronotype helps us personalize your sleep plan
        </Text>

        <View style={styles.questionContainer}>
          {chronotypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.chronotypeButton,
                selectedChronotype === type.title && styles.selectedChronotype
              ]}
              onPress={() => setSelectedChronotype(type.title)}
            >
              <View style={styles.chronotypeContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={type.icon}
                    size={20}  // Smaller icon size
                    color={selectedChronotype === type.title ? '#4F46E5' : '#9CA3AF'}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.chronotypeTitle,
                    selectedChronotype === type.title && styles.selectedChronotypeText
                  ]}>
                    {type.title}
                  </Text>
                  <Text style={styles.chronotypeDescription}>
                    {type.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !selectedChronotype && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!selectedChronotype}
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
  questionContainer: {
    marginBottom: 32,
  },
  chronotypeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,  // Ensure consistent vertical padding
    paddingHorizontal: 16, // Ensure consistent horizontal padding
    marginBottom: 12,
    justifyContent: 'center',
    height: 80, // Fixed height for each option to avoid layout shift
  },
  selectedChronotype: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
    borderWidth: 1,
  },
  chronotypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,  // Smaller size for the icon container
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  chronotypeTitle: {
    color: '#FFFFFF',
    fontSize: 16,  // Smaller font size
    fontWeight: '600',
    marginBottom: 4,
  },
  chronotypeDescription: {
    color: '#9CA3AF',
    fontSize: 12,  // Smaller font size
  },
  selectedChronotypeText: {
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
