import axiosInstance from './client';

export interface DashboardStats {
    news: {
        mostShared: any;
        mostLiked: any;
        mostViewed: any;
        total: number;
        totalShares: number;
        totalLikes: number;
        totalViews: number;
    };
    jobs: {
        maxApplications: any;
        maxSuccessRate: any;
        total: number;
        totalApplications: number;
    };
    currents: {
        mostLiked: any;
        mostCommented: any;
        mostViewed: any;
        mostShared: any;
        total: number;
        totalLikes: number;
        totalViews: number;
        totalShares: number;
    };
    letters: {
        receivedInPeriod: number;
        resolvedInPeriod: number;
        total: number;
    };
    podcasts: {
        mostLiked: any;
        mostCommented: any;
        mostPlayed: any;
        total: number;
    };
    polls: {
        mostVotes: any;
        total: number;
    };
    projects: {
        ongoing: number;
        completed: number;
        mostBudget: any;
        total: number;
        categories: any[];
    };
    complaints: {
        receivedInPeriod: number;
        resolvedInPeriod: number;
        total: number;
        categories: any[];
    };
    fakeNews: {
        actionTakenInPeriod: number;
        totalDebunked: number;
        total: number;
    };
    green: {
        mostParticipation: any;
        totalChallenges: number;
        totalCompleted: number;
    };
    ideas: {
        mostVotedInPeriod: any;
        total: number;
        categories: any[];
    };
    youth: {
        mostAttendants: any;
        totalEvents: number;
    };
    social: {
        platforms: any[];
        history: any[];
    };
    users: {
        total: number;
        genderDist: any[];
        religionDist: any[];
        casteDist: any[];
    };
    recentActivity: any[];
}

export interface DemographicData {
    name: string;
    value: number;
}

export interface ConstituencyAnalytics {
    gender: DemographicData[];
    religion: DemographicData[];
    caste: DemographicData[];
    income: DemographicData[];
    party: DemographicData[];
    mla: DemographicData[];
    occupation: DemographicData[];
    family: DemographicData[];
    age: DemographicData[];
}

export const dashboardApi = {
    getStats: async (timeline: string = 'week'): Promise<{ data: DashboardStats }> => {
        const response = await axiosInstance.get(`/dashboard/stats?timeline=${timeline}`);
        return response.data;
    },
    getConstituencyAnalytics: async (constituency?: string): Promise<{ data: ConstituencyAnalytics }> => {
        const url = constituency 
            ? `/dashboard/constituency-analytics?constituency=${constituency}`
            : '/dashboard/constituency-analytics';
        const response = await axiosInstance.get(url);
        return response.data;
    }
};
