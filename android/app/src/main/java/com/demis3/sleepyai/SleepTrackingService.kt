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
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

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
    private var sleepData = mutableListOf<Map<String, Any>>()
    private var serviceJob: Job? = null
    private var isTracking = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        initializeSensors()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        
        if (!isTracking) {
            startTracking()
        }
        
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        stopTracking()
        releaseWakeLock()
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
            .setContentTitle("Sleep Tracking Active")
            .setContentText("Sleep tracking is running in the background")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }

    private fun startTracking() {
        if (isTracking) return

        serviceJob = CoroutineScope(Dispatchers.IO).launch {
            try {
                // Register sensor listeners
                accelerometer?.let {
                    sensorManager?.registerListener(
                        this@SleepTrackingService,
                        it,
                        SensorManager.SENSOR_DELAY_NORMAL
                    )
                }

                gyroscope?.let {
                    sensorManager?.registerListener(
                        this@SleepTrackingService,
                        it,
                        SensorManager.SENSOR_DELAY_NORMAL
                    )
                }

                isTracking = true
                Log.d(TAG, "Sleep tracking started in foreground service")
            } catch (e: Exception) {
                Log.e(TAG, "Error starting sleep tracking", e)
            }
        }
    }

    private fun stopTracking() {
        isTracking = false
        serviceJob?.cancel()
        serviceJob = null

        // Unregister sensor listeners
        sensorManager?.unregisterListener(this)

        lastGyroData = null
        Log.d(TAG, "Sleep tracking stopped in foreground service")
    }

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                if (lastGyroData != null) {
                    logSleepData(event.values, lastGyroData!!)
                }
            }
            Sensor.TYPE_GYROSCOPE -> {
                lastGyroData = event.values
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

        val dataPoint = mapOf(
            "time" to time,
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
            "charging" to 0,
            "state" to "idle",
            "environmental" to mapOf(
                "noise" to 0,
                "light" to 0
            )
        )

        sleepData.add(dataPoint)
        Log.d(TAG, "T=$time A=${accelerometerData[0]},${accelerometerData[1]},${accelerometerData[2]} " +
                   "G=${gyroscopeData[0]},${gyroscopeData[1]},${gyroscopeData[2]} C=0 S=idle N=0 L=0")

        // Emit event to React Native
        emitEvent("sleepDataUpdate", dataPoint)
    }

    private fun emitEvent(eventName: String, params: Map<String, Any>) {
        try {
            val reactContext = (application as MainApplication).reactNativeHost.reactInstanceManager.currentReactContext
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, Arguments.makeNativeMap(params))
        } catch (e: Exception) {
            Log.e(TAG, "Error emitting event", e)
        }
    }
} 