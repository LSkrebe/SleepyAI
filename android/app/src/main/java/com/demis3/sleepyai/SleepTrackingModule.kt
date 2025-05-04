package com.demis3.sleepyai

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.app.Activity
import android.util.Log

class SleepTrackingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "SleepTrackingModule"
    }

    override fun getName() = "SleepTrackingModule"

    @ReactMethod
    fun startSleepTracking(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity != null && activity is MainActivity) {
                activity.startSleepTrackingService()
                Log.d(TAG, "Sleep tracking service started")
                promise.resolve(null)
            } else {
                val error = "Activity not found or not MainActivity"
                Log.e(TAG, error)
                promise.reject("ERROR", error)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error starting sleep tracking", e)
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun stopSleepTracking(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity != null && activity is MainActivity) {
                activity.stopSleepTrackingService()
                Log.d(TAG, "Sleep tracking service stopped")
                promise.resolve(null)
            } else {
                val error = "Activity not found or not MainActivity"
                Log.e(TAG, error)
                promise.reject("ERROR", error)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping sleep tracking", e)
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }
} 