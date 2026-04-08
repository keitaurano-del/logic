// Shared API base URL for dev/prod
export const API_BASE = import.meta.env.DEV
  ? `http://${window.location.hostname}:3001`
  : ''
