import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { getRatingColor } from '../utils/markdown';

export default function Timeline({ groups, selectedDate, onDeselectDate, onSelectTask }) {
  return (
    <div className="relative before:absolute before:inset-0 before:left-0 before:h-full before:w-[2px] before:bg-slate-800 pb-20 pt-4 font-sans">
      
      {/* 头部状态与 Back 键 */}
      <div className="flex justify-between items-center pl-8 pb-10">
         <h3 className="text-[11px] font-bold text-slate-400 italic">
           {selectedDate ? `Browsing: ${selectedDate}` : "Latest activity"}
         </h3>
         
         {selectedDate && (
           <button 
             onClick={onDeselectDate} 
             className="text-[10px] font-bold text-slate-700 border border-slate-800 px-3 py-1 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
           >
             <ArrowLeft size={12} /> Back to history
           </button>
         )}
      </div>

      {groups.map((group) => (
        <div key={group.date} className="relative mb-14 group">
          {/* 节点外框：border-2 加粗，并向右悬离 pl-5 */}
          <div className="flex items-center gap-5 pl-5 mb-8">
             <div className="w-5 h-5 bg-white border-2 border-slate-800 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-800"></div>
             </div>
             <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 tracking-tight">
                {group.date}
             </span>
          </div>

          <div className="pl-14 space-y-10">
            {group.tasks.length > 0 ? (
              group.tasks.map((task, tIdx) => (
                <div key={tIdx} onClick={() => onSelectTask(task)} className="cursor-pointer group/item transition-all">
                  
                  {/* 标题和难度同行分布，难度靠右 */}
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-bold text-slate-800 group-hover/item:text-slate-500 transition-colors">
                      {task.title}
                    </h4>
                    <span className={`text-sm font-bold ${getRatingColor(task.difficulty)} ml-4 font-mono whitespace-nowrap`}>
                      *{task.difficulty || '0'}
                    </span>
                  </div>

                  {/* 自然大小写标签，提高对比度 */}
                  <div className="flex gap-4 mt-2">
                    {task.tags?.map(t => (
                      <span key={t} className="text-[11px] font-bold text-slate-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                  
                </div>
              ))
            ) : (
              <div className="py-2 text-slate-300 italic text-[11px]">
                -- no records found --
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}