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
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '42%' }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Select Symptoms You Experience</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.description}>
            Identifying issues for a better understanding of your sleep quality.
          </Text>
        </View>

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
                    color={isSelected ? '#3B82F6' : '#94A3B8'}
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
