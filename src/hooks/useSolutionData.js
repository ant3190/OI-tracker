import { useMemo } from "react";
import { parseMarkdown, getSourceFromLink } from "../utils/markdown";

const modules = import.meta.glob("/src/solutions/**/*.md", { query: '?raw', import: 'default', eager: true });

export const imageModules = import.meta.glob("/src/solutions/images/**/*", { query: '?url', import: 'default', eager: true });

export function useSolutionData() {
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
	}, []);

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

	return { detailedDb, calendarData, allTags, allSources };
}
