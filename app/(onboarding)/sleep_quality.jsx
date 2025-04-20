import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SleepQualityScreen() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const symptoms = [
    {
      title: 'Trouble falling asleep',
      description: 'Hard to fall asleep',
      icon: 'bed-outline',
    },
    {
      title: 'Waking up at night',
      description: 'Frequent awakenings',
      icon: 'moon-outline',
    },
    {
      title: 'Poor sleep quality',
      description: 'Unrefreshing or light sleep',
      icon: 'alert-circle-outline',
    },
    {
      title: 'Daytime tiredness',
      description: 'Low energy during the day',
      icon: 'battery-dead-outline',
    },
  ];
  

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleNext = () => {
    router.push('/(onboarding)/circadian_rhythm');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '42%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Select Symptoms You Experience</Text>
        <Text style={styles.description}>
          Identifying issues for a better understanding of your sleep quality.
        </Text>

        {symptoms.map((symptom, index) => {
          const isSelected = selectedSymptoms.includes(symptom.title);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                isSelected && styles.selectedCard
              ]}
              onPress={() => toggleSymptom(symptom.title)}
            >
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={symptom.icon}
                    size={20}
                    color={isSelected ? '#4F46E5' : '#9CA3AF'}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      isSelected && styles.selectedText
                    ]}
                  >
                    {symptom.title}
                  </Text>
                  <Text style={styles.optionDescription}>{symptom.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, selectedSymptoms.length === 0 && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={selectedSymptoms.length === 0}
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
