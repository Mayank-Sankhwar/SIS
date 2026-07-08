const env = import.meta.env

export const appConfig = {
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  appName: env.VITE_APP_NAME ?? 'Substation Information System',
  environment: env.MODE ?? 'development',
}
