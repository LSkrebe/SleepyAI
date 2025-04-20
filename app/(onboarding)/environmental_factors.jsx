import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EnvironmentalFactorsScreen() {
  const router = useRouter();
  const [selectedFactors, setSelectedFactors] = useState([]);

  // Reduced to four options
  const environmentalFactors = [
    {
      title: 'Light Pollution',
      description: 'Street lights, electronics causing light',
      icon: 'bulb'
    },
    {
      title: 'Noise Disturbance',
      description: 'Traffic, neighbors, and noise sources',
      icon: 'volume-high'
    },
    {
      title: 'Temperature',
      description: 'Room temperature too hot or cold',
      icon: 'thermometer'
    },
    {
      title: 'Air Quality',
      description: 'Poor ventilation or allergens present',
      icon: 'cloud' // Updated icon suggestion for air quality
    }
  ];

  const toggleFactor = (factor) => {
    setSelectedFactors(prev => 
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleNext = () => {
    router.push('/(onboarding)/lifestyle_habits');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '71%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Select factors affecting your sleep quality</Text>
        <Text style={styles.description}>
          Choose all the environmental factors that may impact your sleep quality.
        </Text>

        {environmentalFactors.map((factor, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.factorButton,
              selectedFactors.includes(factor.title) && styles.selectedFactor
            ]}
            onPress={() => toggleFactor(factor.title)}
          >
            <View style={styles.factorContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={factor.icon}
                  size={20} // Smaller icon size
                  color={selectedFactors.includes(factor.title) ? '#4F46E5' : '#9CA3AF'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.factorTitle,
                  selectedFactors.includes(factor.title) && styles.selectedFactorText
                ]}>
                  {factor.title}
                </Text>
                <Text style={styles.factorDescription}>
                  {factor.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, selectedFactors.length === 0 && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={selectedFactors.length === 0}
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
  factorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'center',
    height: 80, // Fixed height for each option to avoid layout shift
  },
  selectedFactor: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
    borderWidth: 1,
  },
  factorContent: {
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
  factorTitle: {
    color: '#FFFFFF',
    fontSize: 16,  // Smaller font size
    fontWeight: '600',
    marginBottom: 4,
  },
  factorDescription: {
    color: '#9CA3AF',
    fontSize: 12,  // Smaller font size
  },
  selectedFactorText: {
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
