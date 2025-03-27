import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight, Bell, Moon, Sun, Volume2, Thermometer, Lock, Battery, Download, Settings as SettingsIcon } from 'lucide-react-native';

export default function Settings() {
  const [settings, setSettings] = useState({
    sleepDetection: true,
    environmentalMonitoring: true,
    smartWake: true,
    alerts: true,
    privacy: true,
    batteryOptimization: true,
    sensorCalibration: false,
    dataExport: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const SettingItem = ({ icon: Icon, title, description, value, onToggle, showToggle = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => showToggle ? onToggle() : null}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#3B82F6" />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingItemDescription}>{description}</Text>
          )}
        </View>
      </View>
      {showToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
          thumbColor={value ? '#3B82F6' : '#9CA3AF'}
        />
      ) : (
        <ChevronRight size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep Tracking</Text>
        <SettingItem
          icon={Moon}
          title="Sleep Detection"
          description="Automatically detect when you're sleeping"
          value={settings.sleepDetection}
          onToggle={() => toggleSetting('sleepDetection')}
        />
        <SettingItem
          icon={Thermometer}
          title="Environmental Monitoring"
          description="Track room temperature and humidity"
          value={settings.environmentalMonitoring}
          onToggle={() => toggleSetting('environmentalMonitoring')}
        />
        <SettingItem
          icon={Sun}
          title="Smart Wake"
          description="Wake up during light sleep phase"
          value={settings.smartWake}
          onToggle={() => toggleSetting('smartWake')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon={Bell}
          title="Alert Settings"
          description="Configure sleep-related notifications"
          value={settings.alerts}
          onToggle={() => toggleSetting('alerts')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        <SettingItem
          icon={Lock}
          title="Privacy Settings"
          description="Manage your data privacy"
          value={settings.privacy}
          onToggle={() => toggleSetting('privacy')}
        />
        <SettingItem
          icon={Battery}
          title="Battery Optimization"
          description="Optimize app battery usage"
          value={settings.batteryOptimization}
          onToggle={() => toggleSetting('batteryOptimization')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced</Text>
        <SettingItem
          icon={SettingsIcon}
          title="Sensor Calibration"
          description="Calibrate sleep detection sensors"
          value={settings.sensorCalibration}
          onToggle={() => toggleSetting('sensorCalibration')}
        />
        <SettingItem
          icon={Download}
          title="Data Export"
          description="Export your sleep data"
          value={settings.dataExport}
          onToggle={() => toggleSetting('dataExport')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
}); 