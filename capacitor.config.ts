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
    // TextToSpeech プラグイン側の category は src/ttsService.ts の speak() 呼び出し時に
    // 'playback' を指定している。これにより iOS では AVAudioSession が playback カテゴリで
    // 立ち上がり、silent audio loop (src/ttsService.ts startKeepAlive) と組み合わせて
    // 画面オフ・他アプリ前面遷移時もバックグラウンド再生が継続しやすくなる。
    // Cloud TTS は使わず端末内蔵 TTS エンジンのみ利用するため追加課金は発生しない。
  },
  // server: {
  //   // For dev with live reload, uncomment and set your machine LAN IP
  //   // url: 'http://192.168.1.10:5173',
  //   // cleartext: true,
  // },
}

export default config

