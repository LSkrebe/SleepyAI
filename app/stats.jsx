import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, Sun } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const generateData = (days) => {
  return Array.from({ length: days }, (_, i) => ({
    date: `Day ${i + 1}`,
    sleepQuality: Math.random() * 100,
  }));
};

export default function Stats() {
  const [timeRange, setTimeRange] = useState('Daily');
  const [data] = useState(() => generateData(7));

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
      fontSize: Math.min(12, screenWidth / 35),
      fill: '#94A3B8',
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#E2E8F0',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: '#334155',
    },
    paddingLeft: 15,
    paddingRight: 15,
  };

  const sleepQualityData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => d.sleepQuality),
    }],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Statistics</Text>
        <View style={styles.timeRangeSelector}>
          {['Daily', 'Weekly', 'Monthly'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Activity size={24} color="#3B82F6" />
          <Text style={styles.metricValue}>87%</Text>
          <Text style={styles.metricLabel}>Sleep Quality</Text>
        </View>
        <View style={styles.metricCard}>
          <Brain size={24} color="#3B82F6" />
          <Text style={styles.metricValue}>2.3h</Text>
          <Text style={styles.metricLabel}>Deep Sleep</Text>
        </View>
        <View style={styles.metricCard}>
          <Clock size={24} color="#3B82F6" />
          <Text style={styles.metricValue}>7.5h</Text>
          <Text style={styles.metricLabel}>Avg Duration</Text>
        </View>
        <View style={styles.metricCard}>
          <Sun size={24} color="#3B82F6" />
          <Text style={styles.metricValue}>4</Text>
          <Text style={styles.metricLabel}>Sleep Cycles</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Sleep Quality Trend</Text>
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
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeRangeText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#E2E8F0',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 16,
  },
  chartContainer: {
    marginVertical: 8,
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 4,
    marginLeft: -20,
    borderRadius: 16,
    alignSelf: 'center',
  },
}); 