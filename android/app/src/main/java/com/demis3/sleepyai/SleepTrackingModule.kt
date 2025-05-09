package com.demis3.sleepyai

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.content.Intent
import android.os.Build
import android.util.Log

class SleepTrackingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "SleepTrackingModule"

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