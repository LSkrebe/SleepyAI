import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, Sun, Lightbulb, Volume2, Moon, Sunrise, Timer, Thermometer, ArrowUp, ArrowDown } from 'lucide-react-native';
import sleepTrackingService from '../../services/sleepTrackingService';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

// Static data for UI demonstration
const staticData = {
  sleepQuality: 85,
  sleepDuration: '7h 30m',
  temperature: 20,
  humidity: 45,
  noise: 30,
  light: 1,
  chartData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [85, 90, 75, 80, 88, 82, 87]
    }]
  },
  trends: {
    sleepQuality: { value: 5, isPositive: true },
    sleepDuration: { value: 2, isPositive: true },
    sleepCycles: { value: 3, isPositive: true },
    ambientNoise: { value: 4, isPositive: false },
    lightLevel: { value: 1, isPositive: false },
    temperature: { value: 2, isPositive: true },
    humidity: { value: 3, isPositive: false }
  }
};

// Chart configurations
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

const chartConfigs = {
  sleepQuality: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#3B82F6',
    },
  },
  lightLevel: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#F59E0B',
    },
  },
  noiseLevel: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#8B5CF6',
    },
  },
  temperature: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#EF4444',
    },
  },
  humidity: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#0EA5E9',
    },
  },
  avgDuration: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#EC4899',
    },
  },
  sleepCycles: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#EAB308',
    },
  },
};

// Add TrendIndicator component
const TrendIndicator = ({ value, isPositive }) => (
  <View style={styles.trendContainer}>
    {isPositive ? (
      <ArrowUp size={16} color="#10B981" />
    ) : (
      <ArrowDown size={16} color="#EF4444" />
    )}
    <Text style={[
      styles.trendText,
      isPositive ? styles.trendTextPositive : styles.trendTextNegative
    ]}>
      {value}%
    </Text>
  </View>
);

export default function Stats() {
  const [averages, setAverages] = useState({
    sleepQuality: 0,
    sleepDuration: '0h 0m',
    temperature: 0,
    humidity: 0,
    noise: 0,
    light: 0,
    cycles: 0
  });

  useEffect(() => {
    const loadSleepRecords = async () => {
      const records = await sleepTrackingService.getSleepRecords();
      
      if (records.length > 0) {
        // Calculate averages
        const totalQuality = records.reduce((sum, record) => sum + record.quality, 0);
        const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);
        const totalCycles = records.reduce((sum, record) => sum + record.cycles, 0);
        
        const avgQuality = Math.round(totalQuality / records.length);
        const avgDuration = totalDuration / records.length;
        const avgCycles = Math.round(totalCycles / records.length);
        
        // Format duration
        const hours = Math.floor(avgDuration / 60);
        const minutes = Math.round(avgDuration % 60);
        const formattedDuration = `${hours}h ${minutes}m`;

        // Calculate environmental averages
        const envAverages = records.reduce((acc, record) => {
          acc.temperature += record.environmental.temperature;
          acc.humidity += record.environmental.humidity;
          acc.noise += record.environmental.noise;
          acc.light += record.environmental.light;
          return acc;
        }, { temperature: 0, humidity: 0, noise: 0, light: 0 });

        const envCount = records.length;
        setAverages({
          sleepQuality: avgQuality,
          sleepDuration: formattedDuration,
          temperature: Math.round(envAverages.temperature / envCount),
          humidity: Math.round(envAverages.humidity / envCount),
          noise: Math.round(envAverages.noise / envCount),
          light: Math.round(envAverages.light / envCount),
          cycles: avgCycles
        });
      }
    };

    loadSleepRecords();

    // Listen for new sleep records
    const handleSleepRecordsUpdate = (records) => {
      loadSleepRecords();
    };

    sleepTrackingService.onSleepRecordsUpdate(handleSleepRecordsUpdate);
    return () => {
      sleepTrackingService.offSleepRecordsUpdate(handleSleepRecordsUpdate);
    };
  }, []);

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

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, styles.metricCardSleepQuality]}>
          <View style={styles.metricIconContainer}>
            <Activity size={24} color="#3B82F6" />
          </View>
          <Text style={styles.metricValue}>{averages.sleepQuality}%</Text>
          <Text style={styles.metricLabel}>Avg. Quality</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardDuration]}>
          <View style={styles.metricIconContainer}>
            <Clock size={24} color="#EC4899" />
          </View>
          <Text style={styles.metricValue}>{averages.sleepDuration}</Text>
          <Text style={styles.metricLabel}>Avg. Duration</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Activity size={24} color="#3B82F6" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Sleep Quality</Text>
          </View>
          <TrendIndicator {...staticData.trends.sleepQuality} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={staticData.chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.sleepQuality}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Clock size={24} color="#EC4899" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Sleep Duration</Text>
          </View>
          <TrendIndicator {...staticData.trends.sleepDuration} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={staticData.chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.avgDuration}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Sun size={24} color="#EAB308" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Sleep Cycles</Text>
          </View>
          <TrendIndicator {...staticData.trends.sleepCycles} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={staticData.chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.sleepCycles}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Volume2 size={24} color="#8B5CF6" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Ambient Noise</Text>
          </View>
          <TrendIndicator {...staticData.trends.ambientNoise} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={staticData.chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.noiseLevel}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Lightbulb size={24} color="#F59E0B" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Light Level</Text>
          </View>
          <TrendIndicator {...staticData.trends.lightLevel} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={staticData.chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.lightLevel}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Thermometer size={24} color="#EF4444" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Temperature</Text>
          </View>
          <TrendIndicator {...staticData.trends.temperature} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={staticData.chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.temperature}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Sun size={24} color="#0EA5E9" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Humidity</Text>
          </View>
          <TrendIndicator {...staticData.trends.humidity} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={staticData.chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.humidity}
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
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricCardSleepQuality: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  metricCardDuration: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  trendTextPositive: {
    color: '#10B981',
  },
  trendTextNegative: {
    color: '#EF4444',
  },
}); 