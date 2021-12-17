import { defineConfig, PluginOption } from 'vite';
import { reactAutoConfig } from '@spark-build/vite-plugin-react-auto-config';

// https://vitejs.dev/config/
export default async () => {
  return defineConfig({
    server: {
      port: 6546,
      https: {
        sessionTimeout: 1000,
      },
    },
    plugins: (await reactAutoConfig()) as PluginOption[],
  });
};
