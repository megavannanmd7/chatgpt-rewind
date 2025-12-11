import { useMemo, useState, type MouseEvent, type CSSProperties } from 'react';
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

  const { weeks, max } = useMemo(() => {
    const start = new Date(START);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    
    const end = new Date(END);
    const weeksArr: { date: string; count: number }[][] = [];
    
    let cur = new Date(start);
    let week: { date: string; count: number }[] = [];
    let maxVal = 0; 

    while (cur <= end || week.length > 0) {
      if (cur > end && week.length === 0) break;

      const iso = toISO(cur);
      const count = dataMap.get(iso) ?? 0;
      if (count > maxVal) maxVal = count;

      week.push({ date: iso, count });

      if (week.length === 7) {
        weeksArr.push(week);
        week = [];
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return { weeks: weeksArr, max: maxVal > 0 ? maxVal : 1 }; 
  }, [dataMap]);

  function level(count: number) {
    if (count === 0) return 0;
    const ratio = count / max; 
    if (ratio >= 0.75) return 4; 
    if (ratio >= 0.50) return 3;
    if (ratio >= 0.25) return 2;
    return 1; 
  }

  const handleMouseEnter = (e: MouseEvent, date: string, count: number) => {
    const target = e.target as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const tooltipWidth = 160;   
    const padding = 10;
    let x = rect.left + rect.width / 2;
    x = Math.max(padding, Math.min(x, window.innerWidth - padding - tooltipWidth));

    setHoverInfo({ x, y: rect.top, date, count });
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

      <div className="heatmap-layout">
        
        {/* LEFT COLUMN: Fixed Weekday Labels */}
        <div className="heatmap-weekdays">
          <div className="weekday-spacer"></div> 
          <div className="weekday-row"></div>    
          <div className="weekday-row">Mon</div> 
          <div className="weekday-row"></div>    
          <div className="weekday-row">Wed</div> 
          <div className="weekday-row"></div>    
          <div className="weekday-row">Fri</div> 
          <div className="weekday-row"></div>    
        </div>

        {/* RIGHT COLUMN: Scrollable Container (Months + Grid) */}
        <div className="heatmap-scrollable">
          
          {/* Months Row */}
          <div className="heatmap-months">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="heatmap-month-label"
                style={{ '--month-offset-index': m.weekIndex.toString() } as CSSProperties}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="heatmap-grid">
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