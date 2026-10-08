import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true, // Expose to local network (0.0.0.0)
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/fastapi_status': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: () => '/',
      },
    },
  },
})
