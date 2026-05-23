import React, { useState } from "react";
import { Code2, Search } from "lucide-react";
import { useSolutionData, imageModules } from "./hooks/useSolutionData";
import { useFilteredGroups } from "./hooks/useFilteredGroups";

import Heatmap from "./components/Heatmap";
import TagFilter from "./components/TagFilter";
import SourceFilter from "./components/SourceFilter";
import Timeline from "./components/Timeline";
import SolutionModal from "./components/SolutionModal";

export default function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [activeSources, setActiveSources] = useState([]);
  const [filterMode, setFilterMode] = useState("OR");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSolution, setViewingSolution] = useState(null);

  const { detailedDb, calendarData, allTags, allSources } = useSolutionData();

  const timelineGroups = useFilteredGroups({
    detailedDb, selectedDate, activeTags, activeSources, filterMode, searchQuery,
  });

  return (
    <div className="min-h-screen bg-white p-6 md:p-20 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-end font-bold italic">
          <h1 className="text-xl tracking-tighter flex items-center gap-2 text-slate-900">
            <Code2 size={20} strokeWidth={2} /> Solver Archive
          </h1>
        </div>

        <Heatmap data={calendarData} onSelectDate={setSelectedDate} />

        <div className="border border-slate-800 divide-y divide-slate-800 shadow-sm">
          <div className="flex h-11 bg-white">
            <div className="flex-1 flex items-center px-4">
              <Search size={14} className="text-slate-300" />
              <input 
                type="text" 
                placeholder="Search problems..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-sans text-sm ml-3 placeholder:italic placeholder:text-slate-200" 
              />
            </div>
            <button 
              onClick={() => { setActiveTags([]); setActiveSources([]); setSearchQuery(""); }} 
              className="w-24 border-l border-slate-800 flex items-center justify-center gap-1.5 text-[10px] font-bold hover:bg-slate-800 hover:text-white transition-all"
            >
              Reset
            </button>
          </div>

          <TagFilter 
            allTags={allTags} 
            activeTags={activeTags} 
            filterMode={filterMode} 
            onToggleTag={(t) => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} 
            onToggleMode={() => setFilterMode(m => m === "OR" ? "AND" : "OR")} 
          />
          
          <SourceFilter 
            allSources={allSources} 
            activeSources={activeSources} 
            onToggleSource={(s) => setActiveSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} 
          />
        </div>

        <Timeline groups={timelineGroups} selectedDate={selectedDate} onDeselectDate={() => setSelectedDate(null)} onSelectTask={setViewingSolution} />
      </div>
      
      <SolutionModal solution={viewingSolution} imageModules={imageModules} onClose={() => setViewingSolution(null)} />
    </div>
  );
}