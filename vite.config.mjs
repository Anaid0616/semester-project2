import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  base: process.env.NODE_ENV === 'production' ? '/semester-project2/' : '',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index.html'),
        login: resolve(__dirname, './login/index.html'),
        register: resolve(__dirname, './register/index.html'),
        profile: resolve(__dirname, './profile/index.html'),
        listing: resolve(__dirname, './listing/index.html'),
        editListing: resolve(__dirname, './listing/edit/index.html'),
        createListing: resolve(__dirname, './listing/create/index.html'),
      },
    },
  },
});
