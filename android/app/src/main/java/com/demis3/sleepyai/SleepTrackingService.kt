package com.demis3.sleepyai

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.demis3.sleepyai.MainActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.cancel
import java.text.SimpleDateFormat
import java.util.*

data class SleepDataPoint(
    val timestamp: String,
    val accelerometer: AccelerometerData,
    val gyroscope: GyroscopeData,
    val isCharging: Boolean,
    val phoneState: String,
    val noiseLevel: Int,
    val lightLevel: Int
)

data class AccelerometerData(
    val x: Float,
    val y: Float,
    val z: Float
)

data class GyroscopeData(
    val x: Float,
    val y: Float,
    val z: Float
)

class SleepTrackingService : Service(), SensorEventListener {
    companion object {
        private const val TAG = "SleepTrackingService"
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "SleepTrackingChannel"
        private const val CHANNEL_NAME = "Sleep Tracking"
        private const val CHANNEL_DESCRIPTION = "Sleep tracking is active"
        private const val WAKE_LOCK_TAG = "SleepTrackingService::WakeLock"
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var gyroscope: Sensor? = null
    private var lastGyroData: FloatArray? = null
    private var sleepData = mutableListOf<SleepDataPoint>()
    private var serviceJob: Job? = null
    private var isTracking = false
    private var trackingInterval: Job? = null
    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private var currentAccelData = AccelerometerData(0f, 0f, 0f)
    private var currentGyroData = GyroscopeData(0f, 0f, 0f)

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        initializeSensors()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand called with action: ${intent?.action}")
        if (intent?.action == "START_TRACKING") {
            Log.d(TAG, "Received START_TRACKING action")
            if (!isTracking) {
                startTracking()
            } else {
                Log.d(TAG, "Service already tracking, ignoring start request")
            }
        } else if (intent?.action == "STOP_TRACKING") {
            Log.d(TAG, "Received STOP_TRACKING action")
            if (isTracking) {
                stopTracking()
            } else {
                Log.d(TAG, "Service not tracking, ignoring stop request")
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        Log.d(TAG, "onDestroy called")
        if (isTracking) {
            stopTracking()
        }
        releaseWakeLock()
        super.onDestroy()
    }

    private fun initializeSensors() {
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            WAKE_LOCK_TAG
        ).apply {
            acquire(10*60*1000L /*10 minutes*/)
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
        wakeLock = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = CHANNEL_DESCRIPTION
                setShowBadge(false)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SleepyAI active")
            .setContentText("Tracking sleep in the background")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }

    private fun startTracking() {
        Log.d(TAG, "Starting sleep tracking...")
        isTracking = true
        startForeground(NOTIFICATION_ID, createNotification())
        
        // Register sensor listeners
        sensorManager?.let { manager ->
            accelerometer?.let { sensor ->
                manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)
            }
            gyroscope?.let { sensor ->
                manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)
            }
        }
        
        // Start collecting data
        serviceScope.launch {
            Log.d(TAG, "Starting data collection in coroutine")
            while (isTracking) {
                try {
                    val currentTime = System.currentTimeMillis()
                    val timestamp = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date(currentTime))
                    
                    // Get sensor data
                    val accelData = getAccelerometerData()
                    val gyroData = getGyroscopeData()
                    
                    // Get phone state
                    val isCharging = isPhoneCharging()
                    val phoneState = getPhoneState()
                    
                    // Get environmental data
                    val noiseLevel = getNoiseLevel()
                    val lightLevel = getLightLevel()
                    
                    // Create data point
                    val dataPoint = SleepDataPoint(
                        timestamp = timestamp,
                        accelerometer = accelData,
                        gyroscope = gyroData,
                        isCharging = isCharging,
                        phoneState = phoneState,
                        noiseLevel = noiseLevel,
                        lightLevel = lightLevel
                    )
                    
                    // Add to sleep data
                    sleepData.add(dataPoint)
                    
                    // Log the data point
                    Log.d(TAG, "Data point collected: T=$timestamp A=${accelData.x},${accelData.y},${accelData.z} G=${gyroData.x},${gyroData.y},${gyroData.z} C=${if (isCharging) 1 else 0} S=$phoneState N=$noiseLevel L=$lightLevel")
                    
                    // Emit update event
                    emitEvent("sleepDataUpdate", mapOf(
                        "timestamp" to timestamp,
                        "accelerometer" to mapOf(
                            "x" to accelData.x,
                            "y" to accelData.y,
                            "z" to accelData.z
                        ),
                        "gyroscope" to mapOf(
                            "x" to gyroData.x,
                            "y" to gyroData.y,
                            "z" to gyroData.z
                        ),
                        "isCharging" to isCharging,
                        "phoneState" to phoneState,
                        "noiseLevel" to noiseLevel,
                        "lightLevel" to lightLevel
                    ))
                    
                    delay(60000) // Collect data every minute (60000 ms = 1 minute)
                } catch (e: Exception) {
                    Log.e(TAG, "Error collecting data", e)
                }
            }
        }
    }

    private fun stopTracking() {
        if (!isTracking) {
            Log.d(TAG, "Service already stopped, ignoring stop request")
            return
        }
        
        Log.d(TAG, "Stopping sleep tracking...")
        isTracking = false
        
        // Cancel all coroutines
        serviceScope.cancel()
        
        // Unregister sensor listeners
        sensorManager?.unregisterListener(this)
        
        // Save the collected data
        saveSleepData()
        
        // Stop foreground service and remove notification
        stopForeground(true)
        stopSelf()
        
        // Send broadcast to notify React Native
        val intent = Intent("com.demis3.sleepyai.SLEEP_TRACKING_STOPPED")
        sendBroadcast(intent)
        
        Log.d(TAG, "Sleep tracking stopped in foreground service")
    }

    private fun saveSleepData() {
        Log.d(TAG, "Saving sleep data... Number of data points: ${sleepData.size}")
        if (sleepData.isEmpty()) {
            Log.w(TAG, "No sleep data to save")
            return
        }

        try {
            // Format data for storage
            val formattedData = sleepData.joinToString("\n") { dataPoint ->
                "${dataPoint.timestamp},${dataPoint.accelerometer.x},${dataPoint.accelerometer.y},${dataPoint.accelerometer.z}," +
                "${dataPoint.gyroscope.x},${dataPoint.gyroscope.y},${dataPoint.gyroscope.z}," +
                "${if (dataPoint.isCharging) 1 else 0},${dataPoint.phoneState},${dataPoint.noiseLevel},${dataPoint.lightLevel}"
            }
            
            Log.d(TAG, "Formatted data to save: $formattedData")

            // Save to SharedPreferences
            val prefs = getSharedPreferences("SleepData", Context.MODE_PRIVATE)
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val key = "sleep_data_$today"
            
            prefs.edit().putString(key, formattedData).apply()
            
            // Verify the save
            val savedData = prefs.getString(key, null)
            Log.d(TAG, "Data saved successfully: ${savedData != null}")
            
            // Send broadcast intent with the saved data
            val intent = Intent("com.demis3.sleepyai.SLEEP_DATA_SAVED").apply {
                putExtra("date", today)
                putExtra("data", formattedData)
                addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES)
            }
            sendBroadcast(intent)
            Log.d(TAG, "Broadcast intent sent for sleep data saved")
            
            // Clear the data after saving
            sleepData.clear()
        } catch (e: Exception) {
            Log.e(TAG, "Error saving sleep data", e)
        }
    }

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                currentAccelData = AccelerometerData(
                    event.values[0],
                    event.values[1],
                    event.values[2]
                )
            }
            Sensor.TYPE_GYROSCOPE -> {
                currentGyroData = GyroscopeData(
                    event.values[0],
                    event.values[1],
                    event.values[2]
                )
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Not needed for this implementation
    }

    private fun logSleepData(accelerometerData: FloatArray, gyroscopeData: FloatArray) {
        val now = Calendar.getInstance()
        val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        val time = timeFormat.format(now.time)

        val dataPoint = SleepDataPoint(
            timestamp = time,
            accelerometer = AccelerometerData(
                accelerometerData[0],
                accelerometerData[1],
                accelerometerData[2]
            ),
            gyroscope = GyroscopeData(
                gyroscopeData[0],
                gyroscopeData[1],
                gyroscopeData[2]
            ),
            isCharging = false,
            phoneState = "idle",
            noiseLevel = 0,
            lightLevel = 0
        )

        sleepData.add(dataPoint)
        Log.d(TAG, "T=$time A=${accelerometerData[0]},${accelerometerData[1]},${accelerometerData[2]} " +
                   "G=${gyroscopeData[0]},${gyroscopeData[1]},${gyroscopeData[2]} C=0 S=idle N=0 L=0")

        // Emit event to React Native
        emitEvent("sleepDataUpdate", mapOf(
            "timestamp" to time,
            "accelerometer" to mapOf(
                "x" to accelerometerData[0],
                "y" to accelerometerData[1],
                "z" to accelerometerData[2]
            ),
            "gyroscope" to mapOf(
                "x" to gyroscopeData[0],
                "y" to gyroscopeData[1],
                "z" to gyroscopeData[2]
            ),
            "isCharging" to false,
            "phoneState" to "idle",
            "noiseLevel" to 0,
            "lightLevel" to 0
        ))
    }

    private fun emitEvent(eventName: String, params: Map<String, Any>) {
        try {
            val application = application as? MainApplication
            if (application == null) {
                Log.e(TAG, "Application is not MainApplication instance")
                sendBroadcastIntent(eventName, params)
                return
            }
            
            val reactContext = application.reactNativeHost.reactInstanceManager.currentReactContext
            if (reactContext == null) {
                Log.e(TAG, "React context is null, using broadcast intent as fallback")
                sendBroadcastIntent(eventName, params)
                return
            }
            
            val eventEmitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            if (eventEmitter == null) {
                Log.e(TAG, "Event emitter is null, using broadcast intent as fallback")
                sendBroadcastIntent(eventName, params)
                return
            }
            
            Log.d(TAG, "Emitting event: $eventName")
            eventEmitter.emit(eventName, Arguments.makeNativeMap(params))
            Log.d(TAG, "Event emitted successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error emitting event, using broadcast intent as fallback", e)
            sendBroadcastIntent(eventName, params)
        }
    }

    private fun sendBroadcastIntent(eventName: String, params: Map<String, Any>) {
        try {
            val intent = Intent("com.demis3.sleepyai.$eventName").apply {
                putExtra("data", Arguments.makeNativeMap(params).toString())
                addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES)
            }
            sendBroadcast(intent)
            Log.d(TAG, "Broadcast intent sent for event: $eventName")
        } catch (e: Exception) {
            Log.e(TAG, "Error sending broadcast intent", e)
        }
    }

    private fun getAccelerometerData(): AccelerometerData {
        return currentAccelData
    }

    private fun getGyroscopeData(): GyroscopeData {
        return currentGyroData
    }

    private fun isPhoneCharging(): Boolean {
        return false // Default value
    }

    private fun getPhoneState(): String {
        return "idle" // Default value
    }

    private fun getNoiseLevel(): Int {
        return 0 // Default value
    }

    private fun getLightLevel(): Int {
        return 0 // Default value
    }
} 