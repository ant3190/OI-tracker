import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { createMarkdownComponents } from './MarkdownComponents';

import 'katex/dist/katex.min.css';

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
							<span className="font-mono font-bold text-[11px] text-red-600">
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
							components={createMarkdownComponents(imageModules)}
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