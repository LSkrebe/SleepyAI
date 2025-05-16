package com.demis3.sleepyai;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";
    private static final String PREFS_NAME = "SleepTrackingPrefs";
    private static final String BED_TIME_KEY = "bedTime";
    private static final String WAKE_TIME_KEY = "wakeTime";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d(TAG, "Boot completed, rescheduling alarms");
            rescheduleAlarms(context);
        }
    }

    private void rescheduleAlarms(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String bedTime = prefs.getString(BED_TIME_KEY, null);
        String wakeTime = prefs.getString(WAKE_TIME_KEY, null);

        if (bedTime != null && wakeTime != null) {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            
            // Schedule bed time alarm
            Intent bedIntent = new Intent(context, SleepTrackingService.class);
            bedIntent.setAction("START_TRACKING");
            PendingIntent bedPendingIntent = PendingIntent.getService(
                context,
                0,
                bedIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Schedule wake time alarm
            Intent wakeIntent = new Intent(context, SleepTrackingService.class);
            wakeIntent.setAction("STOP_TRACKING");
            PendingIntent wakePendingIntent = PendingIntent.getService(
                context,
                1,
                wakeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Calculate next bed time
            String[] bedParts = bedTime.split(":");
            int bedHour = Integer.parseInt(bedParts[0]);
            int bedMinute = Integer.parseInt(bedParts[1]);
            long bedTimeMillis = calculateNextAlarmTime(bedHour, bedMinute);

            // Calculate next wake time
            String[] wakeParts = wakeTime.split(":");
            int wakeHour = Integer.parseInt(wakeParts[0]);
            int wakeMinute = Integer.parseInt(wakeParts[1]);
            long wakeTimeMillis = calculateNextAlarmTime(wakeHour, wakeMinute);

            // Schedule the alarms
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    bedTimeMillis,
                    bedPendingIntent
                );
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    wakeTimeMillis,
                    wakePendingIntent
                );
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    bedTimeMillis,
                    bedPendingIntent
                );
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    wakeTimeMillis,
                    wakePendingIntent
                );
            }

            Log.d(TAG, "Alarms rescheduled for bed time: " + bedTime + " and wake time: " + wakeTime);
        }
    }

    private long calculateNextAlarmTime(int hour, int minute) {
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        calendar.set(java.util.Calendar.HOUR_OF_DAY, hour);
        calendar.set(java.util.Calendar.MINUTE, minute);
        calendar.set(java.util.Calendar.SECOND, 0);
        
        if (calendar.getTimeInMillis() <= System.currentTimeMillis()) {
            calendar.add(java.util.Calendar.DAY_OF_YEAR, 1);
        }
        
        return calendar.getTimeInMillis();
    }
} 