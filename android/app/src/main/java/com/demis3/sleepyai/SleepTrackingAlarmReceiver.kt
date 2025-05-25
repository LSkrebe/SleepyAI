package com.demis3.sleepyai

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class SleepTrackingAlarmReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "SleepTrackingAlarmReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Received alarm broadcast: ${intent.action}")
        
        val serviceIntent = Intent(context, SleepTrackingService::class.java).apply {
            action = intent.action
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            Log.d(TAG, "Successfully started service from alarm")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting service from alarm", e)
        }
    }
} 