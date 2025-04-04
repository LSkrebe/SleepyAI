import { Accelerometer, Gyroscope } from 'expo-sensors';
import { GROQ_API_KEY } from '@env';

class SleepTrackingService {
  constructor() {
    this.isTracking = false;
    this.trackingInterval = null;
    this.accelerometerSubscription = null;
    this.gyroscopeSubscription = null;
    this.bedTime = '22:00'; // Default bed time
    this.wakeTime = '07:00'; // Default wake time
    this.isPhoneCharging = false;
    this.isPhoneInUse = false;
    this.lastGyroData = null;
    this.currentDayEnabled = true;
    this.sleepData = []; // Array to store sleep data for the current window
    this.windowCheckInterval = null;

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
      state: this.isPhoneInUse ? 'A' : 'I',
      environmental: {
        noise: 'M',
        light: 'M',
        temperature: 'M',
        humidity: 'M'
      }
    };

    // Add data point to sleep data array
    this.sleepData.push(dataPoint);
    
    // Log the current data point
    console.log(`T=${time} A=${accel.x.toFixed(2)},${accel.y.toFixed(2)},${accel.z.toFixed(2)} G=${gyro.x.toFixed(2)},${gyro.y.toFixed(2)},${gyro.z.toFixed(2)} C=${this.isPhoneCharging ? '1' : '0'} S=${this.isPhoneInUse ? 'A' : 'I'} N=M L=M T=M H=M`);
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
      console.log('Analyzing collected sleep data');
      this.analyzeSleepData();
      this.sleepData = []; // Reset data after analysis
    }
  }

  setPhoneCharging(isCharging) {
    this.isPhoneCharging = isCharging;
  }

  setPhoneInUse(isInUse) {
    this.isPhoneInUse = isInUse;
  }

  async analyzeSleepData() {
    if (this.sleepData.length === 0) return;
    if (!GROQ_API_KEY) {
      console.log('Groq API key not found. Skipping sleep analysis.');
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
            
            Analyze the following sleep data and provide a JSON response with:
            1. Sleep quality scores (0-100) for each 10-second interval
            2. A recommendation for the sleep window if needed
            
            Rules for sleep quality scores:
            1. Score 0-100 based on:
               - Movement (accelerometer/gyroscope data)
               - Phone charging state
               - Phone usage state
               - Environmental factors
            2. Higher scores mean better sleep quality
            3. Since this is a test with limited data, provide scores for each 10-second interval where we have data
            
            Rules for sleep window recommendation:
            1. Only recommend changes if you see clear patterns in the data
            2. Consider the current sleep window: ${this.bedTime}-${this.wakeTime}
            
            Output format:
            {
              "scores": {
                "HH:MM:SS": score,
                ...
              },
              "recommendation": {
                "bedtime": "HH:MM",
                "waketime": "HH:MM"
              } or null
            }`
          }, {
            role: "user",
            content: JSON.stringify(this.sleepData)
          }],
          temperature: 0.3,
          max_tokens: 500,
          stream: false
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      
      // Log sleep window status
      if (analysis.recommendation) {
        const { bedtime, waketime } = analysis.recommendation;
        console.log(`Sleep window updated to ${bedtime}-${waketime}`);
        this.setSleepWindow(bedtime, waketime);
      } else {
        console.log(`Sleep window remains ${this.bedTime}-${this.wakeTime}`);
      }
      
      // Log sleep quality scores
      console.log('Sleep Quality Scores:', analysis.scores);
      return analysis.scores;
    } catch (error) {
      console.error('Error analyzing sleep data:', error);
      return null;
    }
  }
}

export default new SleepTrackingService(); 