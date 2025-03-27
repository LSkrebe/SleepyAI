import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BellRing, Moon, Sun, ChevronDown } from 'lucide-react-native';

export default function Alarm() {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('07:30');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alarm</Text>
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
            <ChevronDown size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.daysContainer}>
            <Text style={styles.daysLabel}>Repeat</Text>
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
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeGrid}>
              {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    selectedTime === time && styles.timeButtonActive,
                  ]}
                  onPress={() => handleTimeSelection(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  daysContainer: {
    marginTop: 16,
  },
  daysLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
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
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#3B82F6',
  },
  dayText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  dayTextActive: {
    color: 'white',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  timeTextActive: {
    color: '#3B82F6',
  },
}); 