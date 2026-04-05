import axios from './client';
import { ApiResponse, SocialPlatform, SocialMetric } from '../types';

export const socialApi = {
  getPlatforms: async () => {
    const response = await axios.get<ApiResponse<SocialPlatform[]>>('/social-engagement/platforms');
    return response.data;
  },

  upsertPlatform: async (data: Partial<SocialPlatform>) => {
    const response = await axios.post<ApiResponse<SocialPlatform>>('/social-engagement/platforms', data);
    return response.data;
  },

  addMetric: async (data: Partial<SocialMetric>) => {
    const response = await axios.post<ApiResponse<SocialMetric>>('/social-engagement/metrics', data);
    return response.data;
  },

  getMetrics: async (platformId?: string) => {
    const response = await axios.get<ApiResponse<SocialMetric[]>>(`/social-engagement/metrics${platformId ? `?platformId=${platformId}` : ''}`);
    return response.data;
  },

  getAnalytics: async (platformId: string, months: number = 6) => {
    const response = await axios.get<ApiResponse<SocialMetric[]>>(`/social-engagement/analytics/${platformId}?months=${months}`);
    return response.data;
  }
};
