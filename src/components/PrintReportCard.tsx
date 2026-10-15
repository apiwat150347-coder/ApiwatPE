import React from 'react';
import { Student, EvaluationRecord } from '../types/football';
import { RadarChart } from './RadarChart';
import { FOOTBALL_SKILLS, getGradeBadge } from '../data/skillsConfig';
import { Printer, X, Download, ShieldCheck, Trophy, Dumbbell } from 'lucide-react';

interface PrintReportCardProps {
  student: Student;
  evaluation: EvaluationRecord;
  onClose: () => void;
}

export const PrintReportCard: React.FC<PrintReportCardProps> = ({
  student,
  evaluation,
  onClose,
}) => {
  const gradeBadge = getGradeBadge(evaluation.grade);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Screen Controls (Hidden during print) */}
        <div className="print:hidden bg-slate-900 text-white p-3.5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              ตัวอย่างก่อนพิมพ์และส่งออกเป็น PDF (Print Preview &amp; PDF Export)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ / บันทึกเป็น PDF (Save to PDF)
            </button>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document A4 Canvas */}
        <div 
          id="printable-report-card" 
          className="p-8 sm:p-10 bg-white text-slate-900 overflow-y-auto flex-1 font-sans text-xs leading-normal select-text"
        >
          {/* Document Header */}
          <div className="border-b-2 border-emerald-800 pb-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-2xl font-black shadow-md">
                ⚽
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    โรงเรียนวัดพลมานีย์ • สำนักงานเขตลาดกระบัง
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">กรุงเทพมหานคร</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight mt-1">
                  ใบรายงานผลการพัฒนาและประเมินทักษะฟุตบอล
                </h1>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา ระดับชั้นประถมศึกษาปีที่ 3 และ 4
                </p>
                <p className="text-[11px] text-slate-400">
                  Wat Phonmanee School - Lat Krabang District • Junior Football Development Report Card
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300">
                {evaluation.sessionName}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                วันที่: {new Date(evaluation.sessionDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={student.avatarUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80'}
                alt={student.fullName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-600"
              />
              <div>
                <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {student.fullName}
                  <span className="text-emerald-700 font-semibold text-sm">
                    (น้อง{student.nickname})
                  </span>
                  <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-md font-black">
                    #{student.jerseyNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-x-4">
                  <span><strong>ระดับชั้น:</strong> {student.grade}/{student.room}</span>
                  <span><strong>ตำแหน่ง:</strong> {student.position}</span>
                  <span><strong>รหัสประจำตัว:</strong> {student.studentCode}</span>
                </div>
                {student.parentName && (
                  <div className="text-[11px] text-slate-500 mt-1">
                    ผู้ปกครอง: {student.parentName} {student.parentPhone && `(โทร: ${student.parentPhone})`}
                  </div>
                )}
              </div>
            </div>

            {/* Score Summary Box */}
            <div className="bg-white p-3 rounded-xl border border-slate-300 text-center min-w-[140px] shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">คะแนนเฉลี่ยรวม</span>
              <div className="text-3xl font-black text-emerald-900 my-0.5">
                {Math.round(evaluation.totalAverage)}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${gradeBadge.bg} ${gradeBadge.color}`}>
                ระดับ {gradeBadge.label}
              </span>
            </div>
          </div>

          {/* Charts and Scores Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6 items-center">
            
            {/* Radar Spider Chart */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-xs text-slate-800 mb-1">
                แผนภูมิเรดาร์ทักษะ 6 ด้าน (Radar Chart)
              </h3>
              <RadarChart evaluations={[evaluation]} size={240} showLegend={false} />
            </div>

            {/* Skills Table */}
            <div className="md:col-span-7">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                    <th className="p-2">ทักษะการเล่นฟุตบอล</th>
                    <th className="p-2 text-center">คะแนน</th>
                    <th className="p-2 text-center">เกณฑ์ (80%)</th>
                    <th className="p-2">ระดับความชำนาญ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {FOOTBALL_SKILLS.map(skill => {
                    const score = evaluation.scores[skill.key];
                    const passed = score >= 80;
                    return (
                      <tr key={skill.key} className="hover:bg-slate-50">
                        <td className="p-2 font-semibold text-slate-800">
                          {skill.nameTh}
                          <span className="text-[10px] text-slate-400 block font-normal">{skill.nameEn}</span>
                        </td>
                        <td className="p-2 text-center font-bold text-slate-900">
                          {score}
                        </td>
                        <td className="p-2 text-center">
                          {passed ? (
                            <span className="text-emerald-700 font-bold text-[11px]">ผ่าน ★</span>
                          ) : (
                            <span className="text-amber-700 text-[11px]">กำลังพัฒนา</span>
                          )}
                        </td>
                        <td className="p-2 text-[11px] text-slate-600">
                          {score >= 80 ? 'ดีเยี่ยม' : score >= 70 ? 'ดี' : score >= 50 ? 'พอใช้' : 'ต้องฝึกเสริม'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strengths & Improvements & Drills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
              <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 mb-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-700" />
                จุดเด่นของผู้เล่น (Strengths)
              </h4>
              <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5 mb-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-amber-700" />
                โปรแกรมแบบฝึกซ้อมแนะนำที่บ้าน (Home Drills)
              </h4>
              <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                {evaluation.recommendedDrills.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coach Comments */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
            <h4 className="font-bold text-xs text-slate-800 mb-1">
              ความคิดเห็นและคำแนะนำจากครูผู้สอน / โค้ชฟุตบอล:
            </h4>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &quot;{evaluation.coachNotes}&quot;
            </p>
          </div>

          {/* Signature & Sign-off Section */}
          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-300 text-center text-xs">
            <div>
              <div className="h-12 border-b border-dotted border-slate-400 mx-auto w-48 mb-2" />
              <p className="font-bold text-slate-800">(.........................................................)</p>
              <p className="text-slate-600 text-[11px] mt-0.5 font-medium">ครูผู้สอนวิชาพลศึกษา โรงเรียนวัดพลมานีย์</p>
              <p className="text-slate-400 text-[10px]">สำนักงานเขตลาดกระบัง</p>
            </div>

            <div>
              <div className="h-12 border-b border-dotted border-slate-400 mx-auto w-48 mb-2" />
              <p className="font-bold text-slate-800">(.........................................................)</p>
              <p className="text-slate-600 text-[11px] mt-0.5 font-medium">ผู้ปกครองรับทราบผลการประเมิน</p>
              <p className="text-slate-400 text-[10px]">โรงเรียนวัดพลมานีย์</p>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="mt-8 text-center text-[10px] text-slate-400">
            เอกสารนี้สร้างจากระบบบันทึกและวิเคราะห์ผลการเรียนทักษะฟุตบอล โรงเรียนวัดพลมานีย์ สำนักงานเขตลาดกระบัง กรุงเทพมหานคร • พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}
          </div>
        </div>
      </div>
    </div>
  );
};
