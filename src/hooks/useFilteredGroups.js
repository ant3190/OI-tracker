import { useMemo } from "react";

export function useFilteredGroups({ detailedDb, selectedDate, activeTags, activeSources, filterMode, searchQuery }) {
	return useMemo(() => {
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
	}, [detailedDb, selectedDate, activeTags, activeSources, filterMode, searchQuery]);
}
