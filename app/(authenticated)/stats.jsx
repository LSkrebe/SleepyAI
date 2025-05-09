import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, Sun, Lightbulb, Volume2, Moon, Sunrise, Timer, Thermometer, ArrowUp, ArrowDown, Minus, Droplets } from 'lucide-react-native';
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
  sleepQuality: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [80, 85, 75, 82, 88, 90, 85] // Sleep quality percentage (0-100)
    }]
  },
  avgDuration: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [7.5, 8.0, 7.0, 7.5, 8.5, 9.0, 8.0] // Sleep duration in hours
    }]
  },
  sleepCycles: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [3, 4, 4, 3, 5, 2, 4] // Number of sleep cycles
    }]
  },
  lightLevel: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [12, 25, 18, 15, 28, 22, 10] // Light level (lux)
    }]
  },
  noiseLevel: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [25, 30, 28, 27, 29, 26, 28] // Noise level (dB)
    }]
  },
  temperature: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 21, 20, 19, 20, 21, 20] // Temperature (°C)
    }]
  },
  humidity: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [45, 50, 48, 47, 49, 46, 48] // Humidity (%)
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
    color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#06B6D4',
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
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#6366F1',
    },
  },
  temperature: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#EC4899',
    },
    decimalPlaces: 1,
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
    color: (opacity = 1) => `rgba(132, 204, 22, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#84CC16',
    },
    formatYLabel: (value) => {
      const [hours, minutes] = value.toString().split('.');
      return `${hours}.${minutes}`;
    },
    decimalPlaces: 2,
  },
  sleepCycles: {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    propsForDots: {
      ...baseChartConfig.propsForDots,
      stroke: '#F97316',
    },
  },
};

// Update TrendIndicator component to handle optimal values
const TrendIndicator = ({ currentValue, previousValue, inverted = false, optimalValue, isAboveOptimal, isBelowOptimal }) => {
  // Handle case where all data is 0
  if (currentValue === 0 && previousValue === 0) {
    return (
      <View style={styles.trendContainer}>
        <Minus size={16} color="#CBD5E1" />
        <Text style={[styles.trendText, styles.trendTextNeutral]}>0%</Text>
      </View>
    );
  }

  if (!currentValue || !previousValue) return null;

  const difference = currentValue - previousValue;
  const percentage = Math.round((difference / previousValue) * 100);
  const isPositive = difference > 0;
  const isNegative = difference < 0;
  const isNeutral = difference === 0 || percentage === 0;

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

  // Format percentage display
  const displayPercentage = Math.abs(percentage) > 100 ? '+100' : Math.abs(percentage);

  return (
    <View style={styles.trendContainer}>
      {isNeutral ? (
        <Minus size={16} color="#CBD5E1" />
      ) : isPositive ? (
        <ArrowUp size={16} color={isGood ? "#22C55E" : "#F43F5E"} />
      ) : (
        <ArrowDown size={16} color={isGood ? "#22C55E" : "#F43F5E"} />
      )}
      <Text style={[
        styles.trendText,
        isNeutral ? styles.trendTextNeutral : 
        isGood ? styles.trendTextPositive : styles.trendTextNegative
      ]}>
        {displayPercentage}%
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
    sleepQuality: defaultChartData.sleepQuality,
    lightLevel: defaultChartData.lightLevel,
    noiseLevel: defaultChartData.noiseLevel,
    temperature: defaultChartData.temperature,
    humidity: defaultChartData.humidity,
    avgDuration: defaultChartData.avgDuration,
    sleepCycles: defaultChartData.sleepCycles
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
    if (records.length === 0) {
      // Set default values when no records exist
      setAverages({
        sleepQuality: 75, // Default average sleep quality
        sleepDuration: '7h 30m', // Default average sleep duration
        cycles: 5, // Default number of sleep cycles
        temperature: 20, // Default temperature
        humidity: 50, // Default humidity
        noise: 30, // Default noise level
        light: 10 // Default light level
      });
      
      // Use default chart data
      setChartData({
        sleepQuality: defaultChartData.sleepQuality,
        lightLevel: defaultChartData.lightLevel,
        noiseLevel: defaultChartData.noiseLevel,
        temperature: defaultChartData.temperature,
        humidity: defaultChartData.humidity,
        avgDuration: defaultChartData.avgDuration,
        sleepCycles: defaultChartData.sleepCycles
      });
      return;
    }

    // Calculate current averages
    const currentRecord = records[0]; // Most recent record is first in the array
    const previousRecords = records.slice(1); // All other records
    
    // Calculate averages from previous records
    const previousAverages = {
      quality: previousRecords.reduce((sum, r) => sum + r.quality, 0) / (previousRecords.length || 1),
      duration: previousRecords.reduce((sum, r) => {
        // Use actualSleep data for duration calculation if available
        if (r.actualSleep && r.actualSleep.start && r.actualSleep.end) {
          const [startHours, startMinutes] = r.actualSleep.start.split(':').map(Number);
          const [endHours, endMinutes] = r.actualSleep.end.split(':').map(Number);
          
          let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
          
          // Handle overnight case
          if (duration < 0) {
            duration += 24 * 60; // Add 24 hours worth of minutes
          }
          
          return sum + duration;
        } else {
          // Skip records without actual sleep data
          return sum;
        }
      }, 0) / (previousRecords.length || 1),
      cycles: previousRecords.reduce((sum, r) => sum + r.cycles, 0) / (previousRecords.length || 1),
      temperature: previousRecords.reduce((sum, r) => sum + r.environmental.temperature, 0) / (previousRecords.length || 1),
      humidity: previousRecords.reduce((sum, r) => sum + r.environmental.humidity, 0) / (previousRecords.length || 1),
      noise: previousRecords.reduce((sum, r) => sum + r.environmental.noise, 0) / (previousRecords.length || 1),
      light: previousRecords.reduce((sum, r) => sum + r.environmental.light, 0) / (previousRecords.length || 1)
    };

    // Optimal values for metrics
    const optimalValues = {
      temperature: 20, // Optimal temperature in Celsius
      humidity: 50,    // Optimal humidity percentage
      cycles: 5,       // Optimal number of sleep cycles
      duration: 480,   // Optimal sleep duration in minutes (8 hours)
    };

    // Calculate trends by comparing current value with previous average and optimal values
    setTrends({
      sleepQuality: {
        currentValue: currentRecord.quality,
        previousValue: previousAverages.quality
      },
      lightLevel: {
        currentValue: currentRecord.environmental.light,
        previousValue: previousAverages.light
      },
      noiseLevel: {
        currentValue: currentRecord.environmental.noise,
        previousValue: previousAverages.noise
      },
      temperature: {
        currentValue: currentRecord.environmental.temperature,
        previousValue: previousAverages.temperature,
        optimalValue: optimalValues.temperature,
        isAboveOptimal: currentRecord.environmental.temperature > optimalValues.temperature,
        isBelowOptimal: currentRecord.environmental.temperature < optimalValues.temperature
      },
      humidity: {
        currentValue: currentRecord.environmental.humidity,
        previousValue: previousAverages.humidity,
        optimalValue: optimalValues.humidity,
        isAboveOptimal: currentRecord.environmental.humidity > optimalValues.humidity,
        isBelowOptimal: currentRecord.environmental.humidity < optimalValues.humidity
      },
      avgDuration: {
        currentValue: currentRecord.duration,
        previousValue: previousAverages.duration,
        optimalValue: optimalValues.duration,
        isAboveOptimal: currentRecord.duration > optimalValues.duration,
        isBelowOptimal: currentRecord.duration < optimalValues.duration
      },
      sleepCycles: {
        currentValue: currentRecord.cycles,
        previousValue: previousAverages.cycles,
        optimalValue: optimalValues.cycles,
        isAboveOptimal: currentRecord.cycles > optimalValues.cycles,
        isBelowOptimal: currentRecord.cycles < optimalValues.cycles
      }
    });

    // Create chart data with actual values from all records
    const newChartData = {
      labels: [...records].reverse().map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: [...records].reverse().map(r => r.quality || 0)
      }]
    };

    // Create sleep duration chart data with hours and minutes
    const durationChartData = {
      labels: [...records].reverse().map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: [...records].reverse().map(r => {
          // Use actualSleep data for duration calculation if available
          let duration = 0;
          
          if (r.actualSleep && r.actualSleep.start && r.actualSleep.end) {
            const [startHours, startMinutes] = r.actualSleep.start.split(':').map(Number);
            const [endHours, endMinutes] = r.actualSleep.end.split(':').map(Number);
            
            duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
            
            // Handle overnight case
            if (duration < 0) {
              duration += 24 * 60; // Add 24 hours worth of minutes
            }
          }
          
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
      labels: [...records].reverse().map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: [...records].reverse().map(r => r.cycles || 0)
      }]
    };

    // Create environmental charts data
    const lightChartData = {
      labels: [...records].reverse().map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: [...records].reverse().map(r => r.environmental.light || 0)
      }]
    };

    const noiseChartData = {
      labels: [...records].reverse().map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: [...records].reverse().map(r => r.environmental.noise || 0)
      }]
    };

    const temperatureChartData = {
      labels: [...records].reverse().map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: [...records].reverse().map(r => r.environmental.temperature || 0)
      }]
    };

    const humidityChartData = {
      labels: [...records].reverse().map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: [...records].reverse().map(r => r.environmental.humidity || 0)
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
        // Sort records by date and get the latest 7 records
        const sortedRecords = [...records].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        const latestRecords = sortedRecords.slice(-7);
        
        // Calculate averages based on the last 7 days
        const totalQuality = latestRecords.reduce((sum, record) => sum + record.quality, 0);
        
        // Calculate total duration using actual sleep data
        const totalDuration = latestRecords.reduce((sum, record) => {
          if (record.actualSleep && record.actualSleep.start && record.actualSleep.end) {
            const [startHours, startMinutes] = record.actualSleep.start.split(':').map(Number);
            const [endHours, endMinutes] = record.actualSleep.end.split(':').map(Number);
            
            let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
            
            // Handle overnight case
            if (duration < 0) {
              duration += 24 * 60; // Add 24 hours worth of minutes
            }
            
            return sum + duration;
          }
          return sum;
        }, 0);
        
        const totalCycles = latestRecords.reduce((sum, record) => sum + record.cycles, 0);
        
        const avgQuality = Math.round(totalQuality / latestRecords.length);
        const avgDuration = totalDuration / latestRecords.length;
        const avgCycles = Math.round(totalCycles / latestRecords.length);
        
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
      } else {
        // Set default values when no records exist
        setAverages({
          sleepQuality: 75, // Default average sleep quality
          sleepDuration: '7h 30m', // Default average sleep duration
          cycles: 5, // Default number of sleep cycles
          temperature: 20, // Default temperature
          humidity: 50, // Default humidity
          noise: 30, // Default noise level
          light: 10 // Default light level
        });
        
        // Use default chart data
        setChartData({
          sleepQuality: defaultChartData.sleepQuality,
          lightLevel: defaultChartData.lightLevel,
          noiseLevel: defaultChartData.noiseLevel,
          temperature: defaultChartData.temperature,
          humidity: defaultChartData.humidity,
          avgDuration: defaultChartData.avgDuration,
          sleepCycles: defaultChartData.sleepCycles
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
          <Text style={styles.title}>Statistics</Text>
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
            <Activity size={24} color="#06B6D4" />
          </View>
          <Text style={styles.metricValue}>{averages.sleepQuality}%</Text>
          <Text style={styles.metricLabel}>Avg. Quality</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardDuration]}>
          <View style={styles.metricIconContainer}>
            <Clock size={24} color="#84CC16" />
          </View>
          <Text style={styles.metricValue}>{averages.sleepDuration}</Text>
          <Text style={styles.metricLabel}>Avg. Duration</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Activity size={24} color="#06B6D4" style={styles.chartIcon} />
            <View>
              <Text style={styles.chartTitle}>Sleep Quality (%)</Text>
            </View>
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
        <Text style={styles.chartTarget}>Aim for: 80% or higher</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Clock size={24} color="#84CC16" style={styles.chartIcon} />
            <View>
              <Text style={styles.chartTitle}>Sleep Duration (h)</Text>
            </View>
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
        <Text style={styles.chartTarget}>Aim for: 8 hours per night</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Sun size={24} color="#F97316" style={styles.chartIcon} />
            <View>
              <Text style={styles.chartTitle}>Sleep Cycles (count)</Text>
            </View>
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
        <Text style={styles.chartTarget}>Aim for: 5 complete cycles</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Volume2 size={24} color="#6366F1" style={styles.chartIcon} />
            <View>
              <Text style={styles.chartTitle}>Ambient Noise (dB)</Text>
            </View>
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
        <Text style={styles.chartTarget}>Aim for: Below 30 decibels</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Lightbulb size={24} color="#F59E0B" style={styles.chartIcon} />
            <View>
              <Text style={styles.chartTitle}>Light Level (lux)</Text>
            </View>
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
        <Text style={styles.chartTarget}>Aim for: Minimal light exposure</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Thermometer size={24} color="#EC4899" style={styles.chartIcon} />
            <View>
              <Text style={styles.chartTitle}>Temperature (°C)</Text>
            </View>
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
        <Text style={styles.chartTarget}>Aim for: 20°C room temperature</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <View style={styles.chartTitleLeft}>
            <Droplets size={24} color="#0EA5E9" style={styles.chartIcon} />
            <View>
              <Text style={styles.chartTitle}>Humidity (%)</Text>
            </View>
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
        <Text style={styles.chartTarget}>Aim for: 50% humidity</Text>
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
    width: 180,
    height: 180,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  metricCardSleepQuality: {
    borderColor: 'rgba(51, 65, 85, 0.3)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  metricCardDuration: {
    borderColor: 'rgba(51, 65, 85, 0.3)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
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
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
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
  chartSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
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
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  metricItemHumidity: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  metricItemNoise: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  metricItemLight: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
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
    color: '#22C55E',
  },
  trendTextNegative: {
    color: '#F43F5E',
  },
  trendTextNeutral: {
    color: '#CBD5E1',
  },
  chartTarget: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 