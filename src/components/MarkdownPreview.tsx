import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
    content: string;
    theme: 'default' | 'neutral' | 'dark' | 'forest';
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme }) => {
    const isDark = theme === 'dark' || theme === 'forest';

    return (
        <div className={`prose max-w-none p-8 ${isDark ? 'prose-invert' : 'prose-slate'} prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:p-2 prose-td:border prose-td:border-slate-300 prose-td:p-2`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content provided*'}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownPreview;
