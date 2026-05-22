import type { CapacitorConfig } from '@capacitor/cli'

const SURFACE = '#1A1F2E' // Slate Blue dark surface; matches --md-sys-color-surface

const config: CapacitorConfig = {
  appId: 'com.logicalthinking.app',
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
    SplashScreen: {
      // ネイティブ Splash 画面はスキップしてすぐ BootLoadingScreen を表示する。
      // OS の起動アクティビティ表示は避けられないので、単色 PNG (drawable/splash.png)
      // と backgroundColor で「ロゴ無しの #1A1F2E 一色」が一瞬出るだけにする。
      launchShowDuration: 0,
      launchAutoHide: true,
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

