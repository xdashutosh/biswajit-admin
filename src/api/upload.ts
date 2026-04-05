import apiClient from './client';

export const uploadApi = {
    /**
     * Upload a single file to S3 via the backend.
     * Returns { key, url, originalName }.
     */
    uploadFile: async (file: File, folder?: string): Promise<{ key: string; url: string; originalName: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) formData.append('folder', folder);
        const res = await apiClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    /**
     * Upload multiple files to S3.
     * Returns array of { key, url, originalName }.
     */
    uploadFiles: async (files: File[], folder?: string): Promise<Array<{ key: string; url: string; originalName: string }>> => {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        if (folder) formData.append('folder', folder);
        const res = await apiClient.post('/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },
};
