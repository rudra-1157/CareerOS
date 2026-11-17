import React, { useState, useMemo } from 'react';

const ContributionHeatmap = ({ submissions = [], days = 180 }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate grid of days
  const gridData = useMemo(() => {
    const today = new Date();
    const cells = [];
    const submissionMap = new Map();

    // Map existing submissions
    submissions.forEach(sub => {
      const dateStr = (sub.date || sub.submitted_at || '').slice(0, 10);
      if (dateStr) {
        submissionMap.set(dateStr, (submissionMap.get(dateStr) || 0) + (sub.count || 1));
      }
    });

    // Populate for the last `days` days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const count = submissionMap.get(iso) || 0;
      
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      cells.push({
        date: iso,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count,
        level,
        dayOfWeek: d.getDay() // 0 = Sun, 6 = Sat
      });
    }

    return cells;
  }, [submissions, days]);

  // Group into weeks (columns)
  const weeks = useMemo(() => {
    const cols = [];
    let currentWeek = [];

    // Pad first week if it does not start on Sunday
    const firstDay = gridData[0]?.dayOfWeek || 0;
    for (let p = 0; p < firstDay; p++) {
      currentWeek.push(null);
    }

    gridData.forEach(cell => {
      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      cols.push(currentWeek);
    }

    return cols;
  }, [gridData]);

  const totalContributions = useMemo(() => {
    return gridData.reduce((acc, curr) => acc + curr.count, 0);
  }, [gridData]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold" style={{ color: 'var(--color-text-main)' }}>
          {totalContributions} submissions in the past 6 months
        </span>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-2xs bg-slate-200 dark:bg-slate-700/50" />
          <span className="w-2.5 h-2.5 rounded-2xs opacity-40" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
          <span className="w-2.5 h-2.5 rounded-2xs opacity-60" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
          <span className="w-2.5 h-2.5 rounded-2xs opacity-80" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
          <span className="w-2.5 h-2.5 rounded-2xs" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((cell, dIdx) => {
                if (!cell) {
                  return <div key={dIdx} className="w-3 h-3 rounded-2xs invisible" />;
                }

                let cellBg = 'bg-slate-200/70 dark:bg-slate-800';
                let opacityStyle = {};

                if (cell.level === 1) {
                  opacityStyle = { backgroundColor: 'var(--color-primary-accent)', opacity: 0.35 };
                } else if (cell.level === 2) {
                  opacityStyle = { backgroundColor: 'var(--color-primary-accent)', opacity: 0.55 };
                } else if (cell.level === 3) {
                  opacityStyle = { backgroundColor: 'var(--color-primary-accent)', opacity: 0.8 };
                } else if (cell.level === 4) {
                  opacityStyle = { backgroundColor: 'var(--color-primary-accent)', opacity: 1 };
                }

                return (
                  <div
                    key={cell.date}
                    className={`w-3 h-3 rounded-2xs cursor-pointer transition-transform hover:scale-125 hover:z-20 ${cell.level === 0 ? cellBg : ''}`}
                    style={cell.level > 0 ? opacityStyle : {}}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hover Info Banner */}
      <div 
        className="h-6 text-xs flex items-center px-2 rounded-md font-mono transition-opacity"
        style={{
          color: hoveredCell ? 'var(--color-text-main)' : 'var(--color-text-muted)',
          backgroundColor: hoveredCell ? 'var(--color-secondary-bg)' : 'transparent'
        }}
      >
        {hoveredCell ? (
          <span>
            <strong className="font-semibold" style={{ color: 'var(--color-primary-accent)' }}>
              {hoveredCell.count} {hoveredCell.count === 1 ? 'problem solved' : 'problems solved'}
            </strong> on {hoveredCell.formattedDate}
          </span>
        ) : (
          <span className="text-[11px] opacity-75">Hover over any square to view historical problem-solving volume.</span>
        )}
      </div>
    </div>
  );
};

export default ContributionHeatmap;