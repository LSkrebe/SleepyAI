import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, Sun, Lightbulb, Volume2, Moon, Sunrise, Timer, Thermometer, ArrowUp, ArrowDown, Minus } from 'lucide-react-native';
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

// Default chart data structure
  const defaultChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
    data: [85, 90, 75, 80, 88, 82, 87]
  }]
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
      formatYLabel: (value) => {
        const [hours, minutes] = value.toString().split('.');
        return `${hours}.${minutes}`;
      },
      decimalPlaces: 2,
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

// Update TrendIndicator component to handle optimal values
const TrendIndicator = ({ currentValue, previousValue, inverted = false, optimalValue, isAboveOptimal, isBelowOptimal }) => {
  if (!currentValue || !previousValue) return null;

  const difference = currentValue - previousValue;
  const percentage = Math.round((difference / previousValue) * 100);
  const isPositive = difference > 0;
  const isNegative = difference < 0;
  const isNeutral = difference === 0;

  // Determine if the trend is good based on both weekly comparison and optimal values
  let isGood;
  if (optimalValue !== undefined) {
    // For temperature and humidity, consider both weekly trend and optimal value
    if (isAboveOptimal) {
      // If above optimal, any increase is bad, decrease is good
      isGood = isNegative;
    } else if (isBelowOptimal) {
      // If below optimal, any increase is good, decrease is bad
      isGood = isPositive;
    } else {
      // If at optimal, maintain current level
      isGood = isNeutral;
    }
  } else {
    // For other metrics, use the inverted flag
    isGood = inverted ? !isPositive : isPositive;
  }

  return (
    <View style={styles.trendContainer}>
      {isNeutral ? (
        <Minus size={16} color="#94A3B8" />
      ) : isPositive ? (
        <ArrowUp size={16} color={isGood ? "#10B981" : "#EF4444"} />
      ) : (
        <ArrowDown size={16} color={isGood ? "#10B981" : "#EF4444"} />
      )}
      <Text style={[
        styles.trendText,
        isNeutral ? styles.trendTextNeutral : 
        isGood ? styles.trendTextPositive : styles.trendTextNegative
      ]}>
        {Math.abs(percentage)}%
      </Text>
    </View>
  );
};

export default function Stats() {
  const [averages, setAverages] = useState({
    sleepQuality: 0,
    sleepDuration: '0h 0m',
    cycles: 0,
    temperature: 0,
    humidity: 0,
    noise: 0,
    light: 0
  });

  const [chartData, setChartData] = useState({
    sleepQuality: defaultChartData,
    lightLevel: defaultChartData,
    noiseLevel: defaultChartData,
    temperature: defaultChartData,
    humidity: defaultChartData,
    avgDuration: defaultChartData,
    sleepCycles: defaultChartData
  });

  const [trends, setTrends] = useState({
    sleepQuality: { currentValue: 0, previousValue: 0 },
    lightLevel: { currentValue: 0, previousValue: 0 },
    noiseLevel: { currentValue: 0, previousValue: 0 },
    temperature: { currentValue: 0, previousValue: 0 },
    humidity: { currentValue: 0, previousValue: 0 },
    avgDuration: { currentValue: 0, previousValue: 0 },
    sleepCycles: { currentValue: 0, previousValue: 0 }
  });

  const updateChartData = (records) => {
    if (records.length === 0) return;

    // Sort records by date and get the latest 7 records
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    const latestRecords = sortedRecords.slice(-7);

    // Calculate current averages
    const currentRecord = latestRecords[latestRecords.length - 1];
    const weeklyRecords = latestRecords.slice(0, -1);
    
    // Calculate weekly averages
    const weeklyAverages = {
      quality: weeklyRecords.reduce((sum, r) => sum + r.quality, 0) / (weeklyRecords.length || 1),
      duration: weeklyRecords.reduce((sum, r) => sum + r.duration, 0) / (weeklyRecords.length || 1),
      cycles: weeklyRecords.reduce((sum, r) => sum + r.cycles, 0) / (weeklyRecords.length || 1),
      temperature: weeklyRecords.reduce((sum, r) => sum + r.environmental.temperature, 0) / (weeklyRecords.length || 1),
      humidity: weeklyRecords.reduce((sum, r) => sum + r.environmental.humidity, 0) / (weeklyRecords.length || 1),
      noise: weeklyRecords.reduce((sum, r) => sum + r.environmental.noise, 0) / (weeklyRecords.length || 1),
      light: weeklyRecords.reduce((sum, r) => sum + r.environmental.light, 0) / (weeklyRecords.length || 1)
    };

    // Optimal values for metrics
    const optimalValues = {
      temperature: 20, // Optimal temperature in Celsius
      humidity: 50,    // Optimal humidity percentage
      cycles: 5,       // Optimal number of sleep cycles
      duration: 480,   // Optimal sleep duration in minutes (8 hours)
    };

    // Calculate trends by comparing current value with weekly average and optimal values
    setTrends({
      sleepQuality: {
        currentValue: currentRecord.quality,
        previousValue: weeklyAverages.quality
      },
            lightLevel: {
        currentValue: currentRecord.environmental.light,
        previousValue: weeklyAverages.light
            },
            noiseLevel: {
        currentValue: currentRecord.environmental.noise,
        previousValue: weeklyAverages.noise
            },
            temperature: {
        currentValue: currentRecord.environmental.temperature,
        previousValue: weeklyAverages.temperature,
        optimalValue: optimalValues.temperature,
        isAboveOptimal: currentRecord.environmental.temperature > optimalValues.temperature,
        isBelowOptimal: currentRecord.environmental.temperature < optimalValues.temperature
            },
            humidity: {
        currentValue: currentRecord.environmental.humidity,
        previousValue: weeklyAverages.humidity,
        optimalValue: optimalValues.humidity,
        isAboveOptimal: currentRecord.environmental.humidity > optimalValues.humidity,
        isBelowOptimal: currentRecord.environmental.humidity < optimalValues.humidity
      },
      avgDuration: {
        currentValue: currentRecord.duration,
        previousValue: weeklyAverages.duration,
        optimalValue: optimalValues.duration,
        isAboveOptimal: currentRecord.duration > optimalValues.duration,
        isBelowOptimal: currentRecord.duration < optimalValues.duration
      },
      sleepCycles: {
        currentValue: currentRecord.cycles,
        previousValue: weeklyAverages.cycles,
        optimalValue: optimalValues.cycles,
        isAboveOptimal: currentRecord.cycles > optimalValues.cycles,
        isBelowOptimal: currentRecord.cycles < optimalValues.cycles
      }
    });

    // Create chart data with actual values from latest 7 records
    const newChartData = {
      labels: latestRecords.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: latestRecords.map(r => r.quality)
      }]
    };

    // Create sleep duration chart data with hours and minutes
    const durationChartData = {
      labels: latestRecords.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
    datasets: [{
        data: latestRecords.map(r => {
          // Ensure we have a valid duration value
          const duration = r.duration || 0;
          // Convert minutes to hours and minutes
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          // Format as HH.MM
          return Number(`${hours}.${minutes.toString().padStart(2, '0')}`);
        })
      }]
    };

    // Create sleep cycles chart data
    const cyclesChartData = {
      labels: latestRecords.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
    datasets: [{
        data: latestRecords.map(r => r.cycles)
      }]
    };

    // Create environmental charts data
    const lightChartData = {
      labels: latestRecords.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
    datasets: [{
        data: latestRecords.map(r => r.environmental.light)
      }]
    };

    const noiseChartData = {
      labels: latestRecords.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
    datasets: [{
        data: latestRecords.map(r => r.environmental.noise)
      }]
    };

    const temperatureChartData = {
      labels: latestRecords.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
    datasets: [{
        data: latestRecords.map(r => r.environmental.temperature)
      }]
    };

    const humidityChartData = {
      labels: latestRecords.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
    datasets: [{
        data: latestRecords.map(r => r.environmental.humidity)
      }]
    };

    setChartData(prev => ({
      ...prev,
      sleepQuality: newChartData,
      avgDuration: durationChartData,
      sleepCycles: cyclesChartData,
      lightLevel: lightChartData,
      noiseLevel: noiseChartData,
      temperature: temperatureChartData,
      humidity: humidityChartData
    }));
  };

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
          cycles: avgCycles,
          temperature: Math.round(envAverages.temperature / envCount),
          humidity: Math.round(envAverages.humidity / envCount),
          noise: Math.round(envAverages.noise / envCount),
          light: Math.round(envAverages.light / envCount)
        });

        // Update chart data with actual values
        updateChartData(records);
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
            <Text style={styles.chartTitle}>Sleep Quality (%)</Text>
          </View>
          <TrendIndicator {...trends.sleepQuality} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.sleepQuality}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.sleepQuality}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartTarget}>Aim for: 80% or higher sleep quality</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
          <Clock size={24} color="#EC4899" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Sleep Duration (h)</Text>
          </View>
          <TrendIndicator {...trends.avgDuration} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.avgDuration}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.avgDuration}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartTarget}>Aim for: 8 hours of sleep per night</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
          <Sun size={24} color="#EAB308" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Sleep Cycles (count)</Text>
          </View>
          <TrendIndicator {...trends.sleepCycles} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.sleepCycles}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.sleepCycles}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartTarget}>Aim for: 5 complete sleep cycles per night</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
          <Volume2 size={24} color="#8B5CF6" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Ambient Noise (dB)</Text>
          </View>
          <TrendIndicator {...trends.noiseLevel} inverted={true} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.noiseLevel}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.noiseLevel}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartTarget}>Aim for: Below 30 decibels (quiet environment)</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
          <Lightbulb size={24} color="#F59E0B" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Light Level (lux)</Text>
          </View>
          <TrendIndicator {...trends.lightLevel} inverted={true} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.lightLevel}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.lightLevel}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartTarget}>Aim for: Minimal light exposure during sleep</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
          <Thermometer size={24} color="#EF4444" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Temperature (°C)</Text>
          </View>
          <TrendIndicator {...trends.temperature} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.temperature}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.temperature}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartTarget}>Aim for: 20°C (68°F) room temperature</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
          <Sun size={24} color="#0EA5E9" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Humidity (%)</Text>
          </View>
          <TrendIndicator {...trends.humidity} />
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.humidity}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.humidity}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartTarget}>Aim for: 50% relative humidity</Text>
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
  trendTextNeutral: {
    color: '#94A3B8',
  },
  chartTarget: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 