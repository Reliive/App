import axios from 'axios';

// IMPORTANT: Change 192.168.x.x to your computer's actual local IPv4 address if you are testing on a real device.
// For Android Emulator: 'http://10.0.2.2:3000/api/v1'
// For iOS Simulator: 'http://localhost:3000/api/v1'
// For Physical Device via Expo Go: 'http://<YOUR_IPV4_ADDRESS>:3000/api/v1'
// Using 'http://127.0.0.1:3000/api/v1' works for physical Android devices connected via USB using: adb reverse tcp:3000 tcp:3000
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const AuthService = {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data?.data?.session?.access_token) {
        setAuthToken(response.data.data.session.access_token);
      }
      
      return response.data;
    } catch (error: any) {
      // Axios wraps the response body in error.response.data
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  async signup(name: string, email: string, password: string) {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      setAuthToken(null);
      return response.data;
    } catch (error: any) {
      // Even if backend fails, clear local token to force logout
      setAuthToken(null);
      const message = error.response?.data?.message || error.message || 'Logout failed';
      throw new Error(message);
    }
  },
};
