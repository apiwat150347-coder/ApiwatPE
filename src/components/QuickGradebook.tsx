import React, { useState } from 'react';
import { Student, EvaluationRecord, GradeLevel, SkillScores } from '../types/football';
import { calculateGrade, getGradeBadge } from '../data/skillsConfig';
import { 
  Table, 
  Save, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Calculator 
} from 'lucide-react';
import { generateGoogleSheetsTSV, downloadGoogleSheetsCSV } from '../services/googleSheets';

interface QuickGradebookProps {
  students: Student[];
  onSaveAllStudentScores: (updatedStudents: Student[]) => void;
  onOpenLineCustomMessage: (msg: string) => void;
}

export const QuickGradebook: React.FC<QuickGradebookProps> = ({
  students,
  onSaveAllStudentScores,
  onOpenLineCustomMessage,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('ป.3');
  const [selectedRoom, setSelectedRoom] = useState<string>('1');
  const [sessionName, setSessionName] = useState<string>('ประเมินปลายเทอม (Final)');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [copiedTSV, setCopiedTSV] = useState(false);

  // Filter students
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.room === selectedRoom
  );

  // Local grid matrix state: studentId -> scores + behavior
  const [gridData, setGridData] = useState<Record<string, { scores: SkillScores; behavior: number; notes: string }>>(() => {
    const initial: Record<string, { scores: SkillScores; behavior: number; notes: string }> = {};
    students.forEach(s => {
      const latest = s.evaluations.length > 0 ? s.evaluations[s.evaluations.length - 1] : null;
      initial[s.id] = {
        scores: latest ? { ...latest.scores } : {
          passing: 75,
          control: 70,
          dribbling: 75,
          shooting: 70,
          juggling: 65,
          agility_tactics: 80,
        },
        behavior: latest?.behaviorScore || 85,
        notes: latest?.coachNotes || 'มีวินัยและพัฒนาการดี',
      };
    });
    return initial;
  });

  const handleScoreChange = (studentId: string, skill: keyof SkillScores, val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setGridData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        scores: {
          ...prev[studentId]?.scores,
          [skill]: clamped,
        },
      },
    }));
  };

  const handleBehaviorChange = (studentId: string, val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setGridData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        behavior: clamped,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setGridData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  // Compute row average
  const getRowAverage = (studentId: string): number => {
    const row = gridData[studentId];
    if (!row) return 70;
    const vals = Object.values(row.scores);
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  };

  // Save all matrix changes
  const handleSaveAll = () => {
    const updatedStudents = students.map(student => {
      const row = gridData[student.id];
      if (!row) return student;

      const totalAverage = getRowAverage(student.id);
      const grade = calculateGrade(totalAverage);

      // Check if updating existing session or appending
      const existingEvalIdx = student.evaluations.findIndex(e => e.sessionName === sessionName);
      const newEval: EvaluationRecord = {
        id: existingEvalIdx >= 0 ? student.evaluations[existingEvalIdx].id : `eval-${student.id}-${Date.now()}`,
        studentId: student.id,
        sessionName,
        sessionDate,
        scores: { ...row.scores },
        behaviorScore: row.behavior,
        totalAverage,
        grade,
        coachNotes: row.notes || 'ผ่านเกณฑ์การประเมินทักษะประจำเทอม',
        strengths: [`ทักษะรวม ${totalAverage}%`, `จิตพิสัย ${row.behavior}%`],
        improvements: totalAverage < 75 ? ['ฝึกความแม่นยำเพิ่มเติม'] : ['รักษามาตรฐานการเล่น'],
        recommendedDrills: ['Two-touch passing', 'Slalom dribbling'],
      };

      let updatedEvals = [...student.evaluations];
      if (existingEvalIdx >= 0) {
        updatedEvals[existingEvalIdx] = newEval;
      } else {
        updatedEvals.push(newEval);
      }

      return {
        ...student,
        evaluations: updatedEvals,
      };
    });

    onSaveAllStudentScores(updatedStudents);
  };

  const handleCopyForSheets = () => {
    const tsv = generateGoogleSheetsTSV(classStudents);
    navigator.clipboard.writeText(tsv);
    setCopiedTSV(true);
    setTimeout(() => setCopiedTSV(false), 2500);
  };

  const handleSendScoresToLine = () => {
    const lines = [
      `⚽ [โรงเรียนวัดพลมานีย์ - สำนักงานเขตลาดกระบัง] 📋`,
      `รายงานสรุปผลการกรอกคะแนนภายในเทอม (ป.3 - ป.4)`,
      `━━━━━━━━━━━━━━━━━━`,
      `🏫 ระดับชั้น: ${selectedGrade}/${selectedRoom}`,
      `📅 รอบประเมิน: ${sessionName}`,
      `━━━━━━━━━━━━━━━━━━`,
      `รายชื่อและคะแนนนักเรียน:`,
    ];

    classStudents.forEach(s => {
      const avg = getRowAverage(s.id);
      const g = calculateGrade(avg);
      lines.push(`• #${s.jerseyNumber} ${s.fullName} (${s.nickname}): ${avg}% [เกรด ${g}]`);
    });

    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`กลุ่มสาระสุขศึกษาและพลศึกษา โรงเรียนวัดพลมานีย์`);

    onOpenLineCustomMessage(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Fast Setup */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-0.5">
              <span>โรงเรียนวัดพลมานีย์</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-normal">สำนักงานเขตลาดกระบัง</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-600" />
              ตารางกรอกคะแนนยกห้อง (In-Term Quick Gradebook)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              สะดวก รวดเร็วสำหรับครูผู้สอน: กรอกคะแนนทักษะและจิตพิสัยทั้งห้องได้พร้อมกันในหน้าเดียว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyForSheets}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              {copiedTSV ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTSV ? 'คัดลอกแล้ว!' : 'คัดลอกลง Google Sheets'}
            </button>

            <button
              type="button"
              onClick={handleSendScoresToLine}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              ส่งคะแนนเข้า LINE
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              บันทึกคะแนนทั้งห้อง
            </button>
          </div>
        </div>

        {/* Grade, Room, and Session Name Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ระดับชั้น</label>
            <div className="flex gap-2">
              {(['ป.3', 'ป.4'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    selectedGrade === g
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ห้องเรียน</label>
            <div className="flex gap-2">
              {['1', '2'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRoom(r)}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    selectedRoom === r
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ห้อง {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">รอบการประเมินในเทอม</label>
            <select
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs font-semibold"
            >
              <option value="ประเมินต้นเทอม (Pre-Test)">ประเมินต้นเทอม (Pre-Test)</option>
              <option value="ประเมินกลางเทอม (Mid-Term)">ประเมินกลางเทอม (Mid-Term)</option>
              <option value="ประเมินปลายเทอม (Final)">ประเมินปลายเทอม (Final)</option>
              <option value="คะแนนเก็บทักษะภาคปฏิบัติ">คะแนนเก็บทักษะภาคปฏิบัติ</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">วันที่บันทึกคะแนน</label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Gradebook Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            รายชื่อนักเรียน {selectedGrade}/{selectedRoom} ({classStudents.length} คน)
          </span>
          <span>คะแนนเต็ม 100 ในแต่ละทักษะ • ระบบคำนวณคะแนนเฉลี่ยและเกรดให้อัตโนมัติ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-300">
              <tr>
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3 min-w-[150px]">ชื่อนักเรียน</th>
                <th className="py-3 px-2 text-center w-20">ส่งบอล</th>
                <th className="py-3 px-2 text-center w-20">จับบอล</th>
                <th className="py-3 px-2 text-center w-20">เลี้ยงบอล</th>
                <th className="py-3 px-2 text-center w-20">ยิงประตู</th>
                <th className="py-3 px-2 text-center w-20">เดาะบอล</th>
                <th className="py-3 px-2 text-center w-20">คล่องตัว</th>
                <th className="py-3 px-2 text-center w-20">จิตพิสัย</th>
                <th className="py-3 px-3 text-center w-20">เฉลี่ย</th>
                <th className="py-3 px-3 text-center w-16">เกรด</th>
                <th className="py-3 px-3 min-w-[180px]">บันทึกหลังการเรียนของครู</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student, idx) => {
                const row = gridData[student.id] || {
                  scores: { passing: 70, control: 70, dribbling: 70, shooting: 70, juggling: 60, agility_tactics: 75 },
                  behavior: 80,
                  notes: '',
                };

                const avg = getRowAverage(student.id);
                const grade = calculateGrade(avg);
                const b = getGradeBadge(grade);

                return (
                  <tr key={student.id} className="hover:bg-emerald-50/30 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                      {student.jerseyNumber}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 truncate">
                        {student.fullName}
                      </div>
                      <span className="text-[10.5px] text-emerald-700">น้อง{student.nickname} ({student.position.split('(')[0]})</span>
                    </td>

                    {/* 6 Skill Score Inputs */}
                    {(['passing', 'control', 'dribbling', 'shooting', 'juggling', 'agility_tactics'] as const).map(skill => (
                      <td key={skill} className="py-2 px-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.scores[skill] ?? 0}
                          onChange={e => handleScoreChange(student.id, skill, Number(e.target.value) || 0)}
                          className="w-15 text-center p-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-md font-semibold text-xs focus:outline-hidden"
                        />
                      </td>
                    ))}

                    {/* Behavior / Sportsmanship Score */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.behavior ?? 80}
                        onChange={e => handleBehaviorChange(student.id, Number(e.target.value) || 0)}
                        className="w-15 text-center p-1 bg-amber-50 hover:bg-white focus:bg-white border border-amber-300 focus:border-amber-500 rounded-md font-semibold text-xs focus:outline-hidden text-amber-900"
                        title="คะแนนจิตพิสัย / น้ำใจนักกีฬา"
                      />
                    </td>

                    {/* Computed Average */}
                    <td className="py-2.5 px-3 text-center font-black text-slate-900">
                      {avg}%
                    </td>

                    {/* Grade Badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${b.bg} ${b.color}`}>
                        {grade}
                      </span>
                    </td>

                    {/* Coach Remarks */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={e => handleNotesChange(student.id, e.target.value)}
                        placeholder="ระบุข้อสังเกต พัฒนาการ..."
                        className="w-full p-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-md text-[11px] focus:outline-hidden"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Matrix Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>เมื่อแก้ไขคะแนนเรียบร้อยแล้ว กดปุ่ม <strong>&quot;บันทึกคะแนนทั้งห้อง&quot;</strong> เพื่ออัปเดตกราฟเรดาร์และส่งผลประเมิน</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            บันทึกคะแนนทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};
