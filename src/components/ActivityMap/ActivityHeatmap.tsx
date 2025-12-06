import { useMemo } from 'react';
import './ActivityHeatmap.css';

/**
 * Expects data: { date: 'YYYY-MM-DD', count: number }[]
 * We'll render weeks as columns, each column has 7 days (Sun..Sat).
 * We use Jan 1 2025 -> Dec 31 2025 inclusive.
 */

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

export function ActivityHeatmap({ data }: Props) {
  // Map for fast lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    (data || []).forEach((d) => map.set(d.date, d.count));
    return map;
  }, [data]);

  const { weeks, max } = useMemo(() => {
    // Start aligned to Sunday of the week that contains START
    const start = new Date(START);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // go to Sunday
    const end = new Date(END);
    // We'll generate day by day until end
    const weeks: { date: string; count: number }[][] = [];
    let cur = new Date(start);
    let week: { date: string; count: number }[] = [];
    let maxVal = 1;

    while (cur <= end) {
      const iso = toISO(cur);
      const count = dataMap.get(iso) ?? 0;
      if (count > maxVal) maxVal = count;
      week.push({ date: iso, count });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    // tail week (if any)
    if (week.length) {
      // fill until 7 with future muted days
      while (week.length < 7) {
        // Create dummy next date:
        const last = new Date(week[week.length - 1].date + 'T00:00:00Z');
        last.setUTCDate(last.getUTCDate() + 1);
        week.push({ date: toISO(last), count: 0 });
      }
      weeks.push(week);
    }

    return { weeks, max: maxVal };
  }, [dataMap]);

  // color function normalizing to 0..4 levels
  function level(count: number) {
    if (!count) return 0;
    const v = Math.min(count / Math.max(1, (max || 1)), 1);
    if (v > 0.85) return 4;
    if (v > 0.6) return 3;
    if (v > 0.3) return 2;
    return 1;
  }

  // produce month labels above appropriate week columns
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w];
      // find first day in the week that is inside 2025 (and not earlier)
      const day = week.find((d) => {
        const dt = new Date(d.date + 'T00:00:00Z');
        return dt >= START && dt <= END;
      });
      if (day) {
        const dt = new Date(day.date + 'T00:00:00Z');
        const month = dt.toLocaleString(undefined, { month: 'short' });
        // only push a label when it's the first occurrence
        if (!labels.length || labels[labels.length - 1].label !== month) {
          labels.push({ label: month, weekIndex: w });
        }
      }
    }
    return labels;
  }, [weeks]);

  return (
    <div className="heatmap-card">
      <h3 className="heatmap-title">Activity Overview</h3>

      <div className="heatmap-months">
        <div className="heatmap-month-spacer" />
        <div className="heatmap-months-inner">
          {monthLabels.map((m) => (
            <div
              key={m.weekIndex}
              className="heatmap-month-label"
              style={{ marginLeft: `${m.weekIndex * 12}px` }}
            >
              {m.label}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-wrapper" role="grid" aria-label="Activity heatmap 2025">
        <div className="heatmap-weekdays">
          <div className="wm-empty" />
          <div className="weekday">Mon</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Fri</div>
        </div>

        <div className="heatmap-weeks" style={{ overflowX: 'auto' }}>
          <div className="heatmap-weeks-inner" style={{ display: 'flex', gap: '6px', paddingBottom: '6px' }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-column" role="column">
                {week.map((day, di) => {
                  const dt = new Date(day.date + 'T00:00:00Z');
                  // only show full-intensity for 2025 days, else muted (start tail)
                  const inRange = dt >= START && dt <= END;
                  const lvl = level(day.count);
                  const cls = `heat-dot heat-dot--lvl-${lvl} ${inRange ? '' : 'heat-dot--out'}`;
                  const title = `${day.count} prompts — ${day.date}`;
                  return (
                    <div
                      key={di}
                      className={cls}
                      title={title}
                      aria-label={title}
                      role="gridcell"
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span className="muted">Less</span>
        <div className="legend-dots">
          <div className="heat-dot heat-dot--lvl-0" />
          <div className="heat-dot heat-dot--lvl-1" />
          <div className="heat-dot heat-dot--lvl-2" />
          <div className="heat-dot heat-dot--lvl-3" />
          <div className="heat-dot heat-dot--lvl-4" />
        </div>
        <span className="muted">More</span>
      </div>
    </div>
  );
}
