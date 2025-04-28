import { Accelerometer, Gyroscope } from 'expo-sensors';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { NativeModules, NativeEventEmitter } from 'react-native';

// Custom EventEmitter implementation for React Native
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

class SleepTrackingService {
  constructor() {
    this.isTracking = false;
    this.trackingInterval = null;
    this.accelerometerSubscription = null;
    this.gyroscopeSubscription = null;
    this.bedTime = '22:00'; // Default bed time
    this.wakeTime = '07:00'; // Default wake time
    this.isPhoneCharging = false;
    this.phoneState = 'idle'; // Possible states: 'idle', 'active', 'locked', 'screen_off'
    this.lastGyroData = null;
    this.currentDayEnabled = true;
    this.sleepData = []; // Array to store sleep data for the current window
    this.windowCheckInterval = null;
    this.eventEmitter = new EventEmitter();
    this.sleepDetectionEnabled = true; // Default to enabled
    this.deviceId = null;
    this.environmentalSensors = NativeModules.EnvironmentalSensors;
    this.environmentalSensorsEmitter = new NativeEventEmitter(this.environmentalSensors);
    this.currentEnvironmentalData = {
      light: 0,
      noise: 0
    };

    // Initialize device ID and load settings
    this.initializeDeviceId().then(() => {
      this.loadSettings();
    });

    // Start periodic check for sleep window
    this.startWindowCheck();

    // Set up environmental sensors listeners
    this.environmentalSensorsEmitter.addListener('environmentalSensorUpdate', (data) => {
      // Only update the values that are provided, keep existing values for others
      this.currentEnvironmentalData = {
        ...this.currentEnvironmentalData,
        light: data.light !== undefined ? data.light : this.currentEnvironmentalData.light,
        noise: data.noise !== undefined ? data.noise : this.currentEnvironmentalData.noise
      };
    });

    this.environmentalSensorsEmitter.addListener('environmentalSensorError', (error) => {
      console.error('Environmental sensor error:', error);
      this.eventEmitter.emit('sensorError', error);
    });

    this.environmentalSensorsEmitter.addListener('environmentalSensorStatus', (status) => {
      this.eventEmitter.emit('sensorStatus', status);
    });
  }

  async initializeDeviceId() {
    try {
      // Try to get existing device ID from storage
      let storedDeviceId = await AsyncStorage.getItem('deviceId');
      
      if (!storedDeviceId) {
        // Generate a new device ID if none exists
        storedDeviceId = `${Device.modelName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('deviceId', storedDeviceId);
      }
      
      this.deviceId = storedDeviceId;
    } catch (error) {
      console.error('Error initializing device ID:', error);
    }
  }

  async loadSettings() {
    try {
      const storageKey = `@sleepyai_settings_${this.deviceId}`;
      const savedSettings = await AsyncStorage.getItem(storageKey);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // Get current day
        const today = new Date().getDay();
        const adjustedDay = today === 0 ? 6 : today - 1;
        const currentDay = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][adjustedDay];
        
        if (settings.days && settings.days[currentDay]) {
          this.bedTime = settings.days[currentDay].bedtime;
          this.wakeTime = settings.days[currentDay].wakeup;
          // Emit event to notify components of loaded settings
          this.eventEmitter.emit('sleepWindowUpdate', { bedTime: this.bedTime, wakeTime: this.wakeTime });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  startWindowCheck() {
    // Check every minute if we should start/stop tracking
    this.windowCheckInterval = setInterval(() => {
      if (this.currentDayEnabled && this.sleepDetectionEnabled) {
        const isWithin = this.isWithinSleepWindow();
        if (isWithin && !this.isTracking) {
          this.startTracking();
        } else if (!isWithin && this.isTracking) {
          this.stopTracking();
        }
      } else if (this.isTracking) {
        // If sleep detection is disabled or current day is disabled, stop tracking
        this.stopTracking();
      }
    }, 60000); // Check every minute
  }

  stopWindowCheck() {
    if (this.windowCheckInterval) {
      clearInterval(this.windowCheckInterval);
      this.windowCheckInterval = null;
    }
  }

  setSleepWindow(bedTime, wakeTime) {
    this.bedTime = bedTime;
    this.wakeTime = wakeTime;
    // Reset sleep data when window changes
    this.sleepData = [];
    // Emit event for sleep window update
    this.eventEmitter.emit('sleepWindowUpdate', { bedTime, wakeTime });
  }

  setCurrentDayEnabled(enabled) {
    this.currentDayEnabled = enabled;
    if (!enabled) {
      this.stopTracking();
      this.sleepData = []; // Reset sleep data when day is disabled
    }
  }

  isWithinSleepWindow() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [bedHours, bedMinutes] = this.bedTime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = this.wakeTime.split(':').map(Number);
    
    const bedTimeInMinutes = bedHours * 60 + bedMinutes;
    const wakeTimeInMinutes = wakeHours * 60 + wakeMinutes;

    // If bedtime is after wake time (e.g., 22:00 to 07:00)
    if (bedTimeInMinutes > wakeTimeInMinutes) {
      // Check if current time is exactly wake time
      if (currentTime === wakeTimeInMinutes) {
        // If we're at wake time, stop tracking
        this.stopTracking();
        return false;
      }
      // Otherwise, check if we're within the overnight window
      return currentTime >= bedTimeInMinutes || currentTime < wakeTimeInMinutes;
    } else {
      // For same-day windows (e.g., 22:00 to 23:00)
      // Check if current time is exactly wake time
      if (currentTime === wakeTimeInMinutes) {
        // If we're at wake time, stop tracking
        this.stopTracking();
        return false;
      }
      // Otherwise, check if we're within the window
      return currentTime >= bedTimeInMinutes && currentTime < wakeTimeInMinutes;
    }
  }

  formatSensorData(data, isGyroscope = false) {
    const multiplier = isGyroscope ? 1000 : 1;
    return {
      x: Number((data.x * multiplier).toFixed(2)),
      y: Number((data.y * multiplier).toFixed(2)),
      z: Number((data.z * multiplier).toFixed(2))
    };
  }

  logSleepData(accelerometerData, gyroscopeData) {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const accel = this.formatSensorData(accelerometerData);
    const gyro = this.formatSensorData(gyroscopeData, true);
    
    const dataPoint = {
      time,
      accelerometer: accel,
      gyroscope: gyro,
      charging: this.isPhoneCharging,
      state: this.phoneState,
      environmental: {
        noise: this.currentEnvironmentalData.noise,
        light: this.currentEnvironmentalData.light
      }
    };

    // Add data point to sleep data array
    this.sleepData.push(dataPoint);
    
    // Log the current data point
    console.log(`T=${time} A=${accel.x.toFixed(2)},${accel.y.toFixed(2)},${accel.z.toFixed(2)} G=${gyro.x.toFixed(2)},${gyro.y.toFixed(2)},${gyro.z.toFixed(2)} C=${this.isPhoneCharging ? '1' : '0'} S=${this.phoneState} N=${this.currentEnvironmentalData.noise} L=${this.currentEnvironmentalData.light}`);
  }

  startTracking() {
    if (this.isTracking) return;
    if (!this.currentDayEnabled) return;
    if (!this.sleepDetectionEnabled) return;
    if (!this.isWithinSleepWindow()) return;

    // Reset sleep data when starting new tracking session
    this.sleepData = [];

    // Start environmental sensors
    this.environmentalSensors.startListening();

    Accelerometer.setUpdateInterval(10000);
    Gyroscope.setUpdateInterval(10000);

    this.accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
      if (this.isWithinSleepWindow() && this.lastGyroData) {
        this.logSleepData(accelerometerData, this.lastGyroData);
      } else if (!this.isWithinSleepWindow()) {
        this.stopTracking();
      }
    });

    this.gyroscopeSubscription = Gyroscope.addListener(gyroscopeData => {
      this.lastGyroData = gyroscopeData;
    });

    this.isTracking = true;
    console.log('Sleep tracking started');
  }

  stopTracking() {
    if (!this.isTracking) return;

    // Stop environmental sensors
    this.environmentalSensors.stopListening();

    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    this.lastGyroData = null;
    this.isTracking = false;
    console.log('Sleep tracking stopped');

    // Analyze collected data if we have any
    if (this.sleepData.length > 0) {
      this.analyzeSleepData();
      this.sleepData = []; // Reset data after analysis
    }
  }

  setPhoneCharging(isCharging) {
    this.isPhoneCharging = isCharging;
  }

  setPhoneInUse(isInUse) {
    this.phoneState = isInUse ? 'active' : 'idle';
  }

  async analyzeSleepData() {
    if (this.sleepData.length === 0) return;
    const groqKey = Constants.expoConfig.extra.EXPO_PUBLIC_GROQ_API_KEY;
    if (!groqKey) {
      return null;
    }

    try {
      // Calculate average environmental data
      const environmentalAverages = this.sleepData.reduce((acc, data) => {
        acc.noise += data.environmental.noise;
        acc.light += data.environmental.light;
        return acc;
      }, { noise: 0, light: 0 });

      const dataCount = this.sleepData.length;
      environmentalAverages.noise = Math.round(environmentalAverages.noise / dataCount);
      environmentalAverages.light = Math.round(environmentalAverages.light / dataCount);

      // Get weather data
      let weatherData;
      try {
        weatherData = await this.environmentalSensors.getWeatherData();
      } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherData = { temperature: 0, humidity: 0 };
      }

      // Prepare environmental data for emission
      const environmentalData = this.sleepData.map(data => ({
        noise: data.environmental.noise,
        light: data.environmental.light
      }));
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "system",
            content: `You are a sleep analysis expert. This is a TEST with only a few minutes of sleep tracking data, not a full night's sleep.

IMPORTANT: Return ONLY raw JSON without any markdown formatting, code blocks, or extra characters.

Analyze the following sleep data and provide:
1. Sleep quality scores (0-100) for each timestamp
2. Sleep cycle count:
   - Count the number of complete sleep cycles
   - A cycle is counted when sleep quality transitions from high to low and back to high
3. A recommendation for the sleep window if needed
   - Base your recommendation on when the user actually falls asleep, not just the set bedtime
   - Recommend a bedtime that aligns with when the user naturally falls asleep according to the data
4. Actual sleep start and end times:
   - Identify when the user actually fell asleep (not just when tracking started)
   - Identify when the user actually woke up (not just when tracking ended)

Rules for sleep quality scoring:
- Score based on:
  * Movement patterns (accelerometer/gyroscope data)
  * Phone charging state
  * Phone usage state
  * Environmental factors
- ONLY create quality scores for the actual sleep period, not the entire tracking window
- If the user didn't fall asleep immediately when tracking started, don't include those early data points
- If the user woke up before tracking ended, don't include those later data points
- Provide a maximum of 12 key data points that represent important moments (sleep start, end, and significant quality changes)
- Higher scores indicate better sleep quality
- Above 70 is considered deep sleep

Rules for sleep cycle counting:
- Count a cycle when sleep quality transitions from high to low and back to high
- Ensure at least one cycle is counted if there's any sleep data

Rules for sleep window recommendation:
- Only recommend changes if you see clear patterns in the data
- Consider the current sleep window: ${this.bedTime}-${this.wakeTime}
- Base your recommendation on when the user actually falls asleep according to the data
- If the user consistently falls asleep later than the set bedtime or wakes up earlier than the set wake time, recommend adjusting the bedtime or wake time to match their natural sleep pattern
- Add some buffer time before the actual sleep start and after the actual sleep end to account for potential miscalculations and variations in sleep patterns

Expected format (exactly like this, no extra characters):
{"scores":{"HH:MM:SS":85,"HH:MM:SS":45},"cycles":{"count":3},"recommendation":{"bedtime":"HH:MM","waketime":"HH:MM"},"actualSleep":{"start":"HH:MM:SS","end":"HH:MM:SS"}}`
          }, {
            role: "user",
            content: `timestamp,acc_x,acc_y,acc_z,gyro_x,gyro_y,gyro_z,charging,phone_state,noise,light
${this.sleepData.map(point => 
  `${point.time},${point.accelerometer.x},${point.accelerometer.y},${point.accelerometer.z},${point.gyroscope.x},${point.gyroscope.y},${point.gyroscope.z},${point.charging},${point.state},${point.environmental.noise},${point.environmental.light}`
).join('\n')}`
          }],
          temperature: 0.3,
          max_tokens: 500,
          stream: false
        })
      });

      const data = await response.json();

      let analysis;
      try {
        // Clean up the response content by removing any extra characters
        const cleanedContent = data.choices[0].message.content
          .trim()
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
        
        analysis = JSON.parse(cleanedContent);
      } catch (error) {
        console.error('Error cleaning up response content:', error);
        return null;
      }

      // Validate the response structure
      if (!analysis.scores || typeof analysis.scores !== 'object') {
        console.error('Invalid response structure:', analysis);
        return null;
      }

      // Calculate actual sleep duration based on actualSleep times
      let actualSleepDuration = 0;
      
      if (analysis.actualSleep && analysis.actualSleep.start && analysis.actualSleep.end) {
        const [startHours, startMinutes] = analysis.actualSleep.start.split(':').map(Number);
        const [endHours, endMinutes] = analysis.actualSleep.end.split(':').map(Number);
        
        actualSleepDuration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Handle overnight case
        if (actualSleepDuration < 0) {
          actualSleepDuration += 24 * 60; // Add 24 hours worth of minutes
        }
      }

      // After successful analysis, save the sleep record
      const sleepRecord = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        duration: actualSleepDuration, // Use actual sleep duration instead of tracking window
        quality: Math.round(Object.values(analysis.scores).reduce((a, b) => a + b, 0) / Object.keys(analysis.scores).length),
        cycles: analysis.cycles.count,
        cycleDuration: Math.round(actualSleepDuration / analysis.cycles.count), // Calculate average cycle duration
        qualityScores: analysis.scores, // Include all quality scores with timestamps
        environmental: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          noise: environmentalAverages.noise,
          light: environmentalAverages.light
        },
        actualSleep: analysis.actualSleep || { start: this.sleepData[0].time, end: this.sleepData[this.sleepData.length - 1].time }
      };

      // Save to AsyncStorage with device-specific key
      try {
        const storageKey = `sleepRecords_${this.deviceId}`;
        const existingRecords = await AsyncStorage.getItem(storageKey);
        let records = existingRecords ? JSON.parse(existingRecords) : [];
        
        // Add new record to the beginning of the array
        records.unshift(sleepRecord);
        
        // Keep only the 7 most recent records
        records = records.slice(0, 7);
        
        // Save updated records
        await AsyncStorage.setItem(storageKey, JSON.stringify(records));
        
        // Emit event with updated records
        this.eventEmitter.emit('sleepRecordsUpdate', records);
      } catch (error) {
        console.error('Error saving sleep record:', error);
      }

      return analysis.scores;
    } catch (error) {
      console.error('Error analyzing sleep data:', error);
      return null;
    }
  }

  async getSleepRecords() {
    try {
      const storageKey = `sleepRecords_${this.deviceId}`;
      const records = await AsyncStorage.getItem(storageKey);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('Error getting sleep records:', error);
      return [];
    }
  }

  onSleepQualityUpdate(callback) {
    this.eventEmitter.on('sleepQualityUpdate', callback);
  }

  offSleepQualityUpdate(callback) {
    this.eventEmitter.off('sleepQualityUpdate', callback);
  }

  onSleepWindowUpdate(callback) {
    this.eventEmitter.on('sleepWindowUpdate', callback);
  }

  offSleepWindowUpdate(callback) {
    this.eventEmitter.off('sleepWindowUpdate', callback);
  }

  onSleepRecordsUpdate(callback) {
    this.eventEmitter.on('sleepRecordsUpdate', callback);
  }

  offSleepRecordsUpdate(callback) {
    this.eventEmitter.off('sleepRecordsUpdate', callback);
  }

  onSleepDetectionUpdate(callback) {
    this.eventEmitter.on('sleepDetectionUpdate', callback);
  }

  offSleepDetectionUpdate(callback) {
    this.eventEmitter.off('sleepDetectionUpdate', callback);
  }

  onSensorError(callback) {
    this.eventEmitter.on('sensorError', callback);
  }

  offSensorError(callback) {
    this.eventEmitter.off('sensorError', callback);
  }

  onSensorStatus(callback) {
    this.eventEmitter.on('sensorStatus', callback);
  }

  offSensorStatus(callback) {
    this.eventEmitter.off('sensorStatus', callback);
  }

  setSleepDetectionEnabled(enabled) {
    this.sleepDetectionEnabled = enabled;
    if (!enabled && this.isTracking) {
      this.stopTracking();
    }
    // Emit event for sleep detection update
    this.eventEmitter.emit('sleepDetectionUpdate', { enabled });
  }
}

export default new SleepTrackingService();