import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const patchedTheme = { ...oneLight };
Object.keys(patchedTheme).forEach(key => {
	if (patchedTheme[key].tabSize !== undefined || patchedTheme[key].MozTabSize !== undefined) {
		patchedTheme[key].tabSize = "4";
		patchedTheme[key].MozTabSize = "4";
		patchedTheme[key].WebkitTabSize = "4";
	}
});

export function createMarkdownComponents(imageModules) {
	return {
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
	};
}
