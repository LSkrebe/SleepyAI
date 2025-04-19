import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const DeviceContext = createContext({});

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider = ({ children }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        // Try to get existing device ID from storage
        let storedDeviceId = await AsyncStorage.getItem('deviceId');        
        if (!storedDeviceId) {
          // Generate a new device ID if none exists
          storedDeviceId = `${Device.modelName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('deviceId', storedDeviceId);
        }
        
        setDeviceId(storedDeviceId);
      } catch (error) {
        console.error('DeviceContext: Error initializing device:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDevice();
  }, []);

  const value = {
    deviceId
  };

  return (
    <DeviceContext.Provider value={value}>
      {!loading && children}
    </DeviceContext.Provider>
  );
}; 