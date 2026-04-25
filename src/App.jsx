import React, { useState, useEffect, useMemo } from "react";
import { Code2, Loader2, RotateCcw, Search } from "lucide-react";
import { parseMarkdown, getSourceFromLink } from "./utils/markdown";

import Heatmap from "./components/Heatmap";
import TagFilter from "./components/TagFilter";
import SourceFilter from "./components/SourceFilter";
import Timeline from "./components/Timeline";
import SolutionModal from "./components/SolutionModal";

export default function App() {
  const [detailedDb, setDetailedDb] = useState({});
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [activeSources, setActiveSources] = useState([]); // 1. 确保这一行存在
  const [filterMode, setFilterMode] = useState("OR");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSolution, setViewingSolution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const modules = import.meta.glob("./solutions/**/*.md", { query: '?raw', import: 'default', eager: true });
    const db = {}; const dailyCount = {};
    const todayStr = new Date().toLocaleDateString('sv-SE');
    let first = todayStr, last = todayStr;
    
    Object.entries(modules).forEach(([path, rawContent]) => {
      // --- 核心改动：修改正则以匹配 "26-04/07" 这种双层结构 ---
      // match[1] 匹配 "26-04" (年月)
      // match[2] 匹配 "07" (日)
      const dateMatch = path.match(/(\d{2}-\d{2})\/(\d{2})/);
      
      if (dateMatch) {
        // 重新拼接为标准的 YYYY-MM-DD 格式供内部使用
        // "20" + "26-04" + "-" + "07" => "2026-04-07"
        const fullDate = "20" + dateMatch[1] + "-" + dateMatch[2];
        
        const data = parseMarkdown(rawContent);
        if (data) {
          const finalData = { ...data, date: fullDate, source: getSourceFromLink(data.link) };
          
          if (!db[fullDate]) db[fullDate] = [];
          db[fullDate].push(finalData);
          dailyCount[fullDate] = (dailyCount[fullDate] || 0) + 1;
          
          if (fullDate < first) first = fullDate;
          if (fullDate > last) last = fullDate;
        }
      }
    });

    const finalEndDate = new Date(last);
    const diff = Math.ceil((finalEndDate - new Date(first)) / (1000 * 3600 * 24)) + 1;
    const totalDays = Math.max(365, diff);
    const calendar = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(finalEndDate); d.setDate(d.getDate() - i);
      const ds = d.toLocaleDateString('sv-SE');
      const c = dailyCount[ds] || 0;
      calendar.push({ date: ds, count: c, level: c >= 4 ? 4 : c >= 1 ? Math.min(c, 3) : 0 });
    }
    setDetailedDb(db); setCalendarData(calendar); setLoading(false);
  }, []);

  const allTags = useMemo(() => {
    const counts = {};
    Object.values(detailedDb).flat().forEach(t => t.tags?.forEach(tg => counts[tg] = (counts[tg] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [detailedDb]);

  const allSources = useMemo(() => {
    const counts = {};
    Object.values(detailedDb).flat().forEach(t => { counts[t.source] = (counts[t.source] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [detailedDb]);

  const timelineGroups = useMemo(() => {
    const filterTask = (t) => {
      const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      const matchesSource = activeSources.length === 0 || activeSources.includes(t.source);
      if (!matchesSource) return false;
      if (activeTags.length === 0) return true;
      return filterMode === "AND" ? activeTags.every(tg => t.tags?.includes(tg)) : activeTags.some(tg => t.tags?.includes(tg));
    };
    if (selectedDate) return [{ date: selectedDate, tasks: (detailedDb[selectedDate] || []).filter(filterTask) }];
    return Object.keys(detailedDb).sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({ date, tasks: (detailedDb[date] || []).filter(filterTask) }))
      .filter(g => g.tasks.length > 0).slice(0, 15);
  }, [selectedDate, activeTags, activeSources, filterMode, searchQuery, detailedDb]);

  if (loading) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white p-6 md:p-20 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-end font-sans">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-900 italic">
            <Code2 size={20} strokeWidth={2} /> Solver Archive
          </h1>
        </div>

        <Heatmap data={calendarData} onSelectDate={setSelectedDate} />

        <div className="border border-slate-800 divide-y divide-slate-800 shadow-sm">
          {/* 1. Search */}
          <div className="flex h-11 bg-white">
            <div className="flex-1 flex items-center px-4">
              <Search size={14} className="text-slate-300" />
              <input type="text" placeholder="Search problems..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-sans text-sm ml-3 placeholder:italic placeholder:text-slate-200" />
            </div>
            <button onClick={() => { setActiveTags([]); setActiveSources([]); setSearchQuery(""); }} className="w-24 border-l border-slate-800 flex items-center justify-center gap-1.5 text-[10px] font-bold hover:bg-slate-800 hover:text-white transition-all"><RotateCcw size={10} /> Reset</button>
          </div>

          {/* 2. Tag Filter */}
          <TagFilter 
            allTags={allTags} 
            activeTags={activeTags} 
            filterMode={filterMode} 
            onToggleTag={(t) => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} 
            onToggleMode={() => setFilterMode(m => m === "OR" ? "AND" : "OR")} 
          />

          {/* 3. Source Filter (核心：确保 activeSources 被传入) */}
          <SourceFilter 
            allSources={allSources} 
            activeSources={activeSources} 
            onToggleSource={(s) => setActiveSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} 
          />
        </div>

        <Timeline groups={timelineGroups} selectedDate={selectedDate} onDeselectDate={() => setSelectedDate(null)} onSelectTask={setViewingSolution} />
      </div>
      <SolutionModal solution={viewingSolution} onClose={() => setViewingSolution(null)} />
    </div>
  );
}