import React, { useEffect, useRef } from 'react';
import { ActivityCalendar } from "react-activity-calendar";

export default function Heatmap({ data, onSelectDate }) {
  const scrollRef = useRef(null);

  // 核心逻辑：数据更新后，滚动到最右边
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

  return (
    <div 
      ref={scrollRef}
      className="border border-slate-800 p-8 flex justify-start bg-[#fdfdfd] rounded-none overflow-x-auto scroll-smooth"
    >
      <div className="min-w-max"> {/* 确保内部宽度不被压缩 */}
        <ActivityCalendar 
          data={data} 
          theme={{ 
            light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] 
          }} 
          colorScheme="light"
          labels={{
            totalCount: '{{count}} activities',
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          }}
          renderBlock={(block, activity) => React.cloneElement(block, { 
            onClick: () => onSelectDate(activity.date), 
            style: { 
              cursor: 'pointer', 
              borderRadius: '0px', 
              border: '0.5px solid rgba(15,23,42,0.05)' 
            } 
          })}
        />
      </div>
    </div>
  );
}