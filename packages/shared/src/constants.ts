import { EventType } from './types';

// Цвета для типов событий (как в ТЗ)
export const EVENT_COLORS = {
  [EventType.MASTER_CLASS]: '#4CAF50', // зеленый
  [EventType.REGULAR_GROUP]: '#2196F3', // синий
  [EventType.ONE_TIME_EVENT]: '#FF9800', // оранжевый
} as const;

// API endpoints (будет использоваться в api-client)
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  EVENTS: {
    LIST: '/events',
    BY_ID: (id: string) => `/events/${id}`,
    UPCOMING: '/events/upcoming',
    CALENDAR: '/events/calendar',
  },
  BOOKINGS: {
    CREATE: '/bookings',
    LIST: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
  MASTERS: {
    LIST: '/masters',
    BY_ID: (id: string) => `/masters/${id}`,
    ACTIVE: '/masters/active',
  },
  GROUPS: {
    LIST: '/groups',
    BY_ID: (id: string) => `/groups/${id}`,
    ACTIVE: '/groups/active',
  },
  PRODUCTS: {
    LIST: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    AVAILABLE: '/products/available',
    CATEGORIES: '/products/categories',
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    MY_ORDERS: (userId: string) => `/orders/user/${userId}`,
    QR_CODE: (id: string) => `/orders/${id}/qrcode`,
  },
  NEWS: {
    LIST: '/news',
    BY_ID: (id: string) => `/news/${id}`,
    PUBLISHED: '/news/published',
  },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
} as const;
