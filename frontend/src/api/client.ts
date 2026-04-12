import axios from 'axios';
import { getGuestId } from '../utils/guest';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const guestId = getGuestId();
  config.params = {
    ...(config.params ?? {}),
    guest_id: guestId,
  };
  return config;
});
