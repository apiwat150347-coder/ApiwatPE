import React from 'react';
import { EvaluationRecord } from '../types/football';
import { FOOTBALL_SKILLS, getGradeBadge } from '../data/skillsConfig';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface ProgressChartProps {
  evaluations: EvaluationRecord[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ evaluations }) => {
  if (evaluations.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        ยังไม่มีประวัติการประเมินทักษะ
      </div>
    );
  }

  const sortedEvals = [...evaluations].sort(
    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  const latestEval = sortedEvals[sortedEvals.length - 1];
  const firstEval = sortedEvals[0];
  const hasHistory = sortedEvals.length > 1;

  const totalGrowth = hasHistory 
    ? Math.round((latestEval.totalAverage - firstEval.totalAverage) * 10) / 10 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stat Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <span className="text-xs text-slate-500 font-medium">คะแนนล่าสุด</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {Math.round(latestEval.totalAverage)}
            <span className="text-xs font-normal text-slate-500"> / 100</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 font-medium">ระดับผลการเรียน</span>
          <div className="mt-0.5">
            {(() => {
              const b = getGradeBadge(latestEval.grade);
              return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${b.bg} ${b.color}`}>
                  {b.label}
                </span>
              );
            })()}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 font-medium">พัฒนาการรวม</span>
          <div className="flex items-center gap-1 mt-0.5">
            {totalGrowth > 0 ? (
              <span className="inline-flex items-center font-bold text-emerald-600 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                +{totalGrowth}%
              </span>
            ) : totalGrowth < 0 ? (
              <span className="inline-flex items-center font-bold text-rose-600 text-sm">
                <ArrowDownRight className="w-4 h-4" />
                {totalGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center font-bold text-slate-600 text-sm">
                <Minus className="w-4 h-4" />
                0%
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 font-medium">จำนวนครั้งประเมิน</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {evaluations.length} <span className="text-xs font-normal text-slate-500">รอบ</span>
          </div>
        </div>
      </div>

      {/* Skills Breakdown with Progress Bars */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            คะแนนทักษะรายด้านและพัฒนาการ
          </h4>
          <span className="text-xs text-slate-400">เส้นประสีเขียว = เกณฑ์ยอดเยี่ยม 80%</span>
        </div>

        <div className="space-y-3">
          {FOOTBALL_SKILLS.map(skill => {
            const currentScore = latestEval.scores[skill.key] || 0;
            const prevScore = hasHistory ? firstEval.scores[skill.key] || 0 : currentScore;
            const diff = currentScore - prevScore;

            // Bar color depending on score
            let barColor = 'bg-emerald-500';
            if (currentScore < 50) barColor = 'bg-rose-500';
            else if (currentScore < 70) barColor = 'bg-amber-500';
            else if (currentScore < 80) barColor = 'bg-blue-500';

            return (
              <div key={skill.key} className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{skill.nameTh}</span>
                    <span className="text-slate-400 hidden sm:inline">({skill.nameEn.split('&')[0]})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasHistory && (
                      <span className={`text-[11px] font-medium flex items-center ${
                        diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {diff > 0 && `+${diff}`}
                        {diff < 0 && `${diff}`}
                        {diff === 0 && '0'}
                      </span>
                    )}
                    <span className="font-bold text-slate-900 text-sm">{currentScore} <span className="text-slate-400 font-normal text-xs">/100</span></span>
                  </div>
                </div>

                {/* Progress bar with 80% benchmark line */}
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, currentScore))}%` }}
                  />
                  {/* 80% mark */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 z-10 opacity-75"
                    style={{ left: '80%' }}
                    title="เกณฑ์ 80%"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
