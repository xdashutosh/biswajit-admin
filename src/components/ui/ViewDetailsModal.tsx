import Modal from './Modal';
import { formatMediaUrl } from '../../utils/media';


interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
}

export default function ViewDetailsModal({ isOpen, onClose, title, data }: ViewDetailsModalProps) {
    if (!data) return null;

    const isImageUrl = (key: string, value: any): boolean => {
        if (typeof value !== 'string' || !value) return false;
        const lowerKey = key.toLowerCase();
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.avif'];
        const lowerValue = value.toLowerCase();
        const hasImageExt = extensions.some(ext => lowerValue.split('?')[0].endsWith(ext));
        return lowerKey.includes('image') || lowerKey.includes('thumb') || hasImageExt;
    };

    const isVideoUrl = (key: string, value: any): boolean => {
        if (typeof value !== 'string' || !value) return false;
        const lowerKey = key.toLowerCase();
        const extensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const lowerValue = value.toLowerCase();
        const hasVideoExt = extensions.some(ext => lowerValue.split('?')[0].endsWith(ext));
        return lowerKey.includes('video') || hasVideoExt;
    };

    const renderValue = (key: string, value: any): React.ReactNode => {
        if (value === null || value === undefined) return <span className="text-slate-400 italic font-medium">None</span>;

        if (typeof value === 'boolean') {
            return (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${value ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                    {value ? 'True' : 'False'}
                </span>
            );
        }
        if (Array.isArray(value)) {
            return (
                <div className="flex flex-col gap-2 mt-1">
                    {value.length > 0 ? value.map((item, i) => {
                        if (typeof item === 'object' && item !== null) {
                            const label = item.option_text || item.text || item.name || item.title || item.label || JSON.stringify(item);
                            const subLabel = item.votes_count !== undefined ? `${item.votes_count} votes` : '';
                            return (
                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                                    <span className="text-[11px] font-bold text-slate-700">{label}</span>
                                    {subLabel && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subLabel}</span>}
                                </div>
                            );
                        }
                        return (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold border border-slate-200 uppercase tracking-tight w-fit">
                                {String(item)}
                            </span>
                        );
                    }) : <span className="text-slate-400 italic font-medium">Empty List</span>}
                </div>
            );
        }
        if (typeof value === 'object') {
            return (
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 mt-1">
                    <pre className="text-[10px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                    </pre>
                </div>
            );
        }
        
        // Handle images
        if (isImageUrl(key, value)) {
            const imageUrl = formatMediaUrl(String(value));
            return (
                <div className="mt-2 w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group/img">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                    <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold uppercase tracking-widest"
                    >
                        View Full
                    </a>
                </div>
            );
        }

        // Handle videos
        if (isVideoUrl(key, value)) {
            const videoUrl = formatMediaUrl(String(value));
            // Check if it's a youtube link
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1]?.split('&')[0] : videoUrl.split('/').pop();
                return (
                   <div className="mt-2 w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-lg">
                       <iframe 
                           className="w-full h-full"
                           src={`https://www.youtube.com/embed/${videoId}`}
                           title="Video player"
                           frameBorder="0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                       />
                   </div>
                );
            }

            return (
                <div className="mt-2 w-full max-w-[400px] aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-lg">
                    <video 
                        src={videoUrl} 
                        controls 
                        className="w-full h-full object-contain"
                        poster={data.thumbnail_url || data.thumbnail}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        // Handle strings that might be long
        const strValue = String(value);

        if (strValue.length > 100) {
            return <p className="text-sm text-slate-600 leading-relaxed font-medium mt-1">{strValue}</p>;
        }

        return <span className="text-sm font-bold text-slate-800">{strValue}</span>;
    };

    const keys = Object.keys(data).filter(key => 
        !['id', 'voted_option_id', 'user_id', 'poll_id'].includes(key.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {keys.map((key) => (
                    <div key={key} className="space-y-1.5 group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-brand-500 transition-colors">
                            {key.replace(/_/g, ' ')}
                        </p>
                        <div className="min-w-0 break-words">
                            {renderValue(key, data[key])}
                        </div>

                    </div>
                ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                >
                    Close Details
                </button>
            </div>
        </Modal>
    );
}
