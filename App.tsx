import React, { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';

import Header from './src/components/Header';
import Editor from './src/components/Editor';
import PreviewPanel from './src/components/PreviewPanel';
import { usePanZoom } from './src/hooks/usePanZoom';

type Theme = 'default' | 'neutral' | 'dark' | 'forest';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter',
});


const DEFAULT_MERMAID = `graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Enjoy!]
    B -- No --> D[Debug]
    D --> B`;

const DEFAULT_MARKDOWN = `# Hello Markdown
This is a **Markdown** editor.
- List item 1
- List item 2

\`\`\`javascript
console.log('Hello');
\`\`\`
`;

type EditorMode = 'mermaid' | 'markdown';

const App: React.FC = () => {
  const [mode, setMode] = useState<EditorMode>(() => {
    return (localStorage.getItem('editor-mode') as EditorMode) || 'mermaid';
  });

  const [code, setCode] = useState(() => {
    const savedMode = (localStorage.getItem('editor-mode') as EditorMode) || 'mermaid';
    return localStorage.getItem(`${savedMode}-session-code`) || (savedMode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN);
  });
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('neutral');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncScroll, setIsSyncScroll] = useState(true);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('editor-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(`${mode}-session-code`, code);
  }, [code, mode]);

  // Custom Hook for Navigation
  const {
    zoom,
    position,
    isDragging,
    handleZoom,
    resetNavigation,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    handleWheel,
    fitToView
  } = usePanZoom();

  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isScrolling = useRef(false);

  // Auto-fit diagram when content changes
  useEffect(() => {
    if (mode !== 'mermaid' || !svgContent || !previewRef.current) return;

    const timer = setTimeout(() => {
      const container = previewRef.current;
      if (!container) return;

      const viewport = container.parentElement;
      if (!viewport) return;

      const containerW = viewport.clientWidth;
      const containerH = viewport.clientHeight;

      const svgEl = container.querySelector('svg');
      if (svgEl) {
        try {
          const bbox = svgEl.getBBox();
          fitToView(bbox.width, bbox.height, containerW, containerH, 40);
        } catch (e) { }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [svgContent, mode, fitToView]);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!isSyncScroll || mode !== 'markdown' || isScrolling.current) return;

    isScrolling.current = true;
    const target = e.target as HTMLTextAreaElement;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);

    if (previewRef.current) {
      previewRef.current.scrollTop = percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }

    setTimeout(() => { isScrolling.current = false; }, 50);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isSyncScroll || mode !== 'markdown' || isScrolling.current) return;

    isScrolling.current = true;
    const target = e.target as HTMLDivElement;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);

    if (editorRef.current) {
      editorRef.current.scrollTop = percentage * (editorRef.current.scrollHeight - editorRef.current.clientHeight);
    }

    setTimeout(() => { isScrolling.current = false; }, 50);
  };


  // Switch default code when mode changes
  useEffect(() => {
    setError(null);
    setSvgContent('');
  }, [mode]);

  const handleModeSwitch = (newMode: EditorMode) => {
    setMode(newMode);

    // Try to restore saved session for the new mode, or valid default
    const savedCode = localStorage.getItem(`${newMode}-session-code`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(newMode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN);
    }

    resetNavigation();
  };

  // Render Mermaid code to SVG
  const renderDiagram = useCallback(async (mermaidCode: string, currentTheme: string) => {
    if (mode !== 'mermaid') return;

    if (!mermaidCode.trim()) {
      setSvgContent('');
      setError(null);
      return;
    }

    try {
      mermaid.initialize({ theme: currentTheme as any });
      const { svg } = await mermaid.render('mermaid-render-target', mermaidCode);
      setSvgContent(svg);
      setError(null);
    } catch (err: any) {
      console.error("Mermaid Render Error:", err);
      let msg = err.message || 'Syntax error in Mermaid code';

      if (msg.includes('Expecting')) {
        msg = msg.split('Expecting')[0].trim();
      }

      // Ensure newline before the pointer line (dashes followed by caret)
      msg = msg.replace(/([^\n])(\-{3,}\^)/g, '$1\n$2');

      setError(msg);
      setSvgContent('');
    }
  }, [mode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram(code, theme);
    }, 300);
    return () => clearTimeout(timer);
  }, [code, theme, renderDiagram]);


  const downloadMarkdown = () => {
    const blob = new Blob([code], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsImage = (format: 'png' | 'svg' | 'jpg') => {
    if (!svgContent) {
      console.error("Export failed: No SVG content");
      return;
    }

    // 1. Parse raw SVG string
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.documentElement;

    // REMOVED: Manual xmlns injection to avoid "redefined" errors.
    // XMLSerializer usually handles this correctly.

    // 2. Precise ViewBox parsing
    const viewBoxAttr = svgEl.getAttribute('viewBox');
    let x = 0, y = 0, width = 0, height = 0;

    if (viewBoxAttr) {
      const parts = viewBoxAttr.split(/\s+|,/).filter(Boolean).map(Number);
      if (parts.length === 4) {
        [x, y, width, height] = parts;
      }
    }

    // Fallback logic
    if (width === 0 || height === 0) {
      const wAttr = parseFloat(svgEl.getAttribute('width') || '0');
      const hAttr = parseFloat(svgEl.getAttribute('height') || '0');
      if (wAttr > 0 && hAttr > 0) {
        width = wAttr;
        height = hAttr;
      } else {
        if (previewRef.current) {
          const domSvg = previewRef.current.querySelector('svg');
          if (domSvg) {
            try {
              const bbox = domSvg.getBBox();
              width = bbox.width;
              height = bbox.height;
              x = bbox.x;
              y = bbox.y;
            } catch (e) {
              console.warn("Export BBox missing", e);
            }
          }
        }
      }
    }

    // Safety check
    if (width === 0 || height === 0) {
      width = 800; height = 600;
    }

    const padding = 40;
    // Smart scaling: Use 2x for quality, but drop to 1x if massive to avoid canvas limits
    let scale = 2;
    if ((width * scale) > 4000 || (height * scale) > 4000) {
      scale = 1;
      console.warn("Large diagram detected, reducing export scale to 1x");
    }

    svgEl.setAttribute('width', width.toString());
    svgEl.setAttribute('height', height.toString());
    svgEl.style.maxWidth = 'none';

    const serializer = new XMLSerializer();

    if (format === 'svg') {
      svgEl.setAttribute('viewBox', `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`);
      const svgData = serializer.serializeToString(svgEl);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mermaid-diagram-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const cleanSvgData = serializer.serializeToString(svgEl);

      // Use Blob URL as requested for large file support and performance
      const svgBlob = new Blob([cleanSvgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = (width + padding * 2) * scale;
        canvas.height = (height + padding * 2) * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(scale, scale);
        ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

        // Draw image
        ctx.drawImage(img, padding, padding, width, height);

        try {
          const link = document.createElement('a');
          link.download = `mermaid-diagram-${Date.now()}.${format}`;
          link.href = canvas.toDataURL(`image/${format}`, 0.9);
          link.click();
        } catch (e) {
          console.error("Export canvas error:", e);
          alert("Export failed: Image resolution might be too high for this browser. Please try SVG format.");
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = (e) => {
        console.error("Export image loading failed:", e);
        alert("Failed to render diagram. If using external images/fonts, this may be a security restriction. Please use SVG format.");
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm("重置當前的工作到預設?")) {
      const defaultCode = mode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN;
      setCode(defaultCode);
      resetNavigation();
    }
  };

  const handleClear = () => {
    setCode('');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 dark:bg-slate-900 select-none transition-colors duration-200">
      <Header
        mode={mode}
        setMode={handleModeSwitch}
        theme={theme}
        setTheme={(t) => setTheme(t as Theme)}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onDownloadMarkdown={downloadMarkdown}
        onExportImage={exportAsImage}
        isSyncScroll={isSyncScroll}
        setIsSyncScroll={setIsSyncScroll}
      />

      <main className="flex-1 flex overflow-hidden">
        <Editor
          ref={editorRef}
          mode={mode}
          code={code}
          setCode={setCode}
          onCopy={handleCopy}
          onReset={handleReset}
          onClear={handleClear}
          copied={copied}
          onScroll={handleEditorScroll}
          isDarkMode={isDarkMode}
        />

        <PreviewPanel
          ref={previewRef}
          mode={mode}
          error={error}
          setError={setError}
          svgContent={svgContent}
          zoom={zoom}
          position={position}
          isDragging={isDragging}
          onZoom={handleZoom}
          onResetNav={resetNavigation}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={handleWheel}
          onScroll={handlePreviewScroll}
          code={code}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      </main>
    </div>
  );
};

export default App;
