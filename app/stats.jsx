import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, ThermometerSun, Volume2, Sun } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // 32px padding on each side

const generateData = (days) => {
  return Array.from({ length: days }, (_, i) => ({
    date: `Day ${i + 1}`,
    sleepQuality: Math.random() * 100,
    deepSleep: Math.random() * 3,
    lightSleep: Math.random() * 4,
    remSleep: Math.random() * 2,
  }));
};

export default function Stats() {
  const [timeRange, setTimeRange] = useState('Daily');
  const [data] = useState(() => generateData(7));

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: Math.min(12, screenWidth / 35),
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
    },
    paddingLeft: 40,
    paddingRight: 40,
  };

  const sleepQualityData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => d.sleepQuality),
    }],
  };

  const sleepStagesData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        data: data.map(d => d.deepSleep),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: data.map(d => d.lightSleep),
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: data.map(d => d.remSleep),
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
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
        <LineChart
          data={sleepQualityData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Sleep Stages</Text>
        <BarChart
          data={sleepStagesData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showBarTops={false}
          fromZero
          withInnerLines={false}
          withOuterLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withDots={false}
          withShadow={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          segments={4}
        />
      </View>
    </ScrollView>
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
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
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
    backgroundColor: 'white',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#3B82F6',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  chartCard: {
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
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0,
  },
}); 