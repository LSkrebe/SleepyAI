import { Accelerometer, Gyroscope } from 'expo-sensors';
import { GROQ_API_KEY } from '@env';
import { EventEmitter } from 'events';

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

    // Start periodic check for sleep window
    this.startWindowCheck();
  }

  startWindowCheck() {
    // Check every minute if we should start/stop tracking
    this.windowCheckInterval = setInterval(() => {
      if (this.currentDayEnabled) {
        const isWithin = this.isWithinSleepWindow();
        if (isWithin && !this.isTracking) {
          this.startTracking();
        } else if (!isWithin && this.isTracking) {
          this.stopTracking();
        }
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
        noise: 'NaN',
        light: 'NaN',
        temperature: 'NaN',
        humidity: 'NaN'
      }
    };

    // Add data point to sleep data array
    this.sleepData.push(dataPoint);
    
    // Log the current data point
    console.log(`T=${time} A=${accel.x.toFixed(2)},${accel.y.toFixed(2)},${accel.z.toFixed(2)} G=${gyro.x.toFixed(2)},${gyro.y.toFixed(2)},${gyro.z.toFixed(2)} C=${this.isPhoneCharging ? '1' : '0'} S=${this.phoneState} N=M L=M T=M H=M`);
  }

  startTracking() {
    if (this.isTracking) return;
    if (!this.currentDayEnabled) return;
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
    if (!GROQ_API_KEY) {
      return null;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
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
4. Sleep insights based on the data (2-3 normal length, actionable insights)

Rules for sleep quality scoring:
- Score based on:
  * Movement patterns (accelerometer/gyroscope data)
  * Phone charging state
  * Phone usage state
  * Environmental factors
- Since this is a test with limited data, provide a maximum of 12 data points
- Higher scores indicate better sleep quality
- Above 70 is considered deep sleep

Rules for sleep cycle counting:
- Count a cycle when sleep quality transitions from high to low and back to high
- Ensure at least one cycle is counted if there's any sleep data

Rules for sleep window recommendation:
- Only recommend changes if you see clear patterns in the data
- Consider the current sleep window: ${this.bedTime}-${this.wakeTime}

Rules for sleep insights:
- Provide 2-3 normal length, creative insights based on the data
- Make insights actionable with clear suggestions

Expected format (exactly like this, no extra characters):
{"scores":{"HH:MM:SS":85,"HH:MM:SS":45},"cycles":{"count":3},"recommendation":{"bedtime":"HH:MM","waketime":"HH:MM"},"insights":["insight 1","insight 2","insight 3"]}`
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
      console.log('Raw API Response:', data.choices[0].message.content);

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
        console.log('Response content:', data.choices[0].message.content);
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
      
      // Emit event with sleep quality scores and insights
      this.eventEmitter.emit('sleepQualityUpdate', {
        scores: analysis.scores,
        cycles: analysis.cycles,
        insights: analysis.insights || [],
        environmental: this.sleepData.map(data => data.environmental)
      });
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
}

export default new SleepTrackingService(); 