// ─── API Response Types ─────────────────────────────────────────
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    status: 'success' | 'error';
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─── User ───────────────────────────────────────────────────────
export interface User {
    user_id: number;
    user_name: string;
    email: string | null;
    mobile: string | null;
    role_id: number | null;
    status: number | null;
    location: string | null;
    voter_id: string | null;
    profession: string | null;
    interests: any;
    created_at: string;
    updated_at: string;
}

// ─── News ───────────────────────────────────────────────────────
export interface News {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    images: string[];
    rich_content: any[];
    is_published: boolean;
    likes: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
}

// ─── Job ────────────────────────────────────────────────────────
export interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    requirements: string;
    benefits: string;
    salary: string;
    location: string;
    type: string;
    category: string;
    is_active: boolean;
    posted_at: string;
    created_at: string;
    updated_at: string;
}

export interface JobApplication {
    id: string;
    job_id: string;
    user_id: number;
    status: string;
    applied_at: string;
    created_at: string;
    updated_at: string;
}

// ─── Current ────────────────────────────────────────────────────
export interface Current {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string | null;
    is_published: boolean;
    likes: number;
    shares_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
}

// ─── Letter ─────────────────────────────────────────────────────
export interface Letter {
    id: string;
    user_id: number;
    subject: string;
    message: string;
    attachments: any;
    status: string;
    response: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Podcast ────────────────────────────────────────────────────
export interface Podcast {
    id: string;
    title: string;
    host: string;
    audio_url: string;
    thumbnail_url: string | null;
    duration: string | null;
    description: string | null;
    transcript: string | null;
    likes_count: number | null;
    created_at: string;
    updated_at: string;
}

// ─── Poll ───────────────────────────────────────────────────────
export interface PollOption {
    id: string;
    poll_id: string;
    option_text: string;
    votes_count: number;
    created_at: string;
    updated_at: string;
}

export interface Poll {
    id: string;
    question: string;
    end_date: string;
    is_active: boolean;
    options: PollOption[];
    voted_option_id?: string;
    created_at: string;
    updated_at: string;
}

// ─── Development Project ────────────────────────────────────────
export interface ProjectMilestone {
    id: string;
    project_id: string;
    title: string;
    description: string;
    status: string;
    milestone_date: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface DevelopmentProject {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    budget: string | null;
    location: string;
    image_url: string | null;
    start_date: string | null;
    end_date: string | null;
    milestones?: ProjectMilestone[];
    created_at: string;
    updated_at: string;
}

// ─── Role Mapping ───────────────────────────────────────────────
export const ROLE_MAP: Record<number, string> = {
    1: 'Admin',
    2: 'Editor',
    3: 'User',
};

export const STATUS_MAP: Record<number, string> = {
    0: 'Inactive',
    1: 'Active',
    2: 'Suspended',
};
