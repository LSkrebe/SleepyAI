import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { ChevronRight, Bell, Moon, Sun, Volume2, Thermometer, Lock, Battery, Download, Settings as SettingsIcon, Info, BellRing, Zap, Database, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

const CustomToggle = ({ value, onValueChange }) => {
  const toggleAnimation = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(toggleAnimation, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [value]);

  const translateX = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  return (
    <TouchableOpacity
      onPress={onValueChange}
      style={[
        styles.toggleContainer,
        { backgroundColor: value ? 'rgba(59, 130, 246, 0.3)' : '#1E293B' }
      ]}
    >
      <Animated.View
        style={[
          styles.toggleThumb,
          {
            transform: [{ translateX }],
            backgroundColor: value ? '#3B82F6' : '#64748B',
            borderColor: value ? '#3B82F6' : '#334155',
          },
        ]}
      />
    </TouchableOpacity>
  );
};

export default function Settings() {
  const [settings, setSettings] = useState({
    sleepDetection: true,
    environmentalMonitoring: true,
    smartWake: true,
    sleepReminders: true,
    wakeUpReminders: true,
    dataCollection: true,
    analytics: true,
  });

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.subtitle}>Customize your sleep experience</Text>
        </View>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
      </View>

      {renderSection('Sleep Tracking', (
        <>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Moon size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Sleep Detection</Text>
                <Text style={styles.settingItemDescription}>Automatically detect when you're sleeping</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.sleepDetection} 
              onValueChange={() => toggleSetting('sleepDetection')} 
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Thermometer size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Environmental Monitoring</Text>
                <Text style={styles.settingItemDescription}>Track room temperature and humidity</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.environmentalMonitoring} 
              onValueChange={() => toggleSetting('environmentalMonitoring')} 
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Sun size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Smart Wake</Text>
                <Text style={styles.settingItemDescription}>Wake up during light sleep phase</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.smartWake} 
              onValueChange={() => toggleSetting('smartWake')} 
            />
          </View>
        </>
      ))}

      {renderSection('Notifications', (
        <>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Sleep Reminders</Text>
                <Text style={styles.settingItemDescription}>Get notified when it's time to sleep</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.sleepReminders} 
              onValueChange={() => toggleSetting('sleepReminders')} 
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Wake Up Reminders</Text>
                <Text style={styles.settingItemDescription}>Get notified when it's time to wake up</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.wakeUpReminders} 
              onValueChange={() => toggleSetting('wakeUpReminders')} 
            />
          </View>
        </>
      ))}

      {renderSection('Privacy & Data', (
        <>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Lock size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Data Collection</Text>
                <Text style={styles.settingItemDescription}>Control what data is collected</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.dataCollection} 
              onValueChange={() => toggleSetting('dataCollection')} 
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Lock size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Analytics</Text>
                <Text style={styles.settingItemDescription}>Help improve the app</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.analytics} 
              onValueChange={() => toggleSetting('analytics')} 
            />
          </View>
        </>
      ))}

      {renderSection('Account', (
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <LogOut size={20} color="#EF4444" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingItemTitle, { color: '#EF4444' }]}>Logout</Text>
              <Text style={styles.settingItemDescription}>Sign out of your account</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#EF4444" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    paddingBottom: 50,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'visible',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  headerGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    opacity: 0.1,
    transform: [{ scale: 1.5 }],
  },
  titleContainer: {
    position: 'relative',
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  titleDecoration: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  section: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    color: '#E2E8F0',
  },
  settingItemDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  toggleContainer: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
}); 