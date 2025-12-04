import { MssApiClient } from '@mss/api-client';

export const apiClient = new MssApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});
