import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Download, ChevronDown, Image as ImageIcon, FileImage, FileJson, FileText, Printer } from 'lucide-react';

interface HeaderProps {
    mode: 'mermaid' | 'markdown';
    setMode: (mode: 'mermaid' | 'markdown') => void;
    theme: string;
    setTheme: (theme: string) => void;
    onDownloadMarkdown: () => void;
    onExportImage: (format: 'png' | 'svg' | 'jpg') => void;
    isSyncScroll: boolean;
    setIsSyncScroll: (isSync: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
    mode,
    setMode,
    theme,
    setTheme,
    onDownloadMarkdown,
    onExportImage,
    isSyncScroll,
    setIsSyncScroll
}) => {
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setIsDownloadMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleModeChange = (newMode: 'mermaid' | 'markdown') => {
        if (newMode === mode) return;
        if (confirm(`Switch to ${newMode}? Current code will be lost.`)) {
            setMode(newMode);
            setIsDownloadMenuOpen(false); // Close menu if open
        }
    };

    const handleExport = (action: () => void) => {
        action();
        setIsDownloadMenuOpen(false);
    }

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 z-30 shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Markdown Live Editor</h1>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Professional Editor for Markdown</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                    <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Mode</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleModeChange('mermaid')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${mode === 'mermaid' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Mermaid
                        </button>
                        <button
                            onClick={() => handleModeChange('markdown')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${mode === 'markdown' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Markdown
                        </button>
                    </div>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {mode === 'mermaid' && (
                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                        <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Theme</span>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="text-sm bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                            <option value="default">Default</option>
                            <option value="neutral">Neutral</option>
                            <option value="dark">Dark</option>
                            <option value="forest">Forest</option>
                        </select>
                    </div>
                )}

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {mode === 'markdown' && (
                    <>
                        <button
                            onClick={() => setIsSyncScroll(!isSyncScroll)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSyncScroll ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                            title="Sync Scroll"
                        >
                            <div className={`w-2 h-2 rounded-full ${isSyncScroll ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                            Sync Scroll
                        </button>
                        <div className="h-6 w-px bg-slate-200 mx-2" />
                    </>
                )}

                <div className="relative" ref={downloadMenuRef}>
                    <button
                        onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Download size={16} />
                        <span>Download</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDownloadMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right ring-1 ring-black/5">
                            {mode === 'mermaid' ? (
                                <>
                                    <button onClick={() => handleExport(() => onExportImage('png'))} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><ImageIcon size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">PNG Image</span><span className="text-[10px] text-slate-400 uppercase">High Fidelity</span></div>
                                    </button>
                                    <button onClick={() => handleExport(() => onExportImage('jpg'))} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center"><FileImage size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">JPG Image</span><span className="text-[10px] text-slate-400 uppercase">Compressed</span></div>
                                    </button>
                                    <div className="mx-4 my-1 border-t border-slate-100" />
                                    <button onClick={() => handleExport(() => onExportImage('svg'))} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><FileJson size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">SVG Vector</span><span className="text-[10px] text-slate-400 uppercase">Resolution Independent</span></div>
                                    </button>
                                    <div className="mx-4 my-1 border-t border-slate-100" />
                                    <button onClick={() => handleExport(() => window.print())} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center"><Printer size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">Print / PDF</span><span className="text-[10px] text-slate-400 uppercase">Browser Native</span></div>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => handleExport(onDownloadMarkdown)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                    <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                                    <div className="flex flex-col items-start"><span className="font-bold">Markdown File</span><span className="text-[10px] text-slate-400 uppercase">.md Source Code</span></div>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
