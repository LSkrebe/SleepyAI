import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Moon, Brain, Thermometer, Droplets, Volume2, Sun, Timer, BellRing, Activity } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 96; // Increased padding to 48px on each side

export default function Journal() {
  const [sleepQuality, setSleepQuality] = useState(85);
  const [sleepDuration, setSleepDuration] = useState(7.5);
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(45);
  const [noise, setNoise] = useState(30);
  const [light, setLight] = useState(0);
  const [sleepCycles, setSleepCycles] = useState(4);

  const sleepQualityData = {
    labels: ['22', '23', '0', '1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: [30, 65, 85, 90, 95, 92, 88, 85, 80, 75],
    }],
  };

  const chartConfig = {
    backgroundColor: '#0F172A',
    backgroundGradientFrom: '#0F172A',
    backgroundGradientTo: '#0F172A',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(226, 232, 240, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: Math.min(10, screenWidth / 40),
      fill: '#94A3B8',
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#E2E8F0',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: '#334155',
    },
    paddingLeft: 15,
    paddingRight: 15,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    withInnerLines: true,
    withOuterLines: true,
    withHorizontalLabels: true,
    withVerticalLabels: true,
    withDots: true,
    withVerticalLines: true,
    withHorizontalLines: true,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SleepyAI</Text>
        <Text style={styles.subtitle}>Your personal sleep companion</Text>
      </View>

      <View style={[styles.card, styles.todayCard]}>
        <View style={styles.cardHeader}>
          <Moon size={28} color="#3B82F6" />
          <Text style={[styles.cardTitle, styles.todayTitle]}>Today's Sleep</Text>
        </View>
        <View style={styles.sleepStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>7h 32m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>87%</Text>
            <Text style={styles.statLabel}>Quality</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Cycles</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.chartCard]}>
        <View style={styles.cardHeader}>
          <Activity size={28} color="#3B82F6" />
          <Text style={[styles.cardTitle, styles.chartTitle]}>Today's Sleep Quality Trend</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={sleepQualityData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        <View style={styles.metricsContainer}>
          <View style={styles.metricsHeader}>
            <Text style={styles.metricsTitle}>Sleep Environment</Text>
          </View>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricItem, styles.metricItemTemperature]}>
              <View style={styles.metricIconContainer}>
                <Thermometer size={20} color="#EF4444" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{temperature}°C</Text>
                <Text style={styles.metricLabel}>Temperature</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemHumidity]}>
              <View style={styles.metricIconContainer}>
                <Droplets size={20} color="#0EA5E9" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{humidity}%</Text>
                <Text style={styles.metricLabel}>Humidity</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemNoise]}>
              <View style={styles.metricIconContainer}>
                <Volume2 size={20} color="#8B5CF6" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{noise}dB</Text>
                <Text style={styles.metricLabel}>Noise Level</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemLight]}>
              <View style={styles.metricIconContainer}>
                <Sun size={20} color="#F59E0B" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{light}%</Text>
                <Text style={styles.metricLabel}>Light Level</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.cyclesCard]}>
        <View style={styles.cardHeader}>
          <Timer size={28} color="#3B82F6" />
          <Text style={[styles.cardTitle, styles.cyclesTitle]}>Today's Sleep Cycles</Text>
        </View>
        <View style={styles.cyclesContainer}>
          <View style={styles.cycleItem}>
            <View style={styles.cycleValueContainer}>
              <Text style={styles.cycleValue}>{sleepCycles}</Text>
              <Text style={styles.cycleUnit}>cycles</Text>
            </View>
            <Text style={styles.cycleLabel}>Total Cycles</Text>
          </View>
          <View style={styles.cycleDivider} />
          <View style={styles.cycleItem}>
            <View style={styles.cycleValueContainer}>
              <Text style={styles.cycleValue}>1.5</Text>
              <Text style={styles.cycleUnit}>hours</Text>
            </View>
            <Text style={styles.cycleLabel}>Avg Duration</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.insightsCard]}>
        <View style={styles.cardHeader}>
          <Brain size={28} color="#3B82F6" />
          <Text style={[styles.cardTitle, styles.insightsTitle]}>Sleep Insights</Text>
        </View>
        <View style={styles.insightsContainer}>
          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <Activity size={20} color="#3B82F6" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Quality Improvement</Text>
              <Text style={styles.insightText}>Your sleep quality has improved by 5% compared to last week</Text>
            </View>
          </View>
          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <Timer size={20} color="#3B82F6" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Optimal Duration</Text>
              <Text style={styles.insightText}>You're getting the recommended 7-9 hours of sleep</Text>
            </View>
          </View>
          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <Moon size={20} color="#3B82F6" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Deep Sleep</Text>
              <Text style={styles.insightText}>You achieved 2.5 hours of deep sleep, which is optimal</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.alarmCard]}>
        <View style={styles.cardHeader}>
          <BellRing size={28} color="#3B82F6" />
          <Text style={[styles.cardTitle, styles.alarmTitle]}>Next Alarm</Text>
        </View>
        <View style={styles.alarmContainer}>
          <View style={styles.alarmTimeContainer}>
            <Text style={styles.alarmTime}>06:30</Text>
            <Text style={styles.alarmPeriod}>AM</Text>
          </View>
          <View style={styles.alarmInfo}>
            <Text style={styles.alarmLabel}>Tomorrow</Text>
            <Text style={styles.alarmSubtext}>7 hours from now</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#E2E8F0',
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  insightText: {
    fontSize: 16,
    color: '#CBD5E1',
    lineHeight: 24,
  },
  alarmCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  alarmTitle: {
    fontSize: 22,
    color: '#E2E8F0',
  },
  alarmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  alarmTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  alarmTime: {
    fontSize: 48,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  alarmPeriod: {
    fontSize: 24,
    color: '#94A3B8',
    marginLeft: 4,
  },
  alarmInfo: {
    alignItems: 'flex-end',
  },
  alarmLabel: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 4,
  },
  alarmSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  chartCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  chartTitle: {
    fontSize: 22,
    color: '#E2E8F0',
  },
  chartContainer: {
    marginVertical: 16,
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
  metricsContainer: {
    marginTop: 24,
  },
  metricsHeader: {
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricItemTemperature: {
    backgroundColor: '#1E293B',
  },
  metricItemHumidity: {
    backgroundColor: '#1E293B',
  },
  metricItemNoise: {
    backgroundColor: '#1E293B',
  },
  metricItemLight: {
    backgroundColor: '#1E293B',
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cyclesCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  cyclesTitle: {
    fontSize: 22,
    color: '#E2E8F0',
  },
  cyclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  cycleItem: {
    alignItems: 'center',
    flex: 1,
  },
  cycleValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cycleValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  cycleUnit: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 4,
  },
  cycleLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  cycleDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  insightsCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  insightsTitle: {
    fontSize: 22,
    color: '#E2E8F0',
  },
  insightsContainer: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  todayCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  todayTitle: {
    fontSize: 22,
    color: '#E2E8F0',
  },
}); 