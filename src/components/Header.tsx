import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Download, ChevronDown, Image as ImageIcon, FileImage, FileJson, FileText, Printer, Sun, Moon } from 'lucide-react';

interface HeaderProps {
    mode: 'mermaid' | 'markdown';
    setMode: (mode: 'mermaid' | 'markdown') => void;
    theme: string;
    setTheme: (theme: string) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
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
    isDarkMode,
    toggleDarkMode,
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
        const modeName = newMode === 'mermaid' ? '美人魚' : '標記掉落';
        if (confirm(`切換 到 ${modeName}? 目前的 代碼 將會 被 遺失`)) {
            setMode(newMode);
            setIsDownloadMenuOpen(false); // Close menu if open
        }
    };

    const handleExport = (action: () => void) => {
        action();
        setIsDownloadMenuOpen(false);
    }

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shrink-0 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">標記掉落 即時編輯者</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">專業的 編輯者 給 標記掉落</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-all active:scale-95"
                    title={isDarkMode ? "切換 到 亮色模式" : "切換 到 深色模式"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 uppercase">模式</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleModeChange('mermaid')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${mode === 'mermaid' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            美人魚
                        </button>
                        <button
                            onClick={() => handleModeChange('markdown')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${mode === 'markdown' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            標記掉落
                        </button>
                    </div>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                {mode === 'mermaid' && (
                    <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 uppercase">主題</span>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="text-sm bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                            <option value="default">預設</option>
                            <option value="neutral">大自然</option>
                            <option value="dark">深色的</option>
                            <option value="forest">雨林</option>
                        </select>
                    </div>
                )}

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                {mode === 'markdown' && (
                    <>
                        <button
                            onClick={() => setIsSyncScroll(!isSyncScroll)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSyncScroll ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Sync Scroll"
                        >
                            <div className={`w-2 h-2 rounded-full ${isSyncScroll ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            同步滾動
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                    </>
                )}

                <div className="relative" ref={downloadMenuRef}>
                    <button
                        onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Download size={16} />
                        <span>下載</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDownloadMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right ring-1 ring-black/5">
                            {mode === 'mermaid' ? (
                                <>
                                    <button onClick={() => handleExport(() => onExportImage('png'))} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center"><ImageIcon size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">PNG 圖片</span><span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">高保真</span></div>
                                    </button>
                                    <button onClick={() => handleExport(() => onExportImage('jpg'))} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center"><FileImage size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">JPG 圖片</span><span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">壓縮</span></div>
                                    </button>
                                    <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-700" />
                                    <button onClick={() => handleExport(() => onExportImage('svg'))} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center"><FileJson size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">SVG 向量</span><span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">解析度獨立</span></div>
                                    </button>
                                    <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-700" />
                                    <button onClick={() => handleExport(() => window.print())} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center"><Printer size={18} /></div>
                                        <div className="flex flex-col items-start"><span className="font-bold">列印 / 可攜式文件格式</span><span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">瀏覽器原生</span></div>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => handleExport(onDownloadMarkdown)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                                    <div className="flex flex-col items-start"><span className="font-bold">標註掉落 檔案</span><span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">.md 源碼</span></div>
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
