import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MyApp',
  webDir: 'dist',
  server: {
    cleartext: true // Permite conexiones HTTP no seguras
  },
  plugins: {
    CapacitorHttp: {
      enabled: true // Habilita el plugin CapacitorHttp si lo necesitas
    }
  }
};

export default config;
