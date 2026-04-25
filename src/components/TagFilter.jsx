import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TagFilter({ allTags = [], activeTags = [], filterMode, onToggleTag, onToggleMode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white">
      <div className="flex items-center h-9">
        <div onClick={() => setIsExpanded(!isExpanded)} className="flex-1 flex items-center px-3 h-full cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden w-full text-[10px]">
            <span className="font-bold text-slate-400 shrink-0 italic">Tags:</span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar items-center">
              {activeTags && activeTags.length > 0 ? (
                activeTags.map(tag => (
                  <button key={tag} onClick={(e) => { e.stopPropagation(); onToggleTag(tag); }} className="flex items-center bg-slate-50 px-2 py-0.5 whitespace-nowrap border border-slate-200 hover:text-red-600 font-medium text-slate-600 transition-colors">
                    {tag}
                  </button>
                ))
              ) : <span className="text-slate-300 italic">all topics selected</span>}
            </div>
            <div className="ml-auto pl-2 text-slate-300 shrink-0">{isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</div>
          </div>
        </div>

        <div className="flex h-full w-24 shrink-0 border-l border-slate-800">
          <button onClick={() => filterMode !== 'AND' && onToggleMode()} className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold transition-colors ${filterMode === 'AND' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-800'}`}>And</button>
          <button onClick={() => filterMode !== 'OR' && onToggleMode()} className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold border-l border-slate-800 transition-colors ${filterMode === 'OR' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-800'}`}>Or</button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-800 bg-slate-50/10 animate-in fade-in duration-150">
          {allTags.map(([tag, count]) => {
            const isSelected = activeTags.includes(tag);
            return (
              <button key={tag} onClick={() => onToggleTag(tag)} className={`text-[11px] font-medium transition-all ${isSelected ? 'text-slate-950 border-b-2 border-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'}`}>
                {tag} <span className="text-[9px] opacity-40 font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}