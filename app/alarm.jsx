import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, TextInput } from 'react-native';
import { BellRing, Moon, Sun, ChevronDown } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function Alarm() {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('07:30');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  
  const workDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weekendDays = ['Sat', 'Sun'];
  
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  const handleCustomTimeSubmit = () => {
    const hours = parseInt(customHours);
    const minutes = parseInt(customMinutes);
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setSelectedTime(formattedTime);
      setShowTimePicker(false);
      setCustomHours('');
      setCustomMinutes('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Alarm</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.subtitle}>Wake up refreshed and energized</Text>
        </View>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.timeCard}>
          <View style={styles.timeHeader}>
            <BellRing size={24} color="#3B82F6" />
            <Text style={styles.timeLabel}>Wake Up Time</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeDisplay}>{selectedTime}</Text>
            <ChevronDown size={24} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.daysContainer}>
            <View style={styles.daysGrid}>
              {workDays.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(day) && styles.dayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.daysGrid}>
              {weekendDays.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(day) && styles.dayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Moon size={24} color="#3B82F6" />
              <Text style={styles.featureTitle}>Sleep Cycle</Text>
            </View>
            <Text style={styles.featureDescription}>
              Wake up during light sleep for a more refreshing start to your day
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Sun size={24} color="#3B82F6" />
              <Text style={styles.featureTitle}>Gentle Wake</Text>
            </View>
            <Text style={styles.featureDescription}>
              Progressive alarm sound that gradually increases in volume
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Alarm Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.customTimeContainer}>
              <View style={styles.customTimeInputs}>
                <View style={styles.customTimeInputGroup}>
                  <Text style={styles.customTimeLabel}>Hours</Text>
                  <TextInput
                    style={styles.customTimeInput}
                    value={customHours}
                    onChangeText={setCustomHours}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={styles.customTimeInputGroup}>
                  <Text style={styles.customTimeLabel}>Minutes</Text>
                  <TextInput
                    style={styles.customTimeInput}
                    value={customMinutes}
                    onChangeText={setCustomMinutes}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
              <TouchableOpacity 
                style={styles.customTimeSubmit}
                onPress={handleCustomTimeSubmit}
              >
                <Text style={styles.customTimeSubmitText}>Set Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
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
    width: 200,
    height: 200,
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    opacity: 0.1,
    transform: [{ scale: 1.5 }],
  },
  titleContainer: {
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
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
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  timeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginLeft: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  daysContainer: {
    marginTop: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  dayText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  dayTextActive: {
    color: 'white',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginLeft: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  modalClose: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  customTimeContainer: {
    padding: 20,
  },
  customTimeInputs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  customTimeInputGroup: {
    flex: 1,
  },
  customTimeLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  customTimeInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    color: '#E2E8F0',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
    textAlign: 'center',
  },
  customTimeSubmit: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  customTimeSubmitText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
}); 