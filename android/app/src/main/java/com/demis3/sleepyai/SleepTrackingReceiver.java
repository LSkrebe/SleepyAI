package com.demis3.sleepyai;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SleepTrackingReceiver extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private final BroadcastReceiver receiver;

    public SleepTrackingReceiver(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        // Create broadcast receiver
        this.receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if ("com.demis3.sleepyai.SLEEP_TRACKING_STARTED".equals(action)) {
                    sendEvent("sleepTrackingStarted", null);
                } else if ("com.demis3.sleepyai.SLEEP_TRACKING_STOPPED".equals(action)) {
                    sendEvent("sleepTrackingStopped", null);
                }
            }
        };

        // Register receiver
        IntentFilter filter = new IntentFilter();
        filter.addAction("com.demis3.sleepyai.SLEEP_TRACKING_STARTED");
        filter.addAction("com.demis3.sleepyai.SLEEP_TRACKING_STOPPED");
        reactContext.registerReceiver(receiver, filter);
    }

    @Override
    public String getName() {
        return "SleepTrackingReceiver";
    }

    private void sendEvent(String eventName, Object params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        reactContext.unregisterReceiver(receiver);
    }
} 