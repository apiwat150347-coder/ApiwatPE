import React, { useState } from 'react';
import { Student, EvaluationRecord, ThresholdRule } from '../types/football';
import { RadarChart } from './RadarChart';
import { ProgressChart } from './ProgressChart';
import { FOOTBALL_SKILLS, getGradeBadge } from '../data/skillsConfig';
import { 
  X, 
  Send, 
  Printer, 
  PlusCircle, 
  Award, 
  Dumbbell, 
  Calendar, 
  User, 
  Phone, 
  MessageCircle, 
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  rules: ThresholdRule[];
  onClose: () => void;
  onOpenScoreEntry: (student: Student, evaluation?: EvaluationRecord) => void;
  onOpenLineShare: (student: Student, evaluation: EvaluationRecord) => void;
  onOpenPrintReport: (student: Student, evaluation: EvaluationRecord) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  rules,
  onClose,
  onOpenScoreEntry,
  onOpenLineShare,
  onOpenPrintReport,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'history' | 'drills'>('radar');

  const evaluations = [...student.evaluations].sort(
    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );
  const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
  const prevEval = evaluations.length > 1 ? evaluations[evaluations.length - 2] : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Student Bio & Top Actions */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={student.avatarUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80'}
                alt={student.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-400/40 shadow-lg"
              />
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white font-black text-xs px-2 py-0.5 rounded-md shadow-md border border-white/20">
                #{student.jerseyNumber}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-emerald-400/20 text-emerald-300 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  ชั้น {student.grade}/{student.room}
                </span>
                <span className="bg-white/10 text-slate-200 text-xs px-2.5 py-0.5 rounded-full">
                  {student.position}
                </span>
                <span className="text-white/60 text-xs">
                  รหัส {student.studentCode}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {student.fullName}
                <span className="text-emerald-300 font-normal text-lg">
                  (น้อง{student.nickname})
                </span>
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                {student.parentName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    ผู้ปกครอง: {student.parentName}
                  </span>
                )}
                {student.parentPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {student.parentPhone}
                  </span>
                )}
                {student.parentLineId && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    LINE: {student.parentLineId}
                  </span>
                )}
              </div>
            </div>

            {/* Overall Score Badge */}
            {latestEval && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[110px]">
                <div className="text-[11px] text-emerald-300 font-medium">คะแนนรวมล่าสุด</div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {Math.round(latestEval.totalAverage)}
                  <span className="text-xs text-white/70 font-normal">/100</span>
                </div>
                <div className="mt-1">
                  {(() => {
                    const b = getGradeBadge(latestEval.grade);
                    return (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.bg} ${b.color}`}>
                        เกรด {latestEval.grade}
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-white/15">
            <button
              onClick={() => onOpenScoreEntry(student)}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              บันทึกคะแนนรอบใหม่
            </button>

            {latestEval && (
              <>
                <button
                  onClick={() => onOpenLineShare(student, latestEval)}
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  ส่งรายงานเข้า LINE
                </button>

                <button
                  onClick={() => onOpenPrintReport(student, latestEval)}
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  ส่งออกเป็น PDF / พิมพ์
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('radar')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'radar'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            กราฟวิเคราะห์พัฒนาการรายบุคคล
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            ประวัติการประเมิน ({student.evaluations.length})
          </button>

          <button
            onClick={() => setActiveTab('drills')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'drills'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            คำแนะนำและแบบฝึกซ้อม
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {evaluations.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-medium">ยังไม่มีข้อมูลการประเมินทักษะสำหรับนักเรียนคนนี้</p>
              <p className="text-slate-400 text-xs mt-1">คลิกปุ่ม &quot;บันทึกคะแนนรอบใหม่&quot; เพื่อเริ่มบันทึกคะแนนครั้งแรก</p>
              <button
                onClick={() => onOpenScoreEntry(student)}
                type="button"
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
              >
                + บันทึกคะแนนครั้งแรก
              </button>
            </div>
          ) : activeTab === 'radar' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Radar Chart (Left Column) */}
              <div className="lg:col-span-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-slate-800 text-sm">
                    แผนภูมิเรดาร์ทักษะ 6 ด้าน (Spider Radar Chart)
                  </h3>
                  <p className="text-xs text-slate-500">
                    เปรียบเทียบพัฒนาการระหว่างช่วงเวลาการเรียน
                  </p>
                </div>

                <RadarChart evaluations={evaluations} size={320} showLegend={true} />
              </div>

              {/* Progress Breakdown (Right Column) */}
              <div className="lg:col-span-6">
                <ProgressChart evaluations={evaluations} />

                {/* Coach Remark Callout */}
                {latestEval && latestEval.coachNotes && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      ความเห็นและคำแนะนำจากโค้ช:
                    </h5>
                    <p className="text-xs text-emerald-800 leading-relaxed italic">
                      &quot;{latestEval.coachNotes}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">บันทึกผลการประเมินทักษะทั้งหมด</h4>
                <button
                  onClick={() => onOpenScoreEntry(student)}
                  type="button"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  เพิ่มรอบประเมินใหม่
                </button>
              </div>

              <div className="space-y-3">
                {evaluations.slice().reverse().map(ev => {
                  const b = getGradeBadge(ev.grade);
                  return (
                    <div
                      key={ev.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-emerald-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-sm">{ev.sessionName}</h5>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${b.bg} ${b.color}`}>
                              เกรด {ev.grade}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            วันที่บันทึก: {new Date(ev.sessionDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenScoreEntry(student, ev)}
                            type="button"
                            className="text-xs px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md font-medium border border-slate-200 transition"
                          >
                            แก้ไขคะแนน
                          </button>
                          <button
                            onClick={() => onOpenLineShare(student, ev)}
                            type="button"
                            className="text-xs px-2.5 py-1 text-white bg-[#06C755] hover:bg-[#05b34c] rounded-md font-semibold transition flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            ส่ง LINE
                          </button>
                          <button
                            onClick={() => onOpenPrintReport(student, ev)}
                            type="button"
                            className="text-xs px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold transition flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            PDF
                          </button>
                        </div>
                      </div>

                      {/* Scores Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                        {FOOTBALL_SKILLS.map(skill => (
                          <div key={skill.key} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-500 block truncate text-[11px]">{skill.nameTh.split('/')[0]}</span>
                            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{ev.scores[skill.key]}</span>
                          </div>
                        ))}
                      </div>

                      {ev.coachNotes && (
                        <p className="text-xs text-slate-600 mt-2.5 italic">
                          โน้ตโค้ช: &quot;{ev.coachNotes}&quot;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Drills & Recommendations Tab */
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  ระบบวิเคราะห์แบบฝึกซ้อมเฉพาะบุคคล (Personalized Training System)
                </h4>
                <p className="text-xs text-emerald-800">
                  ระบบวิเคราะห์จากคะแนนทักษะรอบล่าสุด เพื่อคัดกรองแบบฝึกซ้อมที่เหมาะสมกับน้อง{student.nickname} เพื่อนำไปฝึกฝนต่อกับผู้ปกครองหรือในช่วงเสริมทักษะ
                </p>
              </div>

              {latestEval && (
                <div className="space-y-4">
                  {/* Strength Highlight */}
                  {latestEval.strengths.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                      <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        จุดแข็งที่โดดเด่น (Strengths)
                      </h5>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                        {latestEval.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {latestEval.improvements.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                      <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        ทักษะที่ควรเร่งพัฒนา (Focus Areas)
                      </h5>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                        {latestEval.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Drills */}
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-emerald-600" />
                      โปรแกรมแบบฝึกซ้อมแนะนำที่บ้านและสนาม
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {FOOTBALL_SKILLS.filter(s => (latestEval.scores[s.key] || 0) < 80).map(skill => (
                        <div key={skill.key} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-slate-800">{skill.nameTh}</span>
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                              {latestEval.scores[skill.key]} / 100
                            </span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            {skill.sampleDrills.map((drill, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{drill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
