import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, Sun, Lightbulb, Volume2, Moon, Sunrise, Timer, Thermometer } from 'lucide-react-native';

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

export default function Stats() {
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
          <Text style={styles.metricValue}>{staticData.sleepQuality}%</Text>
          <Text style={styles.metricLabel}>Sleep Quality</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardDuration]}>
          <View style={styles.metricIconContainer}>
            <Clock size={24} color="#EC4899" />
          </View>
          <Text style={styles.metricValue}>{staticData.sleepDuration}</Text>
          <Text style={styles.metricLabel}>Sleep Duration</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Activity size={24} color="#3B82F6" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Sleep Quality</Text>
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
          <Clock size={24} color="#EC4899" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Sleep Duration</Text>
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
          <Sun size={24} color="#EAB308" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Sleep Cycles</Text>
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
          <Volume2 size={24} color="#8B5CF6" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Ambient Noise</Text>
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
          <Lightbulb size={24} color="#F59E0B" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Light Level</Text>
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
          <Thermometer size={24} color="#EF4444" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Temperature</Text>
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
          <Sun size={24} color="#0EA5E9" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Humidity</Text>
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