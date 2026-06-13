import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.noxofy.app',
  appName: 'Noxofy',
  webDir: 'out',
  server: {
    url: 'https://tracko-nine.vercel.app',
    cleartext: true
  }
};

export default config;
