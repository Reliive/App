import { api } from './auth.service';

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  member_count: number;
}

export const ClubService = {
  async listClubs(params?: any): Promise<Club[]> {
    try {
      const response = await api.get('/clubs', { params });
      return response.data?.data || [];
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to list clubs';
      throw new Error(message);
    }
  },
};
