import { BASE_URL } from '../api/client';

/**
 * Formats a media URL to be absolute by prepending the backend BASE_URL
 * if the provided URL is a relative path.
 * 
 * @param url The media URL to format
 * @returns The absolute media URL
 */
export const formatMediaUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // If it's already an absolute URL (starts with http or https), return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Normalize relative path (remove leading slash if present)
    const normalizedPath = url.startsWith('/') ? url.slice(1) : url;

    // Ensure BASE_URL ends with a slash
    const normalizedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

    return `${normalizedBaseUrl}${normalizedPath}`;
};
