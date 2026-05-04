import type { CapacitorConfig } from '@capacitor/cli'

const SURFACE = '#1A1F2E' // Slate Blue dark surface; matches --md-sys-color-surface

const config: CapacitorConfig = {
  appId: 'io.logic.app',
  appName: 'Logic',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: SURFACE,
  },
  android: {
    backgroundColor: SURFACE,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '688213389560-8he0jiu55jvlkkptcnf6p1bglujd9gas.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false, // hidden manually via src/platform/splash.ts once auth is ready
      backgroundColor: SURFACE,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#A8C0FF',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: SURFACE,
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'native',
      style: 'DARK',
    },
  },
  // server: {
  //   // For dev with live reload, uncomment and set your machine LAN IP
  //   // url: 'http://192.168.1.10:5173',
  //   // cleartext: true,
  // },
}

export default config

