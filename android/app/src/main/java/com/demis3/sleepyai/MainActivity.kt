package com.demis3.sleepyai
import expo.modules.splashscreen.SplashScreenManager

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import android.content.Intent

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : ReactActivity() {
  companion object {
    private const val PERMISSION_REQUEST_CODE = 123
    private const val LOCATION_PERMISSION_REQUEST_CODE = 124
    private const val NOTIFICATION_PERMISSION_REQUEST_CODE = 125
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)

    // Request permissions sequentially
    requestAudioPermission()
  }

  private fun requestAudioPermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      when {
        ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED -> {
          // Audio permission already granted, request location next
          requestLocationPermission()
        }
        shouldShowRequestPermissionRationale(Manifest.permission.RECORD_AUDIO) -> {
          // Show explanation why we need the permission
          Toast.makeText(this, "Audio permission is needed for noise level monitoring", Toast.LENGTH_LONG).show()
          ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.RECORD_AUDIO),
            PERMISSION_REQUEST_CODE
          )
        }
        else -> {
          // Request the permission
          ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.RECORD_AUDIO),
            PERMISSION_REQUEST_CODE
          )
        }
      }
    }
  }

  private fun requestLocationPermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      when {
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED -> {
          // Location permission already granted (either fine or coarse)
          requestNotificationPermission()
        }
        shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_FINE_LOCATION) -> {
          // Show explanation why we need the permission
          Toast.makeText(this, "Location permission is needed for accurate weather data", Toast.LENGTH_LONG).show()
          ActivityCompat.requestPermissions(
            this,
            arrayOf(
              Manifest.permission.ACCESS_FINE_LOCATION,
              Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            LOCATION_PERMISSION_REQUEST_CODE
          )
        }
        else -> {
          // Request the permission
          ActivityCompat.requestPermissions(
            this,
            arrayOf(
              Manifest.permission.ACCESS_FINE_LOCATION,
              Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            LOCATION_PERMISSION_REQUEST_CODE
          )
        }
      }
    }
  }

  private fun requestNotificationPermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      when {
        ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED -> {
          // Notification permission already granted
        }
        shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS) -> {
          // Show explanation why we need the permission
          Toast.makeText(this, "Notification permission is needed for sleep tracking", Toast.LENGTH_LONG).show()
          ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            NOTIFICATION_PERMISSION_REQUEST_CODE
          )
        }
        else -> {
          // Request the permission
          ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            NOTIFICATION_PERMISSION_REQUEST_CODE
          )
        }
      }
    }
  }

  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    when (requestCode) {
      PERMISSION_REQUEST_CODE -> {
        if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
          // Audio permission granted, request location next
          Toast.makeText(this, "Audio permission granted", Toast.LENGTH_SHORT).show()
          requestLocationPermission()
        } else {
          // Audio permission denied, still try to request location
          Toast.makeText(this, "Audio permission denied - noise monitoring will not work", Toast.LENGTH_LONG).show()
          requestLocationPermission()
        }
      }
      LOCATION_PERMISSION_REQUEST_CODE -> {
        if (grantResults.isNotEmpty() && 
            (grantResults[0] == PackageManager.PERMISSION_GRANTED || 
             (grantResults.size > 1 && grantResults[1] == PackageManager.PERMISSION_GRANTED))) {
          // Location permission granted (either fine or coarse)
          Toast.makeText(this, "Location permission granted", Toast.LENGTH_SHORT).show()
          requestNotificationPermission()
        } else {
          // Location permission denied
          Toast.makeText(this, "Location permission denied - weather data may be inaccurate", Toast.LENGTH_LONG).show()
          requestNotificationPermission()
        }
      }
      NOTIFICATION_PERMISSION_REQUEST_CODE -> {
        if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
          // Notification permission granted
          Toast.makeText(this, "Notification permission granted", Toast.LENGTH_SHORT).show()
        } else {
          // Notification permission denied
          Toast.makeText(this, "Notification permission denied - sleep tracking may not work properly", Toast.LENGTH_LONG).show()
        }
      }
    }
  }

  fun startSleepTrackingService() {
    val serviceIntent = Intent(this, SleepTrackingService::class.java)
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        startForegroundService(serviceIntent)
      } else {
        startService(serviceIntent)
      }
    } catch (e: Exception) {
      Toast.makeText(this, "Failed to start sleep tracking service: ${e.message}", Toast.LENGTH_LONG).show()
    }
  }

  fun stopSleepTrackingService() {
    val serviceIntent = Intent(this, SleepTrackingService::class.java)
    try {
      stopService(serviceIntent)
    } catch (e: Exception) {
      Toast.makeText(this, "Failed to stop sleep tracking service: ${e.message}", Toast.LENGTH_LONG).show()
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun onBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed()
      }
      return
    }

    // Use the default back button implementation on Android S
    // because it's doing more than [Activity.moveTaskToBack] in fact.
    super.invokeDefaultOnBackPressed()
  }
}
