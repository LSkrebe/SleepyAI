import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { BellRing, ChevronDown, Clock, Sun, Moon, Sparkles, Zap, Target, Brain } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function Alarm() {
  return (
      <ScrollView 
      style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Alarm</Text>
            <View style={styles.titleDecoration} />
            <Text style={styles.subtitle}>Wake up refreshed and energized</Text>
          </View>
          <View style={styles.headerBackground}>
            <View style={styles.headerGlow} />
          <View style={styles.headerParticles}>
            <View style={styles.particle} />
            <View style={styles.particle} />
            <View style={styles.particle} />
          </View>
          </View>
        </View>

        <View style={styles.timeCard}>
          <View style={styles.timeHeader}>
          <View style={styles.timeHeaderContent}>
            <Text style={styles.timeLabel}>Wake Up Time</Text>
            <Text style={styles.timeSubtitle}>Set your morning alarm</Text>
          </View>
          <View style={styles.timeIconContainer}>
            <BellRing size={24} color="#3B82F6" />
          </View>
          </View>
          
        <View style={styles.timeDisplay}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>07:30</Text>
            <View style={styles.timeIndicator}>
              <Sun size={16} color="#F59E0B" />
              <Text style={styles.timeIndicatorText}>Morning</Text>
            </View>
          </View>
          <Text style={styles.daysText}>Mon, Tue, Wed, Thu, Fri</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton}>
            <ChevronDown size={20} color="#94A3B8" />
            <Text style={styles.editButtonText}>Edit Time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.alarmButton}>
            <Text style={styles.alarmButtonText}>Set Alarm</Text>
          </TouchableOpacity>
        </View>
            </View>

      <View style={styles.sleepInfoCard}>
        <View style={styles.sleepInfoHeader}>
          <View style={styles.sleepInfoTitleContainer}>
            <Text style={styles.sleepInfoTitle}>Sleep Tracking</Text>
            <Text style={styles.sleepInfoSubtitle}>Your sleep patterns</Text>
          </View>
          <View style={styles.sleepInfoIconContainer}>
            <Brain size={24} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.sleepInfoContent}>
          <View style={styles.sleepTimeContainer}>
            <View style={styles.sleepTimeItem}>
              <View style={styles.sleepTimeIconContainer}>
                <Moon size={20} color="#94A3B8" />
            </View>
              <View style={styles.sleepTimeTextContainer}>
                <Text style={styles.sleepTimeLabel}>Bedtime</Text>
                <Text style={styles.sleepTimeValue}>23:00</Text>
                <Text style={styles.sleepTimeNote}>Based on your sleep patterns</Text>
              </View>
            </View>
            <View style={styles.sleepTimeDivider} />
            <View style={styles.sleepTimeItem}>
              <View style={styles.sleepTimeIconContainer}>
                <Sun size={20} color="#94A3B8" />
              </View>
              <View style={styles.sleepTimeTextContainer}>
                <Text style={styles.sleepTimeLabel}>Wake up</Text>
                <Text style={styles.sleepTimeValue}>07:30</Text>
                <Text style={styles.sleepTimeNote}>Optimized for your sleep cycles</Text>
              </View>
            </View>
          </View>
        </View>
            </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    paddingBottom: 64,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'visible',
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
  headerParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    opacity: 0.3,
  },
  titleContainer: {
    position: 'relative',
    zIndex: 2,
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
    letterSpacing: 0.5,
  },
  timeCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeHeaderContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  timeSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  timeDisplay: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
    alignItems: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  timeIndicatorText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  daysText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
    gap: 8,
  },
  editButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  alarmButton: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  alarmButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  sleepInfoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  sleepInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sleepInfoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  sleepInfoTitleContainer: {
    flex: 1,
  },
  sleepInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  sleepInfoSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  sleepInfoContent: {
    gap: 16,
  },
  sleepTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  sleepTimeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sleepTimeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  sleepTimeTextContainer: {
    flex: 1,
  },
  sleepTimeLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  sleepTimeValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  sleepTimeNote: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontStyle: 'italic',
  },
  sleepTimeDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    marginHorizontal: 16,
  },
  sleepDurationContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
    alignItems: 'center',
  },
  sleepDurationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sleepDurationLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  sleepDurationValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sleepDurationNote: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
  }
}); 