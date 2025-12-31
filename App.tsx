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


const DEFAULT_MERMAID = `---
title: Mermaid 語法示範
---
graph TB
    %% === 流程圖：展示各種節點和連接方式 ===
    
    Start([開始]) --> Input[/輸入資料/]
    Input --> Process[處理資料]
    Process --> Decision{是否有效?}
    
    Decision -->|是| SubGraph[進入子流程]
    Decision -->|否| Error[顯示錯誤]
    Error --> Input
    
    SubGraph --> Database[(儲存到<br/>資料庫)]
    Database --> Output[/輸出結果/]
    Output --> End((結束))
    
    %% 樣式定義
    classDef processStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef errorStyle fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef successStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    class Process,SubGraph processStyle
    class Error errorStyle
    class End successStyle
    
    %% ====================================
    %% 其他圖表類型範例（取消註解即可使用）
    %% ====================================
    
    %% 序列圖 (Sequence Diagram)
    %% sequenceDiagram
    %%     participant 用戶
    %%     participant 系統
    %%     participant 資料庫
    %%     用戶->>系統: 發送請求
    %%     系統->>資料庫: 查詢資料
    %%     資料庫-->>系統: 返回結果
    %%     系統-->>用戶: 顯示結果
    
    %% 類別圖 (Class Diagram)
    %% classDiagram
    %%     class Animal {
    %%         +String name
    %%         +int age
    %%         +makeSound()
    %%     }
    %%     class Dog {
    %%         +String breed
    %%         +bark()
    %%     }
    %%     Animal <|-- Dog
    
    %% 狀態圖 (State Diagram)
    %% stateDiagram-v2
    %%     [*] --> 待處理
    %%     待處理 --> 處理中: 開始處理
    %%     處理中 --> 已完成: 處理成功
    %%     處理中 --> 失敗: 處理失敗
    %%     失敗 --> 待處理: 重試
    %%     已完成 --> [*]
    
    %% 甘特圖 (Gantt Chart)
    %% gantt
    %%     title 專案時程表
    %%     dateFormat YYYY-MM-DD
    %%     section 設計階段
    %%     需求分析: 2024-01-01, 7d
    %%     UI設計: 2024-01-08, 5d
    %%     section 開發階段
    %%     前端開發: 2024-01-13, 10d
    %%     後端開發: 2024-01-13, 10d
    
    %% 圓餅圖 (Pie Chart)
    %% pie title 專案時間分配
    %%     "設計" : 30
    %%     "開發" : 45
    %%     "測試" : 15
    %%     "部署" : 10
`;

const DEFAULT_MARKDOWN = `# Markdown 文法指南

## 標題
# 這是標題 h1
## 這是標題 h2
###### 這是標題 h6

## 強調
*此文字將為斜體*
_此文字也將為斜體_

**此文字將為粗體**
__此文字也將為粗體__

_您可以 **組合使用** 它們_

## 列表

### 無序列表
* 項目 1
* 項目 2
  * 項目 2a
  * 項目 2b
* 項目 3
  * 項目 3a
  * 項目 3b

### 有序列表
1. 項目 1
2. 項目 2
3. 項目 3
   1. 項目 3a
   2. 項目 3b

## 圖片
![這是替代文字](/image/Markdown-mark.svg "這是一張範例圖片")

## 連結
您可能正在使用 [Markdown 線上預覽](https://markdownlivepreview.com/)。

## 引用區塊
> Markdown 是一種輕量級的標記語言，採用純文字格式語法，由 John Gruber 和 Aaron Swartz 於 2004 年創建。
>
> Markdown 常用於格式化 README 文件、在線上論壇中撰寫訊息，以及使用純文字編輯器建立富文本。

## 表格
| 左列 | 右列 |
| ------------- |:-------------:|
| 左列 foo | 右列 foo |
| 左列 bar | 右列 bar |
| 左列 baz | 右列 baz |

## 程式碼區塊
\`\`\`javascript
let message = 'Hello world';
alert(message);
\`\`\`

## 行內程式碼
本網站使用 \`markedjs/marked\`。`;

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
