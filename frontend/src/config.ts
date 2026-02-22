// API Configuration
// Empty string means relative URLs (e.g., /api/...) — works when Nginx proxies /api to backend
export const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || '';
