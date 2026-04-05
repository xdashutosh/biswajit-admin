import apiClient from './client';

export interface PlatformConfig {
    id: number;
    org_name: string;
    org_tagline: string;
    support_email: string;
    helpline_number: string;
    office_address: string;
    maintenance_mode: boolean;
    app_version: string;
    reward_points_news_like: number;
    reward_points_news_comment: number;
    reward_points_profile_completion: number;
    reward_points_voter_verification: number;
    reward_points_success_claim: number;
    reward_points_green_verified: number;
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    youtube_url: string;
    updated_at: string;
}

export const systemSettingsApi = {
    getConfig: () => apiClient.get<PlatformConfig>('/system-settings'),
    updateConfig: (data: Partial<PlatformConfig>) => apiClient.patch<PlatformConfig>('/system-settings', data),
};
