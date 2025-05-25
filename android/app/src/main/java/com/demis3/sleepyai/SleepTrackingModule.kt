package com.demis3.sleepyai

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.content.Intent
import android.os.Build
import android.util.Log
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import java.util.Calendar
import java.text.SimpleDateFormat
import java.util.Locale

class SleepTrackingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val PREFS_NAME = "SleepTrackingPrefs"
        private const val BED_TIME_KEY = "bedTime"
        private const val WAKE_TIME_KEY = "wakeTime"
    }

    override fun getName() = "SleepTrackingModule"

    @ReactMethod
    fun scheduleSleepTracking(bedTime: String, wakeTime: String, promise: Promise) {
        try {
            // Save times to SharedPreferences
            val prefs = reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString(BED_TIME_KEY, bedTime)
                putString(WAKE_TIME_KEY, wakeTime)
                apply()
            }

            val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            
            // Parse bed time
            val (bedHour, bedMinute) = bedTime.split(":").map { it.toInt() }
            val bedCalendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, bedHour)
                set(Calendar.MINUTE, bedMinute)
                set(Calendar.SECOND, 0)
                if (before(Calendar.getInstance())) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            // Parse wake time
            val (wakeHour, wakeMinute) = wakeTime.split(":").map { it.toInt() }
            val wakeCalendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, wakeHour)
                set(Calendar.MINUTE, wakeMinute)
                set(Calendar.SECOND, 0)
                if (before(Calendar.getInstance())) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            // Create intents for bed and wake times
            val bedIntent = Intent(reactApplicationContext, SleepTrackingAlarmReceiver::class.java).apply {
                action = "START_TRACKING"
                addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES)
            }
            val wakeIntent = Intent(reactApplicationContext, SleepTrackingAlarmReceiver::class.java).apply {
                action = "STOP_TRACKING"
                addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES)
            }

            val bedPendingIntent = PendingIntent.getBroadcast(
                reactApplicationContext,
                0,
                bedIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val wakePendingIntent = PendingIntent.getBroadcast(
                reactApplicationContext,
                1,
                wakeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Schedule the alarms
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    bedCalendar.timeInMillis,
                    bedPendingIntent
                )
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    wakeCalendar.timeInMillis,
                    wakePendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    bedCalendar.timeInMillis,
                    bedPendingIntent
                )
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    wakeCalendar.timeInMillis,
                    wakePendingIntent
                )
            }

            Log.d("SleepTrackingModule", "Scheduled sleep tracking for bed time: $bedTime and wake time: $wakeTime")
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e("SleepTrackingModule", "Error scheduling sleep tracking", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun startSleepTracking(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, SleepTrackingService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e("SleepTrackingModule", "Error starting sleep tracking", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopSleepTracking(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, SleepTrackingService::class.java)
            reactApplicationContext.stopService(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e("SleepTrackingModule", "Error stopping sleep tracking", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built in Event Emitter
    }

    private fun emitEvent(eventName: String, params: Map<String, Any>) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, Arguments.makeNativeMap(params))
        } catch (e: Exception) {
            Log.e("SleepTrackingModule", "Error emitting event", e)
        }
    }

    @ReactMethod
    fun getSleepData(date: String, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("SleepTrackingPrefs", Context.MODE_PRIVATE)
            val key = "sleep_data_$date"
            val jsonData = prefs.getString(key, null)
            
            if (jsonData != null) {
                // Parse the data into a format that React Native can understand
                val sleepData = jsonData.split("\n").map { line ->
                    val parts = line.split(",")
                    mapOf(
                        "time" to parts[0],
                        "accelerometer" to mapOf(
                            "x" to parts[1].toFloat(),
                            "y" to parts[2].toFloat(),
                            "z" to parts[3].toFloat()
                        ),
                        "gyroscope" to mapOf(
                            "x" to parts[4].toFloat(),
                            "y" to parts[5].toFloat(),
                            "z" to parts[6].toFloat()
                        ),
                        "charging" to parts[7].toInt(),
                        "state" to parts[8],
                        "environmental" to mapOf(
                            "noise" to parts[9].toInt(),
                            "light" to parts[10].toInt()
                        )
                    )
                }
                
                // Convert to WritableArray for React Native
                val writableArray = Arguments.createArray()
                sleepData.forEach { data ->
                    writableArray.pushMap(Arguments.makeNativeMap(data))
                }
                
                promise.resolve(writableArray)
            } else {
                promise.resolve(Arguments.createArray()) // Return empty array if no data
            }
        } catch (e: Exception) {
            Log.e("SleepTrackingModule", "Error getting sleep data", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun analyzeSleepData(date: String, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("SleepTrackingPrefs", Context.MODE_PRIVATE)
            val key = "sleep_data_$date"
            val jsonData = prefs.getString(key, null)
            
            if (jsonData != null) {
                // Parse the data
                val sleepData = jsonData.split("\n").map { line ->
                    val parts = line.split(",")
                    mapOf(
                        "time" to parts[0],
                        "accelerometer" to mapOf(
                            "x" to parts[1].toFloat(),
                            "y" to parts[2].toFloat(),
                            "z" to parts[3].toFloat()
                        ),
                        "gyroscope" to mapOf(
                            "x" to parts[4].toFloat(),
                            "y" to parts[5].toFloat(),
                            "z" to parts[6].toFloat()
                        ),
                        "charging" to parts[7].toInt(),
                        "state" to parts[8],
                        "environmental" to mapOf(
                            "noise" to parts[9].toInt(),
                            "light" to parts[10].toInt()
                        )
                    )
                }

                // Calculate sleep quality scores
                val scores = calculateSleepQualityScores(sleepData)
                
                // Calculate sleep cycles
                val cycles = calculateSleepCycles(scores)
                
                // Determine actual sleep start and end times
                val actualSleep = determineActualSleepTimes(sleepData, scores)
                
                // Create analysis result
                val analysis = mapOf(
                    "scores" to scores,
                    "cycles" to mapOf("count" to cycles),
                    "actualSleep" to actualSleep,
                    "totalDuration" to calculateTotalDuration(actualSleep["start"] as String, actualSleep["end"] as String)
                )
                
                promise.resolve(Arguments.makeNativeMap(analysis))
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            Log.e("SleepTrackingModule", "Error analyzing sleep data", e)
            promise.reject("ERROR", e.message)
        }
    }

    private fun calculateSleepQualityScores(sleepData: List<Map<String, Any>>): Map<String, Int> {
        val scores = mutableMapOf<String, Int>()
        
        for (data in sleepData) {
            val time = data["time"] as String
            val accel = data["accelerometer"] as Map<String, Float>
            val gyro = data["gyroscope"] as Map<String, Float>
            val charging = data["charging"] as Int
            val state = data["state"] as String
            val environmental = data["environmental"] as Map<String, Int>
            
            // Calculate movement score (0-100)
            val movementScore = calculateMovementScore(accel, gyro)
            
            // Calculate environmental score (0-100)
            val environmentalScore = calculateEnvironmentalScore(environmental)
            
            // Calculate state score (0-100)
            val stateScore = calculateStateScore(charging, state)
            
            // Calculate final score (weighted average)
            val finalScore = (movementScore * 0.5 + environmentalScore * 0.3 + stateScore * 0.2).toInt()
            
            scores[time] = finalScore
        }
        
        return scores
    }

    private fun calculateMovementScore(accel: Map<String, Float>, gyro: Map<String, Float>): Int {
        // Calculate total movement from accelerometer and gyroscope
        val accelMovement = Math.sqrt(
            (accel["x"]!! * accel["x"]!! +
            accel["y"]!! * accel["y"]!! +
            accel["z"]!! * accel["z"]!!).toDouble()
        )
        
        val gyroMovement = Math.sqrt(
            (gyro["x"]!! * gyro["x"]!! +
            gyro["y"]!! * gyro["y"]!! +
            gyro["z"]!! * gyro["z"]!!).toDouble()
        )
        
        // Convert to score (less movement = higher score)
        val totalMovement = accelMovement + gyroMovement
        return (100 - (totalMovement * 10).toInt()).coerceIn(0, 100)
    }

    private fun calculateEnvironmentalScore(environmental: Map<String, Int>): Int {
        val noise = environmental["noise"]!!
        val light = environmental["light"]!!
        
        // Convert noise and light to scores (lower = better)
        val noiseScore = (100 - noise).coerceIn(0, 100)
        val lightScore = (100 - light).coerceIn(0, 100)
        
        // Return average of noise and light scores
        return (noiseScore + lightScore) / 2
    }

    private fun calculateStateScore(charging: Int, state: String): Int {
        var score = 0
        
        // Charging state (50 points)
        score += if (charging == 1) 50 else 0
        
        // Phone state (50 points)
        score += when (state) {
            "idle" -> 50
            "locked" -> 40
            "screen_off" -> 30
            else -> 0
        }
        
        return score
    }

    private fun calculateSleepCycles(scores: Map<String, Int>): Int {
        var cycles = 0
        var inHighQuality = false
        var lastScore = 0
        
        for ((_, score) in scores) {
            if (score >= 70 && !inHighQuality) {
                inHighQuality = true
            } else if (score < 70 && inHighQuality) {
                inHighQuality = false
                cycles++
            }
            lastScore = score
        }
        
        // Count final cycle if we end in high quality
        if (inHighQuality) {
            cycles++
        }
        
        return cycles.coerceAtLeast(1)
    }

    private fun determineActualSleepTimes(sleepData: List<Map<String, Any>>, scores: Map<String, Int>): Map<String, String> {
        var sleepStart = sleepData.first()["time"] as String
        var sleepEnd = sleepData.last()["time"] as String
        
        // Find first high quality sleep period
        for ((time, score) in scores) {
            if (score >= 70) {
                sleepStart = time
                break
            }
        }
        
        // Find last high quality sleep period
        for ((time, score) in scores.toList().reversed()) {
            if (score >= 70) {
                sleepEnd = time
                break
            }
        }
        
        return mapOf(
            "start" to sleepStart,
            "end" to sleepEnd
        )
    }

    private fun calculateTotalDuration(startTime: String, endTime: String): Int {
        val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        val start = timeFormat.parse(startTime)
        val end = timeFormat.parse(endTime)
        
        // If end time is before start time, it means we crossed midnight
        if (end.before(start)) {
            end.time += 24 * 60 * 60 * 1000 // Add 24 hours
        }
        
        return ((end.time - start.time) / (60 * 1000)).toInt() // Convert to minutes
    }
} 