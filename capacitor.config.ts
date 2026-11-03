import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legends.shatteredveil.game',
  appName: 'Legends of the Shattered Veil',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  },
  plugins: {
    // Capacitor 8 lays the WebView edge-to-edge on Android 15/16. The WebView
    // draws behind the status bar, so the shared UI must receive real insets.
    // `css` injects --safe-area-inset-* (used by src/index.css) and keeps the
    // viewport-fit=cover value in sync with the native window.
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DARK'
    }
  }
};

export default config;
