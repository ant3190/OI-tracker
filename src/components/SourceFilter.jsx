import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// 使用解构赋值默认值 [] 防止 undefined 导致的 length 报错
export default function SourceFilter({ allSources = [], activeSources = [], onToggleSource }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white">
      <div 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="flex items-center h-9 px-3 cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden"
      >
        <div className="flex items-center gap-2 overflow-hidden w-full text-[10px]">
          <span className="font-bold text-slate-400 shrink-0 italic">Source:</span>
          
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar items-center">
            {activeSources && activeSources.length > 0 ? (
              activeSources.map(src => (
                <button 
                  key={src} 
                  onClick={(e) => { e.stopPropagation(); onToggleSource(src); }} 
                  className="flex items-center bg-slate-50 px-2 py-0.5 whitespace-nowrap border border-slate-200 hover:text-red-600 font-medium text-slate-600 transition-colors"
                >
                  {src}
                </button>
              ))
            ) : (
              <span className="text-slate-300 italic">all sources selected</span>
            )}
          </div>

          <div className="ml-auto pl-2 text-slate-300 shrink-0">
             {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-800 bg-slate-50/10 animate-in fade-in duration-150">
          {allSources.map(([src, count]) => {
            const isSelected = activeSources.includes(src);
            return (
              <button 
                key={src} 
                onClick={() => onToggleSource(src)} 
                className={`text-[11px] font-medium transition-all ${isSelected ? 'text-slate-950 border-b-2 border-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {src} <span className="text-[9px] opacity-40 font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}