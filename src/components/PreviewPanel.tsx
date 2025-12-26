import React, { forwardRef } from 'react';
import { AlertCircle, Trash2, RefreshCw, Sparkles, ZoomIn, ZoomOut, Maximize, Hand } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';

interface PreviewPanelProps {
    mode: 'mermaid' | 'markdown';
    error: string | null;
    setError: (error: string | null) => void;
    svgContent: string;
    zoom: number;
    position: { x: number; y: number };
    isDragging: boolean;
    onZoom: (delta: number) => void;
    onResetNav: () => void;
    // Mouse event handlers passed from parent hook
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onWheel: (e: React.WheelEvent) => void;
    code: string; // Needed for markdown rendering and status bar
    theme: any; // Needed for markdown
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(({
    mode,
    error,
    setError,
    svgContent,
    zoom,
    position,
    isDragging,
    onZoom,
    onResetNav,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    code,
    theme,
    onScroll
}, ref) => {

    // DIFFERENT LAYOUT STRATEGY BASED ON MODE
    if (mode === 'markdown') {
        return (
            <section className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden group/preview">
                {/* Markdown Toolbar / Status if needed, or just container */}
                <div
                    ref={ref}
                    onScroll={onScroll}
                    className="flex-1 overflow-auto custom-scrollbar p-8 bg-white scroll-smooth"
                >
                    <div className="max-w-4xl mx-auto min-h-full">
                        <MarkdownPreview content={code} theme={theme} />
                    </div>
                </div>

                {/* Minimal Status Bar for Markdown */}
                <div className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] shrink-0 z-30">
                    <span>Markdown Preview</span>
                    <span>{code.length} Chars</span>
                </div>
            </section>
        );
    }

    return (
        <section
            className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden group/preview"
            onWheel={onWheel}
        >
            {error && (
                <div className="absolute top-6 left-6 right-6 z-40 flex flex-col gap-3 p-5 bg-red-50 border border-red-200 rounded-xl text-red-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertCircle size={20} /></div>
                        <div className="text-xs flex-1">
                            <p className="font-black text-sm mb-1 uppercase tracking-tight">Syntax Error Detected</p>
                            <p className="opacity-80 leading-relaxed font-mono whitespace-pre-wrap break-all">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="shrink-0 text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                </div>
            )}

            {/* Floating Controls */}
            <div className="absolute bottom-16 right-8 z-30 flex flex-col gap-3 opacity-0 group-hover/preview:opacity-100 transition-all duration-500 translate-y-4 group-hover/preview:translate-y-0">
                <button onClick={() => onZoom(25)} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-90 ring-1 ring-black/5" title="Zoom In"><ZoomIn size={22} /></button>
                <button onClick={() => onZoom(-25)} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-90 ring-1 ring-black/5" title="Zoom Out"><ZoomOut size={22} /></button>
                <button onClick={onResetNav} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-90 ring-1 ring-black/5" title="Center View"><Maximize size={22} /></button>
            </div>

            {/* Tips Overlay */}
            <div className="absolute bottom-16 left-8 z-30 opacity-0 group-hover/preview:opacity-100 transition-all duration-500 translate-y-4 group-hover/preview:translate-y-0 flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-slate-200 shadow-lg text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><Hand size={12} className="text-indigo-500" /> Drag to Pan</div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1.5"><ZoomIn size={12} className="text-indigo-500" /> Ctrl + Scroll to Zoom</div>
            </div>

            {/* Main Viewport */}
            <div
                className={`flex-1 overflow-hidden relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{
                    background: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '32px 32px'
                }}
            >
                <div
                    ref={ref}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    {/* Mermaid Preview */}
                    {svgContent ? (
                        <div
                            className="bg-white p-16 rounded-[2.5rem] shadow-2xl border border-slate-200/50 transition-all duration-300 ease-out pointer-events-auto"
                            style={{ transform: `scale(${zoom / 100})` }}
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    ) : !error && (
                        <div className="text-slate-400 text-center flex flex-col items-center">
                            <div className="relative mb-6">
                                <RefreshCw size={64} className="opacity-10 animate-spin duration-[3s]" />
                                <Sparkles size={32} className="absolute inset-0 m-auto text-indigo-400/30 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">Compiling Diagram</p>
                        </div>
                    )}

                    {error && !svgContent && (
                        <div className="text-slate-300 text-center flex flex-col items-center max-w-sm">
                            <AlertCircle size={80} className="mb-6 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">Awaiting Valid Syntax</p>
                            <p className="text-xs mt-2 font-medium opacity-30">The editor will refresh automatically once errors are resolved.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full border-2 ${error ? 'bg-red-500 border-red-200' : 'bg-green-500 border-green-200 animate-pulse'}`} />
                    <span className={error ? 'text-red-500' : 'text-slate-500'}>{error ? 'Syntax Critical' : 'Engine Ready'}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="opacity-50">Zoom</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md tabular-nums">{zoom}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="opacity-50">Position</span>
                        <span className="text-slate-600 tabular-nums">{Math.round(position.x)}, {Math.round(position.y)}</span>
                    </div>
                    <span>{code.length} Chars</span>
                </div>
            </div>
        </section>
    );
});

export default PreviewPanel;
