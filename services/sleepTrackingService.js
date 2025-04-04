import { Accelerometer, Gyroscope } from 'expo-sensors';
import { OPENAI_API_KEY } from '@env';
import OpenAI from 'openai';

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

    // Initialize OpenAI client only if API key is available
    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });
    } else {
      console.warn('OpenAI API key not found. Sleep analysis will be disabled.');
      this.openai = null;
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
    if (!this.currentDayEnabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [bedHours, bedMinutes] = this.bedTime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = this.wakeTime.split(':').map(Number);
    
    const bedTimeInMinutes = bedHours * 60 + bedMinutes;
    const wakeTimeInMinutes = wakeHours * 60 + wakeMinutes;

    const isWithinWindow = bedTimeInMinutes > wakeTimeInMinutes
      ? currentTime >= bedTimeInMinutes || currentTime <= wakeTimeInMinutes
      : currentTime >= bedTimeInMinutes && currentTime <= wakeTimeInMinutes;

    // If we just left the sleep window, analyze the collected data
    if (!isWithinWindow && this.sleepData.length > 0) {
      console.log('Sleep window ended, analyzing data');
      this.analyzeSleepData();
      this.sleepData = [];
    }

    return isWithinWindow;
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
    const time = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
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
  }

  setPhoneCharging(isCharging) {
    this.isPhoneCharging = isCharging;
  }

  setPhoneInUse(isInUse) {
    this.isPhoneInUse = isInUse;
  }

  async analyzeSleepData() {
    if (this.sleepData.length === 0) return;
    if (!this.openai) {
      console.log('OpenAI client not initialized. Skipping sleep analysis.');
      return null;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `You are a sleep analysis expert. This is a TEST with only a few minutes of sleep tracking data, not a full night's sleep.
          
          Analyze the following sleep data and provide sleep quality scores (0-100) for each 30-minute interval.
          
          Rules:
          1. Only output scores in the format: 'HH:MM:SCORE'
          2. Score 0-100 based on:
             - Movement (accelerometer/gyroscope data)
             - Phone charging state
             - Phone usage state
             - Environmental factors
          3. Higher scores mean better sleep quality
          4. One score per line
          5. No explanations or additional text
          6. Since this is a test with limited data, provide scores for the time periods where we have data`
        }, {
          role: "user",
          content: JSON.stringify(this.sleepData)
        }],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = completion.choices[0].message.content;
      
      // Log raw API response
      console.log('Raw API Response:', analysis);
      
      // Process the analysis into 30-minute intervals
      const scores = this.processSleepScores(analysis);
      console.log('Processed Sleep Quality Scores:', scores);
      
      return scores;
    } catch (error) {
      console.error('Error analyzing sleep data:', error);
      return null;
    }
  }

  processSleepScores(analysis) {
    // Split the analysis into lines and parse each score
    const lines = analysis.split('\n');
    const scores = {};
    
    lines.forEach(line => {
      const match = line.match(/(\d{2}:\d{2}):(\d+)/);
      if (match) {
        const [_, time, score] = match;
        scores[time] = parseInt(score);
      }
    });
    
    return scores;
  }
}

export default new SleepTrackingService(); 