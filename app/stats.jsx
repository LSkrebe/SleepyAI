import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, Sun, Lightbulb, Volume2, Moon, Sunrise, Timer } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const generateData = (days) => {
  return Array.from({ length: days }, (_, i) => ({
    date: `Day ${i + 1}`,
    sleepQuality: Math.random() * 100,
    lightLevel: Math.random() * 100,
    ambientNoise: Math.random() * 80,
    bedTime: Math.floor(Math.random() * 24),
    wakeTime: Math.floor(Math.random() * 24),
    timeInBed: Math.random() * 10,
    timeToSleep: Math.floor(Math.random() * 120),
  }));
};

export default function Stats() {
  const [timeRange, setTimeRange] = useState('daily');
  const [data] = useState(() => generateData(7));

  const baseChartConfig = {
    backgroundColor: '#0F172A',
    backgroundGradientFrom: '#0F172A',
    backgroundGradientTo: '#0F172A',
    decimalPlaces: 0,
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
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: '#334155',
    },
    paddingLeft: 15,
    paddingRight: 15,
  };

  const sleepQualityConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#3B82F6',
    },
  };

  const lightLevelConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#F59E0B',
    },
  };

  const ambientNoiseConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#8B5CF6',
    },
  };

  const bedTimeConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#6366F1',
    },
  };

  const wakeTimeConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#0EA5E9',
    },
  };

  const timeInBedConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#10B981',
    },
  };

  const timeToSleepConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#EC4899',
    },
  };

  const sleepQualityData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => Number(d.sleepQuality.toFixed(1))),
    }],
  };

  const lightLevelData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => Number(d.lightLevel.toFixed(1))),
    }],
  };

  const ambientNoiseData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => Number(d.ambientNoise.toFixed(1))),
    }],
  };

  const bedTimeData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => Number(d.bedTime)),
    }],
  };

  const wakeTimeData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => Number(d.wakeTime)),
    }],
  };

  const timeInBedData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => Number(d.timeInBed.toFixed(1))),
    }],
  };

  const timeToSleepData = {
    labels: data.map(d => d.date),
    datasets: [{
      data: data.map(d => Number(d.timeToSleep)),
    }],
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Sleep Statistics</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.subtitle}>Track your sleep patterns</Text>
        </View>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
      </View>

      <View style={styles.timeSelectorContainer}>
        <TouchableOpacity 
          style={[styles.timeSelectorButton, timeRange === 'daily' && styles.timeSelectorButtonActive]}
          onPress={() => setTimeRange('daily')}
        >
          <Text style={[styles.timeSelectorText, timeRange === 'daily' && styles.timeSelectorTextActive]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeSelectorButton, timeRange === 'weekly' && styles.timeSelectorButtonActive]}
          onPress={() => setTimeRange('weekly')}
        >
          <Text style={[styles.timeSelectorText, timeRange === 'weekly' && styles.timeSelectorTextActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeSelectorButton, timeRange === 'monthly' && styles.timeSelectorButtonActive]}
          onPress={() => setTimeRange('monthly')}
        >
          <Text style={[styles.timeSelectorText, timeRange === 'monthly' && styles.timeSelectorTextActive]}>Monthly</Text>
        </TouchableOpacity>
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
        <View style={styles.chartTitleContainer}>
          <Activity size={24} color="#3B82F6" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Sleep Quality Trend</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={sleepQualityData}
            width={chartWidth}
            height={220}
            chartConfig={sleepQualityConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Lightbulb size={24} color="#F59E0B" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Light Level</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={lightLevelData}
            width={chartWidth}
            height={220}
            chartConfig={lightLevelConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Volume2 size={24} color="#8B5CF6" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Ambient Noise</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={ambientNoiseData}
            width={chartWidth}
            height={220}
            chartConfig={ambientNoiseConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Moon size={24} color="#6366F1" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Bed Time</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={bedTimeData}
            width={chartWidth}
            height={220}
            chartConfig={bedTimeConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Sunrise size={24} color="#0EA5E9" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Wake Time</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={wakeTimeData}
            width={chartWidth}
            height={220}
            chartConfig={wakeTimeConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Clock size={24} color="#10B981" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Time in Bed</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={timeInBedData}
            width={chartWidth}
            height={220}
            chartConfig={timeInBedConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Timer size={24} color="#EC4899" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Time to Fall Asleep</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={timeToSleepData}
            width={chartWidth}
            height={220}
            chartConfig={timeToSleepConfig}
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
  contentContainer: {
    paddingBottom: 50,
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
  timeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timeSelectorButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  timeSelectorButtonActive: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: '#3B82F6',
  },
  timeSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  timeSelectorTextActive: {
    color: '#3B82F6',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  metricCard: {
    width: '47%',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 24,
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
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartIcon: {
    marginRight: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
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
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
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
  metricItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  metricItemTemperature: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: '#EF4444',
  },
  metricItemHumidity: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: '#0EA5E9',
  },
  metricItemNoise: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: '#8B5CF6',
  },
  metricItemLight: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: '#F59E0B',
  },
}); 