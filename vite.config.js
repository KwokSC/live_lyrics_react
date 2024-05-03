import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      global: {},
      'process.env.REACT_APP_SQUARE_ENDPOINT': JSON.stringify(env.REACT_APP_SQUARE_ENDPOINT),
      'process.env.REACT_APP_HTTP_ENDPOINT': JSON.stringify(env.REACT_APP_HTTP_ENDPOINT),
      'process.env.REACT_APP_WS_ENDPOINT' : JSON.stringify(env.REACT_APP_WS_ENDPOINT),
      'process.env.REACT_APP_SQUARE_APP_ID': JSON.stringify(env.REACT_APP_SQUARE_APP_ID),
      'process.env.REACT_APP_SQUARE_LOCATION_ID': JSON.stringify(env.REACT_APP_SQUARE_LOCATION_ID),
    },
    plugins: [react()],
  }
})