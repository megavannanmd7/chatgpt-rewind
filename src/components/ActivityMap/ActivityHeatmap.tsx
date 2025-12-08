import { useMemo, useState, type MouseEvent } from 'react';
import './ActivityHeatmap.css';

interface HeatDatum {
  date: string;
  count: number;
}

interface Props {
  data: HeatDatum[];
}

const START = new Date('2025-01-01T00:00:00Z');
const END = new Date('2025-12-31T23:59:59Z');

function toISO(d: Date) {
  return d.toISOString().split('T')[0];
}

// Format: "Jan 20, 2025"
function formatDate(iso: string) {
  const date = new Date(iso + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ActivityHeatmap({ data }: Props) {
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    (data || []).forEach((d) => map.set(d.date, d.count));
    return map;
  }, [data]);

  // 1. Calculate Weeks AND find the Max value for normalization
  const { weeks, max } = useMemo(() => {
    const start = new Date(START);
    // Align to the Sunday before Jan 1
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    
    const end = new Date(END);
    const weeksArr: { date: string; count: number }[][] = [];
    
    let cur = new Date(start);
    let week: { date: string; count: number }[] = [];
    let maxVal = 0; // Start at 0

    while (cur <= end || week.length > 0) {
      if (cur > end && week.length === 0) break;

      const iso = toISO(cur);
      const count = dataMap.get(iso) ?? 0;
      
      // Track the highest number of prompts in a single day
      if (count > maxVal) maxVal = count;

      week.push({ date: iso, count });

      if (week.length === 7) {
        weeksArr.push(week);
        week = [];
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return { weeks: weeksArr, max: maxVal > 0 ? maxVal : 1 }; // Prevent division by zero
  }, [dataMap]);

  // 2. Normalize colors based on user's specific Max
  function level(count: number) {
    if (count === 0) return 0;
    // Calculate percentage of user's personal best
    const ratio = count / max; 

    // Distribute levels based on that percentage
    if (ratio >= 0.75) return 4; // Top 25% of activity days
    if (ratio >= 0.50) return 3;
    if (ratio >= 0.25) return 2;
    return 1; // Any activity > 0 gets at least level 1
  }

  const handleMouseEnter = (e: MouseEvent, date: string, count: number) => {
    // Get button position for more stable tooltip positioning if needed, 
    // but cursor coordinates (e.clientX) usually work well for heatmaps.
    const target = e.target as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    
    setHoverInfo({
      // Center tooltip above the dot
      x: rect.left + rect.width / 2,
      y: rect.top,
      date,
      count
    });
  };

  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    weeks.forEach((week, w) => {
      const day = week.find((d) => {
        const dt = new Date(d.date + 'T00:00:00Z');
        return dt >= START && dt <= END;
      });
      if (day) {
        const dt = new Date(day.date + 'T00:00:00Z');
        if (dt.getUTCDate() <= 7) { 
           const month = dt.toLocaleString('default', { month: 'short' });
           if (!labels.length || labels[labels.length-1].label !== month) {
             labels.push({ label: month, weekIndex: w });
           }
        }
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="heatmap-card">
      <h3 className="heatmap-title">Activity Overview</h3>

      {/* Tooltip */}
      {hoverInfo && (
        <div 
          className="custom-tooltip"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <span className="tooltip-count">
            {hoverInfo.count === 0 ? 'No activity' : `${hoverInfo.count} prompts`}
          </span>
          <span className="tooltip-date">on {formatDate(hoverInfo.date)}</span>
        </div>
      )}

      {/* Month Labels */}
      <div className="heatmap-months">
        <div className="heatmap-month-spacer" />
        <div className="heatmap-months-inner">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="heatmap-month-label"
              style={{ left: `${m.weekIndex * 16}px` }} /* 12px dot + 4px gap = 16px */
            >
              {m.label}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-wrapper">
        {/* Weekday Labels */}
        <div className="heatmap-weekdays">
          <div className="weekday-row"></div>    
          <div className="weekday-row">Mon</div> 
          <div className="weekday-row"></div>    
          <div className="weekday-row">Wed</div> 
          <div className="weekday-row"></div>    
          <div className="weekday-row">Fri</div> 
          <div className="weekday-row"></div>    
        </div>

        {/* Heatmap Grid */}
        <div className="heatmap-weeks">
          <div className="heatmap-weeks-inner">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-column">
                {week.map((day, di) => {
                  const dt = new Date(day.date + 'T00:00:00Z');
                  const inRange = dt >= START && dt <= END;
                  
                  if (!inRange) return <div key={di} className="heat-dot" style={{ opacity: 0, pointerEvents: 'none' }} />;

                  const lvl = level(day.count);
                  
                  return (
                    <div
                      key={di}
                      className={`heat-dot heat-dot--lvl-${lvl}`}
                      onMouseEnter={(e) => handleMouseEnter(e, day.date, day.count)}
                      onMouseLeave={() => setHoverInfo(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-dots">
          <div className="heat-dot heat-dot--lvl-0" />
          <div className="heat-dot heat-dot--lvl-1" />
          <div className="heat-dot heat-dot--lvl-2" />
          <div className="heat-dot heat-dot--lvl-3" />
          <div className="heat-dot heat-dot--lvl-4" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}