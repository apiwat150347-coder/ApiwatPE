import React, { useState } from 'react';
import { EvaluationRecord } from '../types/football';
import { FOOTBALL_SKILLS } from '../data/skillsConfig';

interface RadarChartProps {
  evaluations: EvaluationRecord[];
  size?: number;
  showLegend?: boolean;
}

const SESSION_COLORS = [
  { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.25)', dot: '#2563eb', label: 'bg-blue-500' }, // Pre-test
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)', dot: '#d97706', label: 'bg-amber-500' }, // Mid-test
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.35)', dot: '#059669', label: 'bg-emerald-500' }, // Post-test
  { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.25)', dot: '#7c3aed', label: 'bg-purple-500' },
];

export const RadarChart: React.FC<RadarChartProps> = ({
  evaluations,
  size = 360,
  showLegend = true,
}) => {
  const [activeSessionIdx, setActiveSessionIdx] = useState<number | null>(null);
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = FOOTBALL_SKILLS.length;
  const levels = [20, 40, 60, 80, 100];

  // Helper to compute coordinates on circle
  const getCoordinates = (index: number, value: number) => {
    // Start angle at top (-PI/2)
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate web concentric polygons
  const polygonLevels = levels.map(level => {
    const points = FOOTBALL_SKILLS.map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    }).join(' ');
    return { level, points };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible select-none">
          {/* Circular/Web Background Grid */}
          {polygonLevels.map(({ level, points }) => (
            <polygon
              key={`grid-${level}`}
              points={points}
              fill={level === 100 ? '#f8fafc' : 'none'}
              stroke="#e2e8f0"
              strokeWidth={level === 100 || level === 80 ? 1.5 : 1}
              strokeDasharray={level === 80 ? '3 3' : undefined}
            />
          ))}

          {/* Grid Level Labels */}
          {levels.map(level => {
            const { y } = getCoordinates(0, level);
            return (
              <text
                key={`label-${level}`}
                x={center + 4}
                y={y + 10}
                fontSize={9}
                fill="#94a3b8"
                fontWeight="500"
              >
                {level}
              </text>
            );
          })}

          {/* Axes Lines */}
          {FOOTBALL_SKILLS.map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth={1.2}
              />
            );
          })}

          {/* Axis Labels */}
          {FOOTBALL_SKILLS.map((skill, i) => {
            const { angle } = getCoordinates(i, 100);
            const labelR = radius + 24;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);
            
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g key={`skill-label-${skill.key}`}>
                <text
                  x={lx}
                  y={ly}
                  fontSize={11}
                  fontWeight="600"
                  fill="#1e293b"
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                >
                  {skill.nameTh.split('/')[0].trim()}
                </text>
                <text
                  x={lx}
                  y={ly + 13}
                  fontSize={8.5}
                  fill="#64748b"
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                >
                  {skill.nameEn.split('&')[0].trim()}
                </text>
              </g>
            );
          })}

          {/* Data Polygons for each evaluation */}
          {evaluations.map((ev, sIdx) => {
            const color = SESSION_COLORS[sIdx % SESSION_COLORS.length];
            const isHighlighted = activeSessionIdx === null || activeSessionIdx === sIdx;
            const opacity = isHighlighted ? 1 : 0.2;

            const points = FOOTBALL_SKILLS.map((skill, i) => {
              const val = ev.scores[skill.key] || 0;
              const { x, y } = getCoordinates(i, val);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={`data-${ev.id || sIdx}`} opacity={opacity} className="transition-opacity duration-200">
                <polygon
                  points={points}
                  fill={color.fill}
                  stroke={color.stroke}
                  strokeWidth={sIdx === evaluations.length - 1 ? 2.5 : 1.8}
                />
                {/* Data Points */}
                {FOOTBALL_SKILLS.map((skill, i) => {
                  const val = ev.scores[skill.key] || 0;
                  const { x, y } = getCoordinates(i, val);
                  return (
                    <g key={`dot-${ev.id}-${skill.key}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r={sIdx === evaluations.length - 1 ? 4.5 : 3.5}
                        fill={color.dot}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      {sIdx === evaluations.length - 1 && (
                        <text
                          x={x}
                          y={y - 8}
                          fontSize={9.5}
                          fontWeight="700"
                          fill={color.dot}
                          textAnchor="middle"
                        >
                          {val}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Interactive Filter */}
      {showLegend && evaluations.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 px-2">
          {evaluations.map((ev, idx) => {
            const color = SESSION_COLORS[idx % SESSION_COLORS.length];
            const isCurrent = activeSessionIdx === idx;
            return (
              <button
                key={ev.id || idx}
                onClick={() => setActiveSessionIdx(isCurrent ? null : idx)}
                type="button"
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="คลิกเพื่อเน้นเฉพาะรอบนี้"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${color.label}`} />
                <span>{ev.sessionName.split('(')[0].trim()}</span>
                <span className="font-bold text-slate-900">({Math.round(ev.totalAverage)}%)</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
