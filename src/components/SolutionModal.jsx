/* eslint-disable no-unused-vars */
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

const patchedTheme = { ...oneLight };
Object.keys(patchedTheme).forEach(key => {
	if (patchedTheme[key].tabSize !== undefined || patchedTheme[key].MozTabSize !== undefined) {
		patchedTheme[key].tabSize = "4";
		patchedTheme[key].MozTabSize = "4";
		patchedTheme[key].WebkitTabSize = "4";
	}
});

export default function SolutionModal({ solution, imageModules, onClose }) {
	useEffect(() => {
		if (solution) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => { document.body.style.overflow = 'unset'; };
	},[solution]);

	if (!solution) return null;

	return (
		<div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in fade-in duration-300">
			<header className="w-full h-14 border-b border-slate-800 flex items-center justify-between px-6 md:px-12 bg-white sticky top-0 z-20 font-sans">
				<button onClick={onClose} className="text-slate-400 hover:text-slate-950 transition-all p-2 -ml-2" title="Close (Esc)">
					<X size={22} strokeWidth={2.5} />
				</button>

				<div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider not-italic">
					<div className="flex items-center gap-2">
						<span className="text-slate-300 uppercase">Date:</span>
						<span className="text-slate-800">{solution.date}</span>
					</div>
					<div className="h-3 w-[1px] bg-slate-200"></div>
					<div className="flex items-center gap-2">
						<span className="text-slate-300 uppercase">Difficulty:</span>
						<div className="flex items-center gap-1.5 ml-1">
							<span className={`font-mono font-bold text-[11px] ${getRatingColor(solution.difficulty)}`}>
								*{solution.difficulty || '0'}
							</span>
						</div>
					</div>
				</div>
			</header>

			<main className="flex-1 overflow-y-auto bg-white scroll-smooth">
				<div className="max-w-5xl mx-auto px-8 md:px-16 py-12 md:py-20">
					<header className="mb-12 border-b border-slate-100 pb-10">
						<h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
							{solution.link ? (
								<a href={solution.link} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors flex items-start gap-4 inline-flex">
									{solution.title} <ExternalLink size={24} className="mt-2 text-slate-200 shrink-0" />
								</a>
							) : solution.title}
						</h2>
						<div className="flex flex-wrap gap-4 mt-6">
							{solution.tags?.map(t => <span key={t} className="text-sm font-bold text-slate-400">#{t}</span>)}
						</div>
					</header>

					<article className="font-sans text-slate-700 animate-in slide-in-from-bottom-4 duration-500">
						<ReactMarkdown
							remarkPlugins={[remarkGfm, remarkMath]}
							rehypePlugins={[rehypeKatex]}
							components={{
								h1: ({node: _node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mt-10 mb-5 pb-2 border-b border-slate-200" {...props} />,
								h2: ({node: _node, ...props}) => <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-1 border-b border-slate-100" {...props} />,
								h3: ({node: _node, ...props}) => <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3" {...props} />,
								h4: ({node: _node, ...props}) => <h4 className="text-base font-bold text-slate-900 mt-5 mb-2" {...props} />,
								h5: ({node: _node, ...props}) => <h5 className="text-[15px] font-bold text-slate-900 mt-4 mb-2" {...props} />,
								h6: ({node: _node, ...props}) => <h6 className="text-sm font-bold text-slate-500 mt-4 mb-2" {...props} />,
								
								p: ({node: _node, ...props}) => <p className="my-3.5 text-base leading-7 text-slate-700" {...props} />,
								ul: ({node: _node, ...props}) => <ul className="list-disc ml-6 space-y-1 my-3 text-base" {...props} />,
								ol: ({node: _node, ...props}) => <ol className="list-decimal ml-6 space-y-1 my-3 text-base" {...props} />,
								li: ({node: _node, ...props}) => <li className="leading-7" {...props} />,
								blockquote: ({node: _node, ...props}) => <blockquote className="border-l-4 border-slate-200 pl-4 py-0.5 italic text-slate-500 my-5" {...props} />,
								
								img: ({node: _node, src, ...props}) => {
									let finalSrc = src;
									if (src && src.startsWith('/images/')) {
										const absolutePath = `/src/solutions${src}`;
										if (imageModules && imageModules[absolutePath]) {
											finalSrc = imageModules[absolutePath];
										}
									}
									return <img src={finalSrc} className="max-w-full h-auto border border-slate-200 mx-auto my-8 block shadow-sm" loading="lazy" {...props} />;
								},
								a: ({node: _node, ...props}) => <a className="text-blue-600 hover:text-blue-800 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
								
								code({ node: _node, inline, className, children, ...props }) {
								  const match = /language-(\w+)/.exec(className || '');
								  return !inline && match ? (
								    <div className="my-5 border border-slate-100 overflow-x-auto">
								      <SyntaxHighlighter
								        style={patchedTheme}
								        language={match[1]}
								        PreTag="pre"
								        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem', backgroundColor: '#f9fafb', borderRadius: '0px', fontFamily: 'monospace' }}
								        codeTagProps={{ style: { fontFamily: 'monospace' } }}
								        {...props}
								      >
								        {String(children).replace(/\n$/, '')}
								      </SyntaxHighlighter>
								    </div>
								  ) : (
								    <code className="bg-slate-50 text-[#e83e8c] px-1.5 py-0.5 font-mono text-[0.85em] rounded-sm border border-slate-100" style={{ fontFamily: 'monospace' }} {...props}>
								      {children}
								    </code>
								  );
								},
								table: ({node: _node, ...props}) => <div className="overflow-x-auto my-5"><table className="w-full border-collapse border border-slate-200 text-left" {...props} /></div>,
								th: ({node: _node, ...props}) => <th className="border border-slate-200 p-2 bg-slate-50 font-bold text-xs" {...props} />,
								td: ({node: _node, ...props}) => <td className="border border-slate-200 p-2 text-sm" {...props} />,
							}}
						>
							{solution.content}
						</ReactMarkdown>
					</article>

					<footer className="mt-20 pt-8 border-t border-slate-50 text-center font-sans">
						<p className="text-slate-200 text-[10px] font-medium italic">End of document</p>
					</footer>
				</div>
			</main>
		</div>
	);
}