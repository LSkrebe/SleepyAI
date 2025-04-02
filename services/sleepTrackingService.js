import { Accelerometer, Gyroscope } from 'expo-sensors';

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
  }

  setSleepWindow(bedTime, wakeTime) {
    this.bedTime = bedTime;
    this.wakeTime = wakeTime;
  }

  isWithinSleepWindow() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [bedHours, bedMinutes] = this.bedTime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = this.wakeTime.split(':').map(Number);
    
    const bedTimeInMinutes = bedHours * 60 + bedMinutes;
    const wakeTimeInMinutes = wakeHours * 60 + wakeMinutes;

    // Handle case where sleep window crosses midnight
    if (bedTimeInMinutes > wakeTimeInMinutes) {
      return currentTime >= bedTimeInMinutes || currentTime <= wakeTimeInMinutes;
    }
    
    return currentTime >= bedTimeInMinutes && currentTime <= wakeTimeInMinutes;
  }

  formatSensorData(data, isGyroscope = false) {
    const multiplier = isGyroscope ? 1000 : 1; // Multiply gyroscope values by 1000
    return {
      x: Number((data.x * multiplier).toFixed(2)),
      y: Number((data.y * multiplier).toFixed(2)),
      z: Number((data.z * multiplier).toFixed(2))
    };
  }

  logSleepData(accelerometerData, gyroscopeData) {
    const timestamp = new Date().toLocaleTimeString();
    const accel = this.formatSensorData(accelerometerData);
    const gyro = this.formatSensorData(gyroscopeData, true); // Pass true for gyroscope data
    
    console.log(`
Sleep Tracking Data:
-------------------
Time: ${timestamp}
Accelerometer: x=${accel.x}, y=${accel.y}, z=${accel.z}
Gyroscope: x=${gyro.x}, y=${gyro.y}, z=${gyro.z} (x1000)
Phone Charging: ${this.isPhoneCharging ? 'Yes' : 'No'}
Phone State: ${this.isPhoneInUse ? 'In Use' : 'Idle'}
Environmental Sensors:
- Noise: Mock
- Light: Mock
- Temperature: Mock
- Humidity: Mock
-------------------`);
  }

  startTracking() {
    if (this.isTracking) return;

    // Set up accelerometer
    Accelerometer.setUpdateInterval(10000); // Update every 10 seconds
    Gyroscope.setUpdateInterval(10000); // Update every 10 seconds

    // Set up accelerometer subscription
    this.accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
      if (this.isWithinSleepWindow() && this.lastGyroData) {
        this.logSleepData(accelerometerData, this.lastGyroData);
      }
    });

    // Set up gyroscope subscription
    this.gyroscopeSubscription = Gyroscope.addListener(gyroscopeData => {
      this.lastGyroData = gyroscopeData;
    });

    this.isTracking = true;
  }

  stopTracking() {
    if (!this.isTracking) return;

    // Remove accelerometer subscription
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    // Remove gyroscope subscription
    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    this.lastGyroData = null;
    this.isTracking = false;
  }

  // Methods to update phone state (to be called from the app)
  setPhoneCharging(isCharging) {
    this.isPhoneCharging = isCharging;
  }

  setPhoneInUse(isInUse) {
    this.isPhoneInUse = isInUse;
  }
}

export default new SleepTrackingService(); 