import React, { useState } from 'react';
import { Student, GradeLevel } from '../types/football';
import { FOOTBALL_SKILLS, getGradeBadge } from '../data/skillsConfig';
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  Users, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface ClassAnalyticsProps {
  students: Student[];
  onOpenLineSummary: (grade: string) => void;
  onSelectStudent: (student: Student) => void;
}

export const ClassAnalytics: React.FC<ClassAnalyticsProps> = ({
  students,
  onOpenLineSummary,
  onSelectStudent,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');

  const filteredStudents = selectedGrade === 'all'
    ? students
    : students.filter(s => s.grade === selectedGrade);

  // Compute Class Stats
  const assessedStudents = filteredStudents.filter(s => s.evaluations.length > 0);
  const totalCount = filteredStudents.length;
  const assessedCount = assessedStudents.length;

  let totalScoreSum = 0;
  let gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  const skillAverages: Record<string, number> = {
    passing: 0,
    control: 0,
    dribbling: 0,
    shooting: 0,
    juggling: 0,
    agility_tactics: 0,
  };

  assessedStudents.forEach(s => {
    const latest = s.evaluations[s.evaluations.length - 1];
    totalScoreSum += latest.totalAverage;
    gradeCounts[latest.grade]++;

    FOOTBALL_SKILLS.forEach(skill => {
      skillAverages[skill.key] += latest.scores[skill.key] || 0;
    });
  });

  const classAverage = assessedCount > 0 ? Math.round((totalScoreSum / assessedCount) * 10) / 10 : 0;

  // Average per skill
  if (assessedCount > 0) {
    FOOTBALL_SKILLS.forEach(skill => {
      skillAverages[skill.key] = Math.round((skillAverages[skill.key] / assessedCount) * 10) / 10;
    });
  }

  // Find Top Performer & Most Improved
  const sortedByScore = [...assessedStudents].sort((a, b) => {
    const scoreA = a.evaluations[a.evaluations.length - 1].totalAverage;
    const scoreB = b.evaluations[b.evaluations.length - 1].totalAverage;
    return scoreB - scoreA;
  });

  const topStudent = sortedByScore.length > 0 ? sortedByScore[0] : null;

  // Most improved
  const studentsWithImprovement = assessedStudents
    .filter(s => s.evaluations.length >= 2)
    .map(s => {
      const first = s.evaluations[0].totalAverage;
      const latest = s.evaluations[s.evaluations.length - 1].totalAverage;
      return {
        student: s,
        diff: Math.round((latest - first) * 10) / 10,
      };
    })
    .sort((a, b) => b.diff - a.diff);

  const mostImproved = studentsWithImprovement.length > 0 ? studentsWithImprovement[0] : null;

  return (
    <div className="space-y-6">
      
      {/* Grade Selector & LINE summary action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">เลือกระดับชั้น:</label>
          <div className="flex flex-wrap gap-1">
            {(['all', 'ป.3', 'ป.4'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition ${
                  selectedGrade === g
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g === 'all' ? 'ทุกชั้น (ป.3 และ ป.4)' : `ชั้น ${g}`}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenLineSummary(selectedGrade === 'all' ? 'ทุกชั้น' : selectedGrade)}
          className="flex items-center gap-2 px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Send className="w-4 h-4" />
          ส่งสรุปภาพรวมชั้นเรียนเข้า LINE กลุ่ม
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Class Average */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">คะแนนเฉลี่ยระดับชั้น</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {classAverage}
            <span className="text-xs font-normal text-slate-400"> / 100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ประเมินแล้ว {assessedCount} จาก {totalCount} คน
          </div>
        </div>

        {/* Grade A Count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">ผ่านเกณฑ์ยอดเยี่ยม (A)</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {gradeCounts.A}
            <span className="text-xs font-normal text-slate-400"> คน</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            คิดเป็น {assessedCount > 0 ? Math.round((gradeCounts.A / assessedCount) * 100) : 0}% ของทั้งห้อง
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">คะแนนสูงสุด (MVP)</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          {topStudent ? (
            <div 
              onClick={() => onSelectStudent(topStudent)} 
              className="cursor-pointer hover:opacity-80 transition"
            >
              <div className="text-sm font-black text-slate-900 truncate">
                น้อง{topStudent.nickname} (#{topStudent.jerseyNumber})
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                {Math.round(topStudent.evaluations[topStudent.evaluations.length - 1].totalAverage)} คะแนน ({topStudent.position})
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">-</div>
          )}
        </div>

        {/* Most Improved */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">พัฒนาการก้าวกระโดด</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          {mostImproved ? (
            <div 
              onClick={() => onSelectStudent(mostImproved.student)} 
              className="cursor-pointer hover:opacity-80 transition"
            >
              <div className="text-sm font-black text-slate-900 truncate">
                น้อง{mostImproved.student.nickname}
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                +{mostImproved.diff}% จากรอบก่อนหน้า
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">รอการประเมินรอบ 2</div>
          )}
        </div>
      </div>

      {/* Class-wide Skills Comparison Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              เปรียบเทียบคะแนนเฉลี่ย 6 ทักษะฟุตบอลของทั้งระดับชั้น
            </h3>
            <p className="text-xs text-slate-500">
              ช่วยให้โค้ชและครูวิเคราะห์ได้ทันทีว่า ทักษะใดในชั้นเรียนที่ต้องวางแผนฝึกซ้อมเสริม
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            เกณฑ์ผ่าน: 70 คะแนน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FOOTBALL_SKILLS.map(skill => {
            const avg = skillAverages[skill.key] || 0;
            const isPassing = avg >= 70;
            const isHigh = avg >= 80;

            return (
              <div key={skill.key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800">{skill.nameTh}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{skill.nameEn.split('&')[0]}</span>
                    <span className="font-black text-slate-900 text-sm">{avg} <span className="font-normal text-slate-400 text-xs">/100</span></span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? 'bg-emerald-500' : isPassing ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, avg))}%` }}
                  />
                </div>

                <div className="mt-2 text-[11px] flex items-center justify-between text-slate-500">
                  <span>
                    {isHigh ? '✅ ระดับชั้นนี้มีทักษะนี้ดีเยี่ยม' : isPassing ? '👍 ผ่านเกณฑ์มาตรฐาน' : '⚠️ ควรจัดแบบฝึกซ้อมทักษะนี้เพิ่ม'}
                  </span>
                  <span className="font-semibold">{Math.round(avg)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Rankings / Roster in this Class */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            รายชื่อและคะแนนนักเรียนในระดับชั้น ({filteredStudents.length} คน)
          </h3>
          <span className="text-xs text-slate-400">คลิกที่แถวเพื่อดูรายละเอียดรายบุคคล</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">นักเรียน</th>
                <th className="py-3 px-3">ตำแหน่ง</th>
                <th className="py-3 px-3">รอบล่าสุด</th>
                <th className="py-3 px-3 text-center">ส่งบอล</th>
                <th className="py-3 px-3 text-center">จับบอล</th>
                <th className="py-3 px-3 text-center">เลี้ยงบอล</th>
                <th className="py-3 px-3 text-center">ยิงประตู</th>
                <th className="py-3 px-3 text-center">เดาะบอล</th>
                <th className="py-3 px-3 text-center">ความคล่องตัว</th>
                <th className="py-3 px-4 text-right">คะแนนรวม</th>
                <th className="py-3 px-4 text-center">เกรด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const latest = student.evaluations.length > 0 
                  ? student.evaluations[student.evaluations.length - 1] 
                  : null;
                const b = latest ? getGradeBadge(latest.grade) : null;

                return (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="hover:bg-emerald-50/50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80'}
                          alt={student.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            {student.fullName}
                            <span className="text-emerald-700 ml-1">({student.nickname})</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            #{student.jerseyNumber} • {student.grade}/{student.room}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {student.position.split('(')[0]}
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {latest ? latest.sessionName.split('(')[0] : 'ยังไม่ประเมิน'}
                    </td>

                    <td className="py-3 px-3 text-center font-medium">
                      {latest ? latest.scores.passing : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {latest ? latest.scores.control : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {latest ? latest.scores.dribbling : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {latest ? latest.scores.shooting : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {latest ? latest.scores.juggling : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {latest ? latest.scores.agility_tactics : '-'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {latest ? (
                        <span className="font-bold text-slate-900 text-sm">
                          {Math.round(latest.totalAverage)}%
                        </span>
                      ) : '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {latest && b ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${b.bg} ${b.color}`}>
                          {latest.grade}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
