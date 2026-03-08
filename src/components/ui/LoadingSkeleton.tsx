export default function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 mt-1" />
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
                        <div className="h-3 bg-slate-50 rounded-lg w-1/2" />
                    </div>
                    <div className="h-8 w-16 bg-slate-100 rounded-xl" />
                </div>
            ))}
        </div>
    );
}
