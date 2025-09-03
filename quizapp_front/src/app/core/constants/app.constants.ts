export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    THEME: 'theme',
    USER_TOKEN: 'user_token',
    USER_PREFERENCES: 'user_preferences'
  },
  
  CSS_CLASSES: {
    DARK_MODE: 'dark-mode',
    LOADING: 'loading',
    ERROR: 'error'
  },
  
  THEME_MODES: {
    LIGHT: 'light' as const,
    DARK: 'dark' as const,
    AUTO: 'auto' as const
  },
  
  ROUTES: {
    DASHBOARD: '/dashboard',
    LOGIN: '/connexion',
    SIGNUP: '/inscription'
  }
} as const;
