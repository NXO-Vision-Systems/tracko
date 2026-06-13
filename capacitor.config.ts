import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tracko.app',
  appName: 'Tracko',
  webDir: 'out',
  server: {
    url: 'https://tracko-nine.vercel.app',
    cleartext: true
  }
};

export default config;
