import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getRatingColor } from '../utils/markdown';

import 'katex/dist/katex.min.css';

// --- 终极防御：在 JS 层面暴力篡改 oneLight 主题对象 ---
// 根除高亮库默认的 tabSize: 2
const patchedTheme = { ...oneLight };
Object.keys(patchedTheme).forEach(key => {
  if (patchedTheme[key].tabSize !== undefined || patchedTheme[key].MozTabSize !== undefined) {
    patchedTheme[key].tabSize = "4";
    patchedTheme[key].MozTabSize = "4";
    patchedTheme[key].WebkitTabSize = "4";
  }
});

export default function SolutionModal({ solution, onClose }) {
  // 屏蔽主页面的滚动
  useEffect(() => {
    if (solution) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [solution]);

  if (!solution) return null;

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in fade-in duration-300">
      
      {/* 1. 顶栏：左侧关闭键，右侧元数据 */}
      <header className="w-full h-14 border-b border-slate-800 flex items-center justify-between px-6 md:px-12 bg-white sticky top-0 z-20 font-sans">
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-slate-950 transition-all p-2 -ml-2"
          title="Close (Esc)"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500 italic">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 not-italic">Date:</span>
            <span className="text-slate-800">{solution.date}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 not-italic">Difficulty:</span>
            <span className={getRatingColor(solution.difficulty)}>*{solution.difficulty || '0'}</span>
          </div>
        </div>
      </header>

      {/* 2. 内容区：居中宽屏排版 */}
      <main className="flex-1 overflow-y-auto bg-white scroll-smooth">
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-12 md:py-20">
          
          <header className="mb-12 border-b border-slate-100 pb-10 font-sans">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              {solution.link ? (
                <a 
                  href={solution.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-slate-600 transition-colors flex items-start gap-4 inline-flex group"
                >
                  {solution.title} 
                  <ExternalLink size={24} className="mt-2 text-slate-200 group-hover:text-slate-800 transition-colors shrink-0" />
                </a>
              ) : solution.title}
            </h2>
            
            <div className="flex flex-wrap gap-4 mt-6">
              {solution.tags?.map(t => (
                <span key={t} className="text-[11px] font-bold text-slate-400">
                  #{t}
                </span>
              ))}
            </div>
          </header>

          <article className="font-sans text-slate-700 animate-in slide-in-from-bottom-4 duration-500">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                // 蓝色的超链接渲染
                a: ({node, ...props}) => (
                  <a className="text-blue-600 hover:text-blue-800 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                
                // Typora 风格标题
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mt-12 mb-6 pb-2 border-b border-slate-200" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4 pb-1 border-b border-slate-100" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-900 mt-8 mb-3" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-base font-bold text-slate-900 mt-6 mb-2" {...props} />,
                
                // 去掉 text-justify，防止公式和文字间的空格被异常拉大
                p: ({node, ...props}) => <p className="my-4 text-base leading-7 text-slate-700" {...props} />,
                
                ul: ({node, ...props}) => <ul className="list-disc ml-6 space-y-1 my-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-6 space-y-1 my-4" {...props} />,
                li: ({node, ...props}) => <li className="leading-7" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-200 pl-4 py-0.5 italic text-slate-400 my-6" {...props} />,
                
                // 强制纯净等宽和 4 空格物理 Tab
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="my-6 border border-slate-100 overflow-x-auto">
                      <SyntaxHighlighter
                        style={patchedTheme} // 使用篡改过 tabSize 的主题
                        language={match[1]}
                        PreTag="pre" // 必须使用 pre，防止浏览器吞噬制表符
                        customStyle={{ 
                          margin: 0, 
                          padding: '1.25rem', 
                          fontSize: '0.85rem', 
                          backgroundColor: '#f9fafb', 
                          borderRadius: '0px',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre' // 强化保护真实空白符
                        }}
                        codeTagProps={{
                          style: {
                            fontFamily: 'monospace',
                            whiteSpace: 'pre'
                          }
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code 
                      className="bg-slate-50 text-[#e83e8c] px-1.5 py-0.5 font-mono text-[0.9em] rounded-none border border-slate-100" 
                      style={{ fontFamily: 'monospace' }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-8 border border-slate-200">
                    <table className="w-full border-collapse text-left" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => <th className="p-3 bg-slate-50 border border-slate-200 font-bold text-xs" {...props} />,
                td: ({node, ...props}) => <td className="p-3 border border-slate-200 text-sm" {...props} />,
              }}
            >
              {solution.content}
            </ReactMarkdown>
          </article>

          <footer className="mt-32 pb-20 border-t border-slate-50 pt-10 text-center font-sans">
            <div className="inline-block px-4 py-1 border border-slate-200 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              End of Document
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}