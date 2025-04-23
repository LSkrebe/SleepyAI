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
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '57%' }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Which best describes your natural sleep pattern?</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.description}>
            Understanding your chronotype helps us personalize your sleep plan
          </Text>
        </View>

        {chronotypes.map((type, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              selectedChronotype === type.title && styles.selectedCard
            ]}
            onPress={() => setSelectedChronotype(type.title)}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={selectedChronotype === type.title ? '#3B82F6' : '#94A3B8'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    selectedChronotype === type.title && styles.selectedText
                  ]}
                >
                  {type.title}
                </Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
