// API Configuration
// Falls back to http://localhost:8001 if REACT_APP_BACKEND_URL is not set (local dev)
// On Emergent, REACT_APP_BACKEND_URL is set to the preview URL — the fallback is never used
export const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
