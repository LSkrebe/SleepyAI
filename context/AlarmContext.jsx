import React, { createContext, useContext, useState } from 'react';

const AlarmContext = createContext();

export function AlarmProvider({ children }) {
  const [alarmTime, setAlarmTime] = useState('07:30');
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  return (
    <AlarmContext.Provider value={{ alarmTime, setAlarmTime, isAlarmActive, setIsAlarmActive }}>
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarm() {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarm must be used within an AlarmProvider');
  }
  return context;
} 