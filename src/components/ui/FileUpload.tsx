import { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { uploadApi } from '../../api/upload';
import toast from 'react-hot-toast';

interface FileUploadProps {
    /** Called with the S3 URL after successful upload, or empty string on clear */
    onUploadComplete: (url: string) => void;
    /** Currently stored URL (for edit mode) */
    currentFileUrl?: string;
    /** Label displayed above the upload area */
    label: string;
    /** S3 folder path, e.g. 'news/thumbnails' */
    folder?: string;
    /** Accept attribute for file input */
    accept?: string;
    /** Max file size in MB */
    maxSize?: number;
}

export default function FileUpload({
    onUploadComplete,
    currentFileUrl,
    label,
    folder = 'uploads',
    accept = 'image/*',
    maxSize = 20,
}: FileUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentFileUrl || null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview when currentFileUrl changes (e.g. when edit form loads)
    useEffect(() => {
        if (currentFileUrl) {
            setPreview(currentFileUrl);
        }
    }, [currentFileUrl]);

    const handleFile = async (file: File) => {
        if (maxSize && file.size > maxSize * 1024 * 1024) {
            toast.error(`Please upload a file below ${maxSize}MB only.`);
            return;
        }

        setFileName(file.name);

        // Show local preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }

        // Upload to S3
        setUploading(true);
        try {
            const result = await uploadApi.uploadFile(file, folder);
            onUploadComplete(result.url);
            toast.success('File uploaded successfully');
        } catch (error) {
            toast.error('Upload failed. Please try again.');
            console.error('Upload error:', error);
            setFileName(null);
            setPreview(currentFileUrl || null);
        } finally {
            setUploading(false);
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleFile(e.target.files[0]);
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setFileName(null);
        onUploadComplete('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 tracking-tight">{label}</label>

            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                    relative group cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all
                    ${uploading ? 'pointer-events-none opacity-70' : ''}
                    ${dragging ? 'border-brand-500 bg-brand-50/50 scale-[1.01]' : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/50'}
                    ${preview || fileName ? 'bg-slate-50/30' : ''}
                `}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={onInputChange}
                    accept={accept}
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3 py-4">
                            <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
                            <p className="text-sm font-bold text-brand-600">Uploading to cloud...</p>
                        </div>
                    ) : preview ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={clearFile}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : fileName ? (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm w-full">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                <DocumentIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-700 truncate">{fileName}</p>
                            </div>
                            <button
                                onClick={clearFile}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-all"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-brand-50 group-hover:text-brand-500 transition-all duration-300">
                                <CloudArrowUpIcon className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-700">Click or drag to upload</p>
                                <p className="text-xs text-slate-400 mt-1 font-medium">{accept.replace('/*', ' files')} up to {maxSize}MB</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
