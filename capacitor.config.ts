import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legends.shatteredveil.game',
  appName: 'Legends of the Shattered Veil',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
};

export default config;
