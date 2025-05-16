package com.demis3.sleepyai

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.content.Intent
import android.os.Build
import android.util.Log
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import java.util.Calendar

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
            val bedIntent = Intent(reactApplicationContext, SleepTrackingService::class.java).apply {
                action = "START_TRACKING"
            }
            val wakeIntent = Intent(reactApplicationContext, SleepTrackingService::class.java).apply {
                action = "STOP_TRACKING"
            }

            val bedPendingIntent = PendingIntent.getService(
                reactApplicationContext,
                0,
                bedIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val wakePendingIntent = PendingIntent.getService(
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
} 