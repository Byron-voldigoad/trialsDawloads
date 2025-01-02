import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Adresse de votre backend
        changeOrigin: true,             // Requis pour modifier l'origine si nécessaire
        secure: false,                  // Ignore les certificats SSL auto-signés
      },
    },
  },
});
