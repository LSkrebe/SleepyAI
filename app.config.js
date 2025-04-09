export default {
  expo: {
    name: 'SleepyAI',
    slug: 'sleepyai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.svg',
    userInterfaceStyle: 'light',
    scheme: 'sleepyai',
    newArchEnabled: true,
    splash: {
      image: './assets/splash.svg',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.svg',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      favicon: './assets/favicon.svg'
    },
    extra: {
      EXPO_PUBLIC_GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY,
    },
  }
}; 