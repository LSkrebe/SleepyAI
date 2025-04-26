package com.demis3.sleepyai

import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.log10
import kotlin.math.sqrt

class EnvironmentalSensorsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), SensorEventListener {
    private val sensorManager: SensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private var lightSensor: Sensor? = null
    private var temperatureSensor: Sensor? = null
    private var humiditySensor: Sensor? = null
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private val SAMPLE_RATE = 44100
    private val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
    private val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
    private val BUFFER_SIZE = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
    private val NOISE_CHECK_INTERVAL = 1000L // Check noise level every second
    private var isEmulator = false
    private var mockDataThread: Thread? = null
    private var hasAudioPermission = false

    init {
        // Check if running on emulator
        isEmulator = isEmulator()
        // Check initial permission state
        hasAudioPermission = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            android.Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun isEmulator(): Boolean {
        return (android.os.Build.FINGERPRINT.startsWith("generic")
                || android.os.Build.FINGERPRINT.startsWith("unknown")
                || android.os.Build.MODEL.contains("google_sdk")
                || android.os.Build.MODEL.contains("Emulator")
                || android.os.Build.MODEL.contains("Android SDK built for x86")
                || android.os.Build.MANUFACTURER.contains("Genymotion")
                || android.os.Build.BRAND.startsWith("generic") && android.os.Build.DEVICE.startsWith("generic")
                || "google_sdk" == android.os.Build.PRODUCT)
    }

    override fun getName(): String {
        return "EnvironmentalSensors"
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun startListening() {
        try {
            if (isEmulator) {
                // Provide mock data for emulator
                startMockData()
                return
            }

            // Check and initialize sensors
            val availableSensors = mutableListOf<String>()
            
            lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)
            if (lightSensor != null) {
                sensorManager.registerListener(this, lightSensor, SensorManager.SENSOR_DELAY_NORMAL)
                availableSensors.add("Light")
            }

            temperatureSensor = sensorManager.getDefaultSensor(Sensor.TYPE_AMBIENT_TEMPERATURE)
            if (temperatureSensor != null) {
                sensorManager.registerListener(this, temperatureSensor, SensorManager.SENSOR_DELAY_NORMAL)
                availableSensors.add("Temperature")
            }

            humiditySensor = sensorManager.getDefaultSensor(Sensor.TYPE_RELATIVE_HUMIDITY)
            if (humiditySensor != null) {
                sensorManager.registerListener(this, humiditySensor, SensorManager.SENSOR_DELAY_NORMAL)
                availableSensors.add("Humidity")
            }

            // Check current permission state
            hasAudioPermission = ContextCompat.checkSelfPermission(
                reactApplicationContext,
                android.Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED

            // Start noise level monitoring if we have permission
            if (hasAudioPermission) {
                if (startNoiseMonitoring()) {
                    availableSensors.add("Noise")
                }
            } else {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("environmentalSensorError", "Audio recording permission not granted")
            }
            
            if (availableSensors.isEmpty()) {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("environmentalSensorError", "No environmental sensors available on this device")
            } else {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("environmentalSensorStatus", "Available sensors: ${availableSensors.joinToString(", ")}")
            }
        } catch (e: Exception) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("environmentalSensorError", "Error starting sensors: ${e.message}")
        }
    }

    private fun startMockData() {
        isRecording = true
        mockDataThread = Thread {
            while (isRecording) {
                val params = Arguments.createMap().apply {
                    putDouble("light", 50.0) // Moderate light
                    putDouble("temperature", 22.0) // Room temperature
                    putDouble("humidity", 45.0) // Moderate humidity
                    putDouble("noise", 30.0) // Quiet room
                }
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("environmentalSensorUpdate", params)
                Thread.sleep(NOISE_CHECK_INTERVAL)
            }
        }.apply { start() }
    }

    @ReactMethod
    fun stopListening() {
        try {
            isRecording = false
            mockDataThread?.join()
            mockDataThread = null
            
            sensorManager.unregisterListener(this)
            stopNoiseMonitoring()
        } catch (e: Exception) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("environmentalSensorError", "Error stopping sensors: ${e.message}")
        }
    }

    private fun startNoiseMonitoring(): Boolean {
        try {
            if (isEmulator) {
                isRecording = true
                return true
            }

            if (!hasAudioPermission) {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("environmentalSensorError", "Audio recording permission not granted")
                return false
            }

            if (BUFFER_SIZE == AudioRecord.ERROR || BUFFER_SIZE == AudioRecord.ERROR_BAD_VALUE) {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("environmentalSensorError", "Error initializing audio recording: Invalid buffer size")
                return false
            }

            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                BUFFER_SIZE
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("environmentalSensorError", "Error initializing audio recording: Not initialized")
                return false
            }

            isRecording = true
            audioRecord?.startRecording()

            Thread {
                val buffer = ShortArray(BUFFER_SIZE)
                while (isRecording) {
                    val readSize = audioRecord?.read(buffer, 0, BUFFER_SIZE) ?: 0
                    if (readSize > 0) {
                        val noiseLevel = calculateNoiseLevel(buffer, readSize)
                        val params = Arguments.createMap().apply {
                            putDouble("noise", noiseLevel)
                        }
                        reactApplicationContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            .emit("environmentalSensorUpdate", params)
                    }
                    Thread.sleep(NOISE_CHECK_INTERVAL)
                }
            }.start()
            return true
        } catch (e: Exception) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("environmentalSensorError", "Error starting noise monitoring: ${e.message}")
            return false
        }
    }

    private fun stopNoiseMonitoring() {
        try {
            if (audioRecord?.state == AudioRecord.STATE_INITIALIZED) {
                audioRecord?.stop()
                audioRecord?.release()
            }
            audioRecord = null
        } catch (e: Exception) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("environmentalSensorError", "Error stopping noise monitoring: ${e.message}")
        }
    }

    private fun calculateNoiseLevel(buffer: ShortArray, readSize: Int): Double {
        var sum = 0.0
        for (i in 0 until readSize) {
            sum += buffer[i] * buffer[i]
        }
        val rms = sqrt(sum / readSize)
        // Convert to decibels (dB) and round to whole number
        return (20 * log10(rms / 32768.0) + 100).toInt().toDouble() // Normalize to 0-100 range and round
    }

    override fun onSensorChanged(event: SensorEvent) {
        try {
            val params = Arguments.createMap().apply {
                when (event.sensor.type) {
                    Sensor.TYPE_LIGHT -> putDouble("light", event.values[0].toDouble())
                    Sensor.TYPE_AMBIENT_TEMPERATURE -> putDouble("temperature", event.values[0].toDouble())
                    Sensor.TYPE_RELATIVE_HUMIDITY -> putDouble("humidity", event.values[0].toDouble())
                }
            }

            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("environmentalSensorUpdate", params)
        } catch (e: Exception) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("environmentalSensorError", "Error processing sensor data: ${e.message}")
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Not needed for this implementation
    }
} 