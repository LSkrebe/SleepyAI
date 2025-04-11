import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Clock, Sun, Lightbulb, Volume2, Moon, Sunrise, Timer, Thermometer } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [timeRange, setTimeRange] = useState('weekly');
  const [data] = useState(() => generateData(7));

  const [sleepData, setSleepData] = useState([]);
  const [latestSleepDate, setLatestSleepDate] = useState(null);
  const [sleepQuality, setSleepQuality] = useState(85);
  const [sleepDuration, setSleepDuration] = useState('7h 30m');
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(45);
  const [noise, setNoise] = useState(30);
  const [light, setLight] = useState(1);
  const [sleepInsights, setSleepInsights] = useState([]);

  // Default chart data
  const defaultChartData = {
    labels: ['22', '23', '0', '1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: [0, 45, 20, 85, 70, 90, 40, 70, 30, 0],
    }],
  };

  // Chart data states
  const [chartData, setChartData] = useState({
    sleepQuality: defaultChartData,
    lightLevel: {
      ...defaultChartData,
      datasets: [{
        data: [50, 30, 5, 0, 0, 0, 0, 10, 40, 60],
      }],
    },
    noiseLevel: {
      ...defaultChartData,
      datasets: [{
        data: [40, 35, 30, 25, 20, 25, 30, 35, 40, 45],
      }],
    },
    temperature: {
      ...defaultChartData,
      datasets: [{
        data: [22, 21, 20, 20, 19, 19, 20, 21, 22, 23],
      }],
    },
    humidity: {
      ...defaultChartData,
      datasets: [{
        data: [45, 46, 47, 48, 49, 50, 49, 48, 47, 46],
      }],
    },
    deepSleep: {
      ...defaultChartData,
      datasets: [{
        data: [0, 0, 0, 1, 2, 3, 2, 1, 0, 0],
      }],
    },
    avgDuration: {
      ...defaultChartData,
      datasets: [{
        data: [0, 0, 0, 1, 2, 3, 2, 1, 0, 0],
      }],
    },
    sleepCycles: {
      ...defaultChartData,
      datasets: [{
        data: [0, 0, 1, 2, 3, 4, 3, 2, 1, 0],
      }],
    },
  });

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
    deepSleep: {
      ...baseChartConfig,
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      propsForDots: {
        ...baseChartConfig.propsForDots,
        stroke: '#10B981',
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

  // Load saved data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [storedSleepData, storedChartData, storedCardData] = await Promise.all([
          AsyncStorage.getItem('sleepData'),
          AsyncStorage.getItem('chartData'),
          AsyncStorage.getItem('cardData')
        ]);
        
        if (storedSleepData) {
          const parsedData = JSON.parse(storedSleepData);
          setSleepData(parsedData);
          
          // Find the latest sleep record
          if (parsedData.length > 0) {
            const latest = parsedData.reduce((latest, current) => {
              return new Date(current.date) > new Date(latest.date) ? current : latest;
            });
            setLatestSleepDate(latest.date);
          }
        }
        
        if (storedChartData) {
          const savedChartData = JSON.parse(storedChartData);
          setChartData(prevData => ({
            ...prevData,
            sleepQuality: savedChartData,
            lightLevel: {
              ...prevData.lightLevel,
              labels: savedChartData.labels,
              datasets: [{
                data: savedChartData.datasets[0].data.map(score => Math.max(0, 100 - score)),
              }],
            },
            noiseLevel: {
              ...prevData.noiseLevel,
              labels: savedChartData.labels,
              datasets: [{
                data: savedChartData.datasets[0].data.map(score => Math.min(100, score + 20)),
              }],
            },
            temperature: {
              ...prevData.temperature,
              labels: savedChartData.labels,
              datasets: [{
                data: savedChartData.datasets[0].data.map(score => 18 + (score / 5)),
              }],
            },
            humidity: {
              ...prevData.humidity,
              labels: savedChartData.labels,
              datasets: [{
                data: savedChartData.datasets[0].data.map(score => 40 + (score / 2)),
              }],
            },
            deepSleep: {
              ...prevData.deepSleep,
              labels: savedChartData.labels,
              datasets: [{
                data: savedChartData.datasets[0].data.map(score => Math.floor(score / 20)),
              }],
            },
          }));
        }

        if (storedCardData) {
          const cardData = JSON.parse(storedCardData);
          setSleepQuality(cardData.quality);
          setSleepDuration(cardData.duration);
          setTemperature(cardData.temperature);
          setHumidity(cardData.humidity);
          setNoise(cardData.noise);
          setLight(cardData.light);
          setSleepInsights(cardData.insights);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    loadSavedData();
  }, []);

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
          style={[
            styles.timeSelectorButton, 
            timeRange === 'weekly' && styles.timeSelectorButtonActive
          ]}
          onPress={() => setTimeRange('weekly')}
        >
          <Text style={[
            styles.timeSelectorText, 
            timeRange === 'weekly' && styles.timeSelectorTextActive
          ]}>Weekly</Text>
        </TouchableOpacity>
        <View style={styles.timeSelectorDivider} />
        <TouchableOpacity 
          style={[
            styles.timeSelectorButton, 
            timeRange === 'monthly' && styles.timeSelectorButtonActive
          ]}
          onPress={() => setTimeRange('monthly')}
        >
          <Text style={[
            styles.timeSelectorText, 
            timeRange === 'monthly' && styles.timeSelectorTextActive
          ]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, styles.metricCardSleepQuality]}>
          <View style={styles.metricIconContainer}>
            <Activity size={24} color="#3B82F6" />
          </View>
          <Text style={styles.metricValue}>{sleepQuality}%</Text>
          <Text style={styles.metricLabel}>Sleep Quality</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardDuration]}>
          <View style={styles.metricIconContainer}>
            <Clock size={24} color="#EC4899" />
          </View>
          <Text style={styles.metricValue}>{sleepDuration}</Text>
          <Text style={styles.metricLabel}>Sleep Duration</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Activity size={24} color="#3B82F6" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Sleep Quality Trend</Text>
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
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Clock size={24} color="#EC4899" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Average Duration</Text>
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
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartTitleContainer}>
          <Brain size={24} color="#10B981" style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Deep Sleep</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData.deepSleep}
            width={chartWidth}
            height={220}
            chartConfig={chartConfigs.deepSleep}
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
            data={chartData.sleepCycles}
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
            data={chartData.noiseLevel}
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
            data={chartData.lightLevel}
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
            data={chartData.temperature}
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
            data={chartData.humidity}
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
  timeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeSelectorButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeSelectorButtonActive: {
    backgroundColor: '#1E293B',
  },
  timeSelectorText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
  },
  timeSelectorTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  timeSelectorDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
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