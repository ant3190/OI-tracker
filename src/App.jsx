import React, { useState, useMemo } from "react";
import { Code2, RotateCcw, Search } from "lucide-react";
import { parseMarkdown, getSourceFromLink } from "./utils/markdown";

import Heatmap from "./components/Heatmap";
import TagFilter from "./components/TagFilter";
import SourceFilter from "./components/SourceFilter";
import Timeline from "./components/Timeline";
import SolutionModal from "./components/SolutionModal";

// 1. 在组件外部加载模块（保持不变）
const modules = import.meta.glob("/src/solutions/**/*.md", { query: '?raw', import: 'default', eager: true });
const imageModules = import.meta.glob("/src/solutions/images/**/*", { query: '?url', import: 'default', eager: true });

export default function App() {
  // 仅保留用于交互的 State
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [activeSources, setActiveSources] = useState([]);
  const [filterMode, setFilterMode] = useState("OR");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSolution, setViewingSolution] = useState(null);

  // 2. 使用 useMemo 一次性解析所有数据（替代之前的 useEffect 和 State）
  const { detailedDb, calendarData } = useMemo(() => {
    const db = {};
    const dailyCount = {};
    const todayStr = new Date().toLocaleDateString('sv-SE');
    let first = todayStr, last = todayStr;

    Object.entries(modules).forEach(([path, rawContent]) => {
      const dateMatch = path.match(/(\d{2}-\d{2})[/\\](\d{2})/);
      if (dateMatch) {
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

    return { detailedDb: db, calendarData: calendar };
  }, []); // 仅在页面加载时运行一次

  // 3. 统计 Tags 和 Sources（保持不变）
  const allTags = useMemo(() => {
    const counts = {};
    Object.values(detailedDb).flat().forEach(t => t.tags?.forEach(tg => counts[tg] = (counts[tg] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [detailedDb]);

  const allSources = useMemo(() => {
    const counts = {};
    Object.values(detailedDb).flat().forEach(t => { 
      const src = t.source || "Others";
      counts[src] = (counts[src] || 0) + 1; 
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [detailedDb]);

  // 4. 过滤逻辑（保持不变）
  const timelineGroups = useMemo(() => {
    const filterTask = (t) => {
      const title = t.title || "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      const matchesSource = activeSources.length === 0 || activeSources.includes(t.source);
      if (!matchesSource) return false;
      if (activeTags.length === 0) return true;
      const taskTags = t.tags || [];
      return filterMode === "AND" 
        ? activeTags.every(tg => taskTags.includes(tg)) 
        : activeTags.some(tg => taskTags.includes(tg));
    };

    if (selectedDate) {
      return [{ date: selectedDate, tasks: (detailedDb[selectedDate] || []).filter(filterTask) }];
    }

    return Object.keys(detailedDb).sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({ date, tasks: (detailedDb[date] || []).filter(filterTask) }))
      .filter(g => g.tasks.length > 0).slice(0, 15);
  }, [selectedDate, activeTags, activeSources, filterMode, searchQuery, detailedDb]);

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