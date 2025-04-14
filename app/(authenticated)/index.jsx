import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Moon, Brain, Thermometer, Droplets, Volume2, Sun, Timer, BellRing, Activity } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAlarm } from '../../context/AlarmContext';
import { router } from 'expo-router';
import sleepTrackingService from '../../services/sleepTrackingService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32; // Adjusted to match stats page

export default function Journal() {
  const { alarmTime, isAlarmActive } = useAlarm();
  const [sleepQuality, setSleepQuality] = useState(85);
  const [sleepDuration, setSleepDuration] = useState('7:30');
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(45);
  const [noise, setNoise] = useState(30);
  const [light, setLight] = useState(1);
  const [sleepCycles, setSleepCycles] = useState(4);
  const [cycleDuration, setCycleDuration] = useState(90);
  const [sleepQualityData, setSleepQualityData] = useState({
    labels: ['22', '23', '0', '1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: [0, 45, 20, 85, 70, 90, 40, 70, 30, 0],
    }],
  });
  const [sleepInsights, setSleepInsights] = useState([
    "Maintain a consistent sleep schedule by going to bed and waking up at the same time every day, even on weekends",
    "Keep your bedroom temperature between 18-22°C and ensure it's completely dark for optimal sleep conditions",
    "Avoid using electronic devices at least 1 hour before bedtime as blue light can disrupt your natural sleep cycle"
  ]);
  const [sleepData, setSleepData] = useState([]);
  const [latestSleepDate, setLatestSleepDate] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const slideUpAnim2 = useRef(new Animated.Value(100)).current;
  const slideUpAnim3 = useRef(new Animated.Value(100)).current;
  const slideUpAnim4 = useRef(new Animated.Value(100)).current;
  const slideUpAnim5 = useRef(new Animated.Value(100)).current;

  // Save card data to AsyncStorage
  const saveCardData = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem('cardData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving card data:', error);
    }
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Today\'s Sleep';
    
    const sleepDate = new Date(dateString);
    const now = new Date();
    
    // Compare dates without time
    const sleepDateOnly = new Date(sleepDate.getFullYear(), sleepDate.getMonth(), sleepDate.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get the difference in days
    const diffTime = nowDateOnly - sleepDateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today\'s Sleep';
    } else if (diffDays === 1) {
      return 'Yesterday\'s Sleep';
    } else {
      return 'Latest Sleep';
    }
  };

  // Format date subtitle
  const formatDateSubtitle = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load saved sleep data and chart data
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
          setSleepQualityData(JSON.parse(storedChartData));
        }

        if (storedCardData) {
          const cardData = JSON.parse(storedCardData);
          setSleepQuality(cardData.quality);
          setSleepDuration(cardData.duration);
          setSleepCycles(cardData.cycles);
          setCycleDuration(cardData.cycleDuration);
          setTemperature(cardData.temperature);
          setHumidity(cardData.humidity);
          setNoise(cardData.noise);
          setLight(cardData.light);
          setSleepInsights(cardData.insights);
          // Only update latestSleepDate if it's not already set from sleepData
          if (!latestSleepDate) {
            setLatestSleepDate(cardData.date);
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    loadSavedData();
  }, []);

  // Save sleep data and chart data whenever they change
  useEffect(() => {
    const saveData = async () => {
      try {
        const cardData = {
          quality: sleepQuality,
          duration: sleepDuration,
          cycles: sleepCycles,
          cycleDuration: cycleDuration,
          temperature: temperature,
          humidity: humidity,
          noise: noise,
          light: light,
          insights: sleepInsights,
          date: latestSleepDate
        };

        await Promise.all([
          AsyncStorage.setItem('sleepData', JSON.stringify(sleepData)),
          AsyncStorage.setItem('chartData', JSON.stringify(sleepQualityData)),
          AsyncStorage.setItem('cardData', JSON.stringify(cardData))
        ]);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }, [
    sleepData, 
    sleepQualityData, 
    sleepQuality, 
    sleepDuration, 
    sleepCycles, 
    cycleDuration,
    temperature,
    humidity,
    noise,
    light,
    sleepInsights,
    latestSleepDate
  ]);

  const handleSleepQualityUpdate = useCallback((data) => {
    // Process environmental data
    if (data.environmental && data.environmental.length > 0) {
      // Calculate average environmental values
      const avgEnvironmental = data.environmental.reduce((acc, curr) => ({
        temperature: acc.temperature + curr.temperature,
        humidity: acc.humidity + curr.humidity,
        noise: acc.noise + curr.noise,
        light: acc.light + curr.light
      }), { temperature: 0, humidity: 0, noise: 0, light: 0 });

      const count = data.environmental.length;
      setTemperature(Math.round(avgEnvironmental.temperature / count));
      setHumidity(Math.round(avgEnvironmental.humidity / count));
      setNoise(Math.round(avgEnvironmental.noise / count));
      setLight(Math.round(avgEnvironmental.light / count));
    }

    // Update sleep quality scores
    setSleepQuality(data.scores);
    
    // Update sleep duration based on actual sleep times
    if (data.actualSleep && data.actualSleep.start && data.actualSleep.end) {
      const [startHours, startMinutes] = data.actualSleep.start.split(':').map(Number);
      const [endHours, endMinutes] = data.actualSleep.end.split(':').map(Number);
      
      let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      
      // Handle overnight case
      if (duration < 0) {
        duration += 24 * 60; // Add 24 hours worth of minutes
      }
      
      setSleepDuration(duration);
    } else {
      // Fallback to tracking window duration if actual sleep times not available
      setSleepDuration(data.sleepDuration);
    }

    // Update sleep cycles
    if (data.cycles) {
      setSleepCycles(data.cycles.count);
      // Calculate average duration by dividing actual sleep duration by number of cycles
      if (data.actualSleep && data.actualSleep.start && data.actualSleep.end) {
        const [startHours, startMinutes] = data.actualSleep.start.split(':').map(Number);
        const [endHours, endMinutes] = data.actualSleep.end.split(':').map(Number);
        
        let actualSleepDuration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Handle overnight case
        if (actualSleepDuration < 0) {
          actualSleepDuration += 24 * 60; // Add 24 hours worth of minutes
        }
        
        setCycleDuration(Math.round(actualSleepDuration / data.cycles.count));
      } else {
        // Fallback to tracking window duration if actual sleep times not available
        const totalMinutes = data.sleepDuration;
        setCycleDuration(Math.round(totalMinutes / data.cycles.count));
      }
    }

    // Update insights
    if (data.insights) {
      setSleepInsights(data.insights);
    }

    // Save to AsyncStorage
    saveCardData({
      sleepQualityScores: data.scores || {},
      sleepCycles: data.cycles?.count || 0,
      sleepInsights: data.insights || [],
      temperature,
      humidity,
      noise,
      light
    });
  }, [saveCardData, temperature, humidity, noise, light]);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim2, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim3, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim4, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim5, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Listen for sleep quality updates
    const handleSleepQualityUpdate = (data) => {
      // Convert scores object to arrays for charting
      const scoresArray = Object.entries(data.scores).map(([time, score]) => ({
        time,
        score: typeof score === 'object' ? score.score : score
      }));

      // Get the start time of the sleep session (first timestamp)
      const startTime = scoresArray[0].time;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      
      // Determine the date based on the start time
      const now = new Date();
      const sleepDate = new Date(now);
      
      // Only adjust the date if the sleep session started after 6 PM and lasted into the next day
      const endTime = scoresArray[scoresArray.length - 1].time;
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // For same-day sleep sessions, use today's date
      if (startHour >= 18 && endHour < 6) { // If sleep started after 6 PM and ended before 6 AM
        sleepDate.setDate(sleepDate.getDate() - 1);
      }
      
      const sleepDateString = sleepDate.toISOString().split('T')[0];
      setLatestSleepDate(sleepDateString);

      // Format time labels to show only hours
      const labels = scoresArray.map(item => {
        const [hours] = item.time.split(':');
        return hours;
      });

      // Calculate average sleep quality
      const averageScore = scoresArray.reduce((sum, item) => sum + item.score, 0) / scoresArray.length;
      setSleepQuality(Math.round(averageScore));

      // Update sleep duration based on actual sleep times
      if (data.actualSleep && data.actualSleep.start && data.actualSleep.end) {
        const [startHours, startMinutes] = data.actualSleep.start.split(':').map(Number);
        const [endHours, endMinutes] = data.actualSleep.end.split(':').map(Number);
        
        let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Handle overnight case
        if (duration < 0) {
          duration += 24 * 60; // Add 24 hours worth of minutes
        }
        
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        setSleepDuration(`${hours}:${minutes.toString().padStart(2, '0')}`);
      } else {
        // Fallback to tracking window duration if actual sleep times not available
        const totalMinutes = data.sleepDuration;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setSleepDuration(`${hours}:${minutes.toString().padStart(2, '0')}`);
      }

      // Update sleep cycles from API response
      if (data.cycles) {
        setSleepCycles(data.cycles.count);
        // Calculate average duration by dividing actual sleep duration by number of cycles
        if (data.actualSleep && data.actualSleep.start && data.actualSleep.end) {
          const [startHours, startMinutes] = data.actualSleep.start.split(':').map(Number);
          const [endHours, endMinutes] = data.actualSleep.end.split(':').map(Number);
          
          let actualSleepDuration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
          
          // Handle overnight case
          if (actualSleepDuration < 0) {
            actualSleepDuration += 24 * 60; // Add 24 hours worth of minutes
          }
          
          setCycleDuration(Math.round(actualSleepDuration / data.cycles.count));
        } else {
          // Fallback to tracking window duration if actual sleep times not available
          const totalMinutes = data.sleepDuration;
          setCycleDuration(Math.round(totalMinutes / data.cycles.count));
        }
      }

      // Update environmental metrics from the sleep data
      if (data.environmental && data.environmental.length > 0) {
        // Calculate average environmental values for the sleep session
        const avgEnvironmental = data.environmental.reduce((acc, curr) => ({
          temperature: acc.temperature + curr.temperature,
          humidity: acc.humidity + curr.humidity,
          noise: acc.noise + curr.noise,
          light: acc.light + curr.light
        }), { temperature: 0, humidity: 0, noise: 0, light: 0 });

        const count = data.environmental.length;
        const newTemperature = Math.round(avgEnvironmental.temperature / count);
        const newHumidity = Math.round(avgEnvironmental.humidity / count);
        const newNoise = Math.round(avgEnvironmental.noise / count);
        const newLight = Math.round(avgEnvironmental.light / count);

        setTemperature(newTemperature);
        setHumidity(newHumidity);
        setNoise(newNoise);
        setLight(newLight);
      }

      // Update sleep insights
      setSleepInsights(data.insights || []);

      // Update chart data
      setSleepQualityData({
        labels,
        datasets: [{
          data: scoresArray.map(item => item.score),
        }],
      });

      // Save the updated data
      const cardData = {
        quality: Math.round(averageScore),
        duration: data.actualSleep && data.actualSleep.start && data.actualSleep.end 
          ? `${Math.floor((data.actualSleep.end.split(':').map(Number)[0] * 60 + data.actualSleep.end.split(':').map(Number)[1] - 
              (data.actualSleep.start.split(':').map(Number)[0] * 60 + data.actualSleep.start.split(':').map(Number)[1])) / 60)}:${((data.actualSleep.end.split(':').map(Number)[0] * 60 + data.actualSleep.end.split(':').map(Number)[1] - 
              (data.actualSleep.start.split(':').map(Number)[0] * 60 + data.actualSleep.start.split(':').map(Number)[1])) % 60).toString().padStart(2, '0')}`
          : `${Math.floor(data.sleepDuration / 60)}:${(data.sleepDuration % 60).toString().padStart(2, '0')}`,
        cycles: data.cycles ? data.cycles.count : sleepCycles,
        cycleDuration: data.cycles ? (data.actualSleep && data.actualSleep.start && data.actualSleep.end 
          ? Math.round((data.actualSleep.end.split(':').map(Number)[0] * 60 + data.actualSleep.end.split(':').map(Number)[1] - 
              (data.actualSleep.start.split(':').map(Number)[0] * 60 + data.actualSleep.start.split(':').map(Number)[1])) / data.cycles.count)
          : Math.round(data.sleepDuration / data.cycles.count)) : cycleDuration,
        temperature: data.environmental ? Math.round(data.environmental.reduce((sum, env) => sum + env.temperature, 0) / data.environmental.length) : temperature,
        humidity: data.environmental ? Math.round(data.environmental.reduce((sum, env) => sum + env.humidity, 0) / data.environmental.length) : humidity,
        noise: data.environmental ? Math.round(data.environmental.reduce((sum, env) => sum + env.noise, 0) / data.environmental.length) : noise,
        light: data.environmental ? Math.round(data.environmental.reduce((sum, env) => sum + env.light, 0) / data.environmental.length) : light,
        insights: data.insights || [],
        date: sleepDateString,
        timestamp: now.getTime() // Add timestamp to ensure correct date comparison
      };
      AsyncStorage.setItem('cardData', JSON.stringify(cardData));
    };

    // Set up the event listener
    sleepTrackingService.onSleepQualityUpdate(handleSleepQualityUpdate);

    // Clean up the event listener when component unmounts
    return () => {
      sleepTrackingService.offSleepQualityUpdate(handleSleepQualityUpdate);
    };
  }, []);

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
    paddingLeft: -30,
    paddingRight: 15,
  };

  const getTimeUntilAlarm = () => {
    const [hours, minutes] = alarmTime.split(':').map(Number);
    const now = new Date();
    const alarmTime = new Date(now);
    alarmTime.setHours(hours, minutes, 0, 0);

    // If the alarm time is in the past, set it for tomorrow
    if (alarmTime < now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const diff = alarmTime - now;
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil}m`;
    }
    return `${minutesUntil}m`;
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
        <View style={styles.appTitleContainer}>
          <Text style={styles.appTitle}>SleepyAI</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.appSubtitle}>Your personal sleep companion</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.todayCard, { transform: [{ translateY: slideUpAnim }], marginTop: 12 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.todayHeaderContent}>
            <Text style={styles.todayTitle}>
              {latestSleepDate ? formatDate(latestSleepDate) : 'Today\'s Sleep'}
            </Text>
            <Text style={styles.todaySubtitle}>
              {latestSleepDate ? formatDateSubtitle(latestSleepDate) : new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.todayIconContainer}>
            <Moon size={24} color="#3B82F6" />
          </View>
        </View>

        <View style={styles.todayContent}>
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
          <View style={styles.metricsGrid}>
            <View style={[styles.metricItem, styles.metricItemDuration]}>
              <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(132, 204, 22, 0.1)' }]}>
                <Timer size={24} color="#84CC16" />
              </View>
              <View style={styles.metricContent}>
                <View style={styles.metricValueContainer}>
                  <Text style={styles.metricValue}>{sleepDuration}</Text>
                </View>
                <Text style={styles.metricLabel}>Sleep Duration</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemQuality]}>
              <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                <Brain size={24} color="#06B6D4" />
              </View>
              <View style={styles.metricContent}>
                <View style={styles.metricValueContainer}>
                  <Text style={styles.metricValue}>{sleepQuality}%</Text>
                </View>
                <Text style={styles.metricLabel}>Sleep Quality</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cyclesCard, { transform: [{ translateY: slideUpAnim2 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.insightsHeaderContent}>
            <Text style={[styles.cardTitle, styles.cyclesTitle]}>Sleep Cycles</Text>
            <Text style={styles.insightsSubtitle}>Your sleep stages</Text>
          </View>
          <View style={styles.todayIconContainer}>
            <Timer size={24} color="#3B82F6" />
          </View>
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
              <Text style={styles.cycleValue}>{cycleDuration}</Text>
              <Text style={styles.cycleUnit}>min</Text>
            </View>
            <Text style={styles.cycleLabel}>Avg Duration</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.environmentCard, { transform: [{ translateY: slideUpAnim3 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.environmentHeaderContent}>
            <Text style={[styles.cardTitle, styles.environmentTitle]}>Sleep Environment</Text>
            <Text style={styles.environmentSubtitle}>Latest record</Text>
          </View>
          <View style={styles.environmentIconContainer}>
            <Activity size={24} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricItem, styles.metricItemTemperature]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
              <Thermometer size={24} color="#EC4899" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{temperature}°C</Text>
              <Text style={styles.metricLabel}>Temperature</Text>
            </View>
          </View>
          <View style={[styles.metricItem, styles.metricItemHumidity]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(14, 165, 233, 0.1)' }]}>
              <Droplets size={24} color="#0EA5E9" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{humidity}%</Text>
              <Text style={styles.metricLabel}>Humidity</Text>
            </View>
          </View>
          <View style={[styles.metricItem, styles.metricItemNoise]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Volume2 size={24} color="#6366F1" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{noise} dB</Text>
              <Text style={styles.metricLabel}>Noise Level</Text>
            </View>
          </View>
          <View style={[styles.metricItem, styles.metricItemLight]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Sun size={24} color="#F59E0B" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{light} lux</Text>
              <Text style={styles.metricLabel}>Light Level</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.alarmCard, { transform: [{ translateY: slideUpAnim4 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.insightsHeaderContent}>
            <Text style={[styles.cardTitle, styles.alarmTitle]}>Next Alarm</Text>
            <Text style={styles.insightsSubtitle}>Wake-up time</Text>
          </View>
          <View style={styles.todayIconContainer}>
            <BellRing size={24} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.alarmContent}>
          <View style={styles.alarmTimeContainer}>
            <Text style={styles.alarmTime}>{alarmTime}</Text>
            <View style={styles.alarmStatusContainer}>
              <View style={[styles.alarmStatusDot, { backgroundColor: isAlarmActive ? '#3B82F6' : '#94A3B8' }]} />
              <Text style={styles.alarmStatus}>
                {isAlarmActive ? 'Alarm is set' : 'No alarm set'}
              </Text>
            </View>
          </View>
          {isAlarmActive && (
            <View style={styles.alarmCountdown}>
              <Text style={styles.timeUntilAlarm}>
                {getTimeUntilAlarm()}
              </Text>
              <Text style={styles.countdownLabel}>until alarm</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.alarmEditButton}
            onPress={() => router.push('/alarm')}
          >
            <Text style={styles.alarmEditText}>Edit Alarm</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  appTitleContainer: {
    position: 'relative',
    zIndex: 2,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(226, 232, 240, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  appSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  todayCard: {
    marginTop: 0,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  todayContent: {
    flexDirection: 'column',
    gap: 16,
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  statUnit: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
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
    overflow: 'hidden'
  },
  chart: {
    marginVertical: 4,
    marginLeft: -20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  cyclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cycleItem: {
    alignItems: 'center',
    flex: 1,
  },
  cycleValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  cycleLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  cycleValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cycleUnit: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 4,
  },
  cycleDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  cyclesCard: {
    borderColor: 'rgba(51, 65, 85, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  cyclesTitle: {
    fontSize: 20,
    color: '#E2E8F0',
    marginBottom: 2,
  },
  insightsContainer: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    fontWeight: '400',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  alarmCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  alarmContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  alarmTime: {
    fontSize: 40,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  alarmStatus: {
    fontSize: 14,
    color: '#94A3B8',
  },
  alarmEditButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  alarmEditText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  todayHeaderContent: {
    flex: 1,
  },
  todayTitleContainer: {
    flex: 1,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  todaySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  todayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  environmentCard: {
    borderColor: 'rgba(51, 65, 85, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  environmentHeaderContent: {
    flex: 1,
  },
  environmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  environmentSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  environmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  metricIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricContent: {
    flex: 1,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  metricUnit: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricItemDuration: {
    backgroundColor: 'rgba(132, 204, 22, 0.1)',
    borderColor: 'rgba(132, 204, 22, 0.2)',
  },
  metricItemQuality: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  alarmTimeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  alarmStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alarmCountdown: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  timeUntilAlarm: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3B82F6',
    textShadowColor: 'rgba(59, 130, 246, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  countdownLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  alarmIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  insightsCard: {
    borderColor: 'rgba(51, 65, 85, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  insightsHeaderContent: {
    flex: 1,
  },
  insightsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  insightsSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  alarmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  alarmSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
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
  insightIconContainerTimer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  insightIconContainerThermometer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  insightIconContainerSun: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
}); 