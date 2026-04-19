import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.logic.app',
  appName: 'Logic',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'always',
    backgroundColor: '#F5F1E8',
  },
  android: {
    backgroundColor: '#F5F1E8',
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '688213389560-8he0jiu55jvlkkptcnf6p1bglujd9gas.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#F5F1E8',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#D4915A',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F5F1E8',
    },
  },
  // server: {
  //   // For dev with live reload, uncomment and set your machine LAN IP
  //   // url: 'http://192.168.1.10:5173',
  //   // cleartext: true,
  // },
}

export default config
