import { Accelerometer, Gyroscope } from 'expo-sensors';
import Constants from 'expo-constants';
import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // Start periodic check for sleep window
    this.startWindowCheck();
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
    
    // Generate realistic environmental data based on time of day
    const hour = now.getHours();
    let noise, light, temperature, humidity;

    // Noise levels (in dB)
    if (hour >= 22 || hour < 6) {
      // Night time - quieter
      noise = Math.floor(25 + Math.random() * 10); // 25-35 dB
    } else if (hour >= 6 && hour < 8) {
      // Early morning - moderate noise
      noise = Math.floor(35 + Math.random() * 15); // 35-50 dB
    } else {
      // Day time - higher noise
      noise = Math.floor(45 + Math.random() * 20); // 45-65 dB
    }

    // Light levels (in lux)
    if (hour >= 22 || hour < 6) {
      // Night time - very dark
      light = Math.floor(Math.random() * 5); // 0-5 lux
    } else if (hour >= 6 && hour < 8) {
      // Early morning - moderate light
      light = Math.floor(50 + Math.random() * 100); // 50-150 lux
    } else {
      // Day time - bright
      light = Math.floor(200 + Math.random() * 300); // 200-500 lux
    }

    // Temperature (in Celsius)
    if (hour >= 22 || hour < 6) {
      // Night time - cooler
      temperature = Math.floor(18 + Math.random() * 2); // 18-20°C
    } else if (hour >= 6 && hour < 8) {
      // Early morning - moderate
      temperature = Math.floor(20 + Math.random() * 2); // 20-22°C
    } else {
      // Day time - warmer
      temperature = Math.floor(22 + Math.random() * 3); // 22-25°C
    }

    // Humidity (in percentage)
    if (hour >= 22 || hour < 6) {
      // Night time - higher humidity
      humidity = Math.floor(45 + Math.random() * 10); // 45-55%
    } else if (hour >= 6 && hour < 8) {
      // Early morning - moderate humidity
      humidity = Math.floor(40 + Math.random() * 10); // 40-50%
    } else {
      // Day time - lower humidity
      humidity = Math.floor(35 + Math.random() * 10); // 35-45%
    }
    
    const dataPoint = {
      time,
      accelerometer: accel,
      gyroscope: gyro,
      charging: this.isPhoneCharging,
      state: this.phoneState,
      environmental: {
        noise,
        light,
        temperature,
        humidity
      }
    };

    // Add data point to sleep data array
    this.sleepData.push(dataPoint);
    
    // Log the current data point
    console.log(`T=${time} A=${accel.x.toFixed(2)},${accel.y.toFixed(2)},${accel.z.toFixed(2)} G=${gyro.x.toFixed(2)},${gyro.y.toFixed(2)},${gyro.z.toFixed(2)} C=${this.isPhoneCharging ? '1' : '0'} S=${this.phoneState} N=${noise} L=${light} T=${temperature} H=${humidity}`);
  }

  startTracking() {
    if (this.isTracking) return;
    if (!this.currentDayEnabled) return;
    if (!this.sleepDetectionEnabled) return;
    if (!this.isWithinSleepWindow()) return;

    // Reset sleep data when starting new tracking session
    this.sleepData = [];

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
      // Calculate tracking window duration (for reference)
      const firstTime = this.sleepData[0].time;
      const lastTime = this.sleepData[this.sleepData.length - 1].time;
      
      // Parse times into hours and minutes
      const [firstHours, firstMinutes] = firstTime.split(':').map(Number);
      const [lastHours, lastMinutes] = lastTime.split(':').map(Number);
      
      // Calculate total minutes for tracking window
      let trackingWindowMinutes = (lastHours * 60 + lastMinutes) - (firstHours * 60 + firstMinutes);
      
      // Handle overnight case
      if (trackingWindowMinutes < 0) {
        trackingWindowMinutes += 24 * 60; // Add 24 hours worth of minutes
      }

      // Calculate average environmental data
      const environmentalAverages = this.sleepData.reduce((acc, data) => {
        acc.temperature += data.environmental.temperature;
        acc.humidity += data.environmental.humidity;
        acc.noise += data.environmental.noise;
        acc.light += data.environmental.light;
        return acc;
      }, { temperature: 0, humidity: 0, noise: 0, light: 0 });

      const dataCount = this.sleepData.length;
      environmentalAverages.temperature = Math.round(environmentalAverages.temperature / dataCount);
      environmentalAverages.humidity = Math.round(environmentalAverages.humidity / dataCount);
      environmentalAverages.noise = Math.round(environmentalAverages.noise / dataCount);
      environmentalAverages.light = Math.round(environmentalAverages.light / dataCount);

      // Prepare environmental data for emission
      const environmentalData = this.sleepData.map(data => ({
        temperature: data.environmental.temperature,
        humidity: data.environmental.humidity,
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
            content: `timestamp,acc_x,acc_y,acc_z,gyro_x,gyro_y,gyro_z,charging,phone_state,noise,light,temperature,humidity
${this.sleepData.map(point => 
  `${point.time},${point.accelerometer.x},${point.accelerometer.y},${point.accelerometer.z},${point.gyroscope.x},${point.gyroscope.y},${point.gyroscope.z},${point.charging},${point.state},${point.environmental.noise},${point.environmental.light},${point.environmental.temperature},${point.environmental.humidity}`
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

      } catch (parseError) {
        console.error('Failed to parse API response:', parseError);
        return null;
      }
      
      // Validate the response structure
      if (!analysis.scores || typeof analysis.scores !== 'object') {
        console.error('Invalid response structure:', analysis);
        return null;
      }
      
      // Store the recommendation for the next occurrence of this day
      // but don't update the current tracking session
      if (analysis.recommendation) {
        const { bedtime, waketime } = analysis.recommendation;
        // Emit event with both current and recommended times
        this.eventEmitter.emit('sleepWindowUpdate', {
          bedTime: this.bedTime,
          wakeTime: this.wakeTime,
          recommendedBedTime: bedtime,
          recommendedWakeTime: waketime,
          currentDay: this.getCurrentDay()
        });
      }
      
      // Emit event with sleep quality scores
      this.eventEmitter.emit('sleepQualityUpdate', {
        scores: analysis.scores,
        cycles: analysis.cycles,
        environmental: environmentalData,
        sleepDuration: trackingWindowMinutes, // Keep tracking window duration for backward compatibility
        actualSleep: analysis.actualSleep || { start: firstTime, end: lastTime }
      });

      // Calculate actual sleep duration based on actualSleep times
      let actualSleepDuration = trackingWindowMinutes; // Default to tracking window duration
      
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
        environmental: {
          temperature: environmentalAverages.temperature,
          humidity: environmentalAverages.humidity,
          noise: environmentalAverages.noise,
          light: environmentalAverages.light
        },
        actualSleep: analysis.actualSleep || { start: firstTime, end: lastTime }
      };

      // Save to AsyncStorage
      try {
        const existingRecords = await AsyncStorage.getItem('sleepRecords');
        let records = existingRecords ? JSON.parse(existingRecords) : [];
        
        // Keep only the last 7 days of records
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        records = records.filter(record => new Date(record.date) >= oneWeekAgo);
        
        // Add new record
        records.push(sleepRecord);
        
        // Save updated records
        await AsyncStorage.setItem('sleepRecords', JSON.stringify(records));
        
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

  calculateSleepCycles(scores) {
    if (!scores || Object.keys(scores).length === 0) return 0;
    
    // Convert scores to array of values
    const scoreValues = Object.values(scores);
    
    // Count cycles based on significant changes in sleep quality
    let cycleCount = 0;
    let lastScore = null;
    let isAscending = false;
    
    for (const score of scoreValues) {
      if (lastScore !== null) {
        // Detect cycle transitions based on significant changes
        if (Math.abs(score - lastScore) > 30) {
          if (score > lastScore && !isAscending) {
            cycleCount++;
            isAscending = true;
          } else if (score < lastScore && isAscending) {
            isAscending = false;
          }
        }
      }
      lastScore = score;
    }
    
    return Math.max(1, cycleCount);
  }

  getCurrentDay() {
    const today = new Date().getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    return today === 0 ? 6 : today - 1;
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

  // Add new method to get sleep records
  async getSleepRecords() {
    try {
      const records = await AsyncStorage.getItem('sleepRecords');
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('Error getting sleep records:', error);
      return [];
    }
  }

  // Add new event listener methods
  onSleepRecordsUpdate(callback) {
    this.eventEmitter.on('sleepRecordsUpdate', callback);
  }

  offSleepRecordsUpdate(callback) {
    this.eventEmitter.off('sleepRecordsUpdate', callback);
  }

  // Add a new method to set sleep detection enabled/disabled
  setSleepDetectionEnabled(enabled) {
    this.sleepDetectionEnabled = enabled;
    if (!enabled && this.isTracking) {
      this.stopTracking();
    }
    // Emit event for sleep detection update
    this.eventEmitter.emit('sleepDetectionUpdate', { enabled });
  }

  // Add methods to subscribe to sleep detection updates
  onSleepDetectionUpdate(callback) {
    this.eventEmitter.on('sleepDetectionUpdate', callback);
  }

  offSleepDetectionUpdate(callback) {
    this.eventEmitter.off('sleepDetectionUpdate', callback);
  }
}

export default new SleepTrackingService(); 