import { useState, useEffect } from 'react';
import { HiOutlinePhoto, HiOutlineVideoCamera, HiOutlineSpeakerWave, HiOutlineExclamationCircle } from 'react-icons/hi2';
import { formatMediaUrl } from '../../utils/media';

interface MediaPreviewProps {
    url: string;
    type?: 'image' | 'video' | 'audio' | 'auto';
    className?: string;
}

export default function MediaPreview({ url, type = 'auto', className = '' }: MediaPreviewProps) {
    const [error, setError] = useState(false);
    const [detectedType, setDetectedType] = useState<'image' | 'video' | 'audio' | 'unknown'>('unknown');

    const formattedUrl = formatMediaUrl(url);

    useEffect(() => {
        setError(false);
        if (!url) {
            setDetectedType('unknown');
            return;
        }

        if (type !== 'auto') {
            setDetectedType(type as any);
            return;
        }

        const ext = url.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
            setDetectedType('image');
        } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
            setDetectedType('video');
        } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
            setDetectedType('audio');
        } else {
            // Fallback: try to detect by looking at the URL string
            if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i)) setDetectedType('image');
            else if (url.match(/\.(mp4|webm|ogg)($|\?)/i)) setDetectedType('video');
            else if (url.match(/\.(mp3|wav|ogg)($|\?)/i)) setDetectedType('audio');
            else setDetectedType('unknown');
        }
    }, [url, type]);

    if (!url || error) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 ${className}`}>
                {error ? (
                    <>
                        <HiOutlineExclamationCircle className="w-8 h-8 text-rose-500 mb-2" />
                        <p className="text-sm text-rose-500 font-bold">Failed to load media</p>
                    </>
                ) : (
                    <>
                        <HiOutlinePhoto className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-sm text-slate-400 font-bold">No media preview available</p>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={`relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xl ${className}`}>
            {detectedType === 'image' && (
                <img
                    src={formattedUrl}
                    alt="Preview"
                    className="w-full h-full object-contain max-h-[300px]"
                    onError={() => setError(true)}
                />
            )}
            {detectedType === 'video' && (
                <video
                    src={formattedUrl}
                    controls
                    className="w-full max-h-[300px]"
                    onError={() => setError(true)}
                />
            )}
            {detectedType === 'audio' && (
                <div className="p-6 flex flex-col items-center">
                    <HiOutlineSpeakerWave className="w-10 h-10 text-brand-500 mb-4" />
                    <audio
                        src={formattedUrl}
                        controls
                        className="w-full"
                        onError={() => setError(true)}
                    />
                </div>
            )}
            {detectedType === 'unknown' && (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500">
                    <HiOutlineExclamationCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm font-bold">Unknown media format</p>
                    <a href={formattedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-brand-600 hover:underline truncate max-w-full font-bold">
                        Open link in new tab
                    </a>
                </div>
            )}

            {/* Label overlay */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider text-white border border-white/10 pointer-events-none">
                {detectedType} Preview
            </div>
        </div>
    );
}
