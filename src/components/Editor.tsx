import React, { forwardRef } from 'react';
import { FileCode, Check, Copy, RefreshCw, Trash2 } from 'lucide-react';

interface EditorProps {
    mode: 'mermaid' | 'markdown';
    code: string;
    setCode: (code: string) => void;
    onCopy: () => void;
    onReset: () => void;
    onClear: () => void;
    copied: boolean;
    onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({
    mode,
    code,
    setCode,
    onCopy,
    onReset,
    onClear,
    copied,
    onScroll
}, ref) => {
    const lineNumbersRef = React.useRef<HTMLDivElement>(null);

    // Calculate lines
    const lines = React.useMemo(() => {
        return code.split('\n').map((_, i) => i + 1);
    }, [code]);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
        }
        // Pass to parent listener if exists (for sync scroll feature)
        if (onScroll) {
            onScroll(e);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const value = target.value;

            const newValue = value.substring(0, start) + "  " + value.substring(end);

            setCode(newValue);

            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 2;
            }, 0);
        }
    };

    return (
        <section className="w-[400px] lg:w-[480px] flex flex-col border-r border-slate-200 bg-white z-20 shadow-xl">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                    <FileCode size={18} className="text-indigo-500" />
                    <span className="uppercase">{mode} EDITOR</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onCopy} className="p-2 hover:bg-slate-200 rounded-md transition-all text-slate-500 active:scale-90" title="Copy Code">
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                    <button onClick={onReset} className="p-2 hover:bg-slate-200 rounded-md transition-all text-slate-500 active:scale-90" title="Reset"><RefreshCw size={16} /></button>
                    <button onClick={onClear} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-md transition-all text-slate-500 active:scale-90" title="Clear"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="flex-1 relative flex overflow-hidden">
                {/* Line Numbers */}
                <div
                    ref={lineNumbersRef}
                    className="h-full pt-6 pb-6 px-2 text-right bg-slate-50 border-r border-slate-100 select-none overflow-hidden custom-scrollbar"
                    style={{ width: '3rem' }} // Fixed width
                >
                    {lines.map(line => (
                        <div key={line} className="mono text-sm leading-relaxed text-slate-300">
                            {line}
                        </div>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    ref={ref}
                    onScroll={handleScroll}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-full p-6 mono text-sm leading-relaxed resize-none focus:outline-none bg-white custom-scrollbar selection:bg-indigo-100"
                    placeholder={mode === 'mermaid' ? "Enter Mermaid code here..." : "Enter Markdown code here..."}
                    spellCheck={false}
                    style={{ paddingLeft: '1.5rem' }} // Reduce padding slightly to fit with line numbers nicely
                />
            </div>
        </section>
    );
});

export default Editor;
