import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.marcocardile.pawtracker',
  appName: 'PawTracker',
  webDir: 'build',
  server: {
    url: 'http://192.168.1.73:3000',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;