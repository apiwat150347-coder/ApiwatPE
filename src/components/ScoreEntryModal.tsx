import React, { useState } from 'react';
import { Student, EvaluationRecord, SkillScores } from '../types/football';
import { FOOTBALL_SKILLS, calculateGrade, getGradeBadge } from '../data/skillsConfig';
import { X, Save, Sparkles, Check, Info } from 'lucide-react';

interface ScoreEntryModalProps {
  student: Student;
  initialEvaluation?: EvaluationRecord;
  onClose: () => void;
  onSave: (evaluation: EvaluationRecord) => void;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  student,
  initialEvaluation,
  onClose,
  onSave,
}) => {
  const [sessionName, setSessionName] = useState(
    initialEvaluation?.sessionName || 'ประเมินปลายเทอม (Post-Test)'
  );
  const [sessionDate, setSessionDate] = useState(
    initialEvaluation?.sessionDate || new Date().toISOString().slice(0, 10)
  );
  const [scores, setScores] = useState<SkillScores>(
    initialEvaluation?.scores || {
      passing: 75,
      control: 70,
      dribbling: 75,
      shooting: 70,
      juggling: 65,
      agility_tactics: 80,
    }
  );
  const [coachNotes, setCoachNotes] = useState(initialEvaluation?.coachNotes || '');

  // Calculate Average & Grade
  const scoreValues = Object.values(scores);
  const totalAverage = Math.round(
    (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10
  ) / 10;
  const grade = calculateGrade(totalAverage);
  const gradeBadge = getGradeBadge(grade);

  const handleScoreChange = (key: keyof SkillScores, val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setScores(prev => ({ ...prev, [key]: clamped }));
  };

  const handleQuickPreset = (key: keyof SkillScores, val: number) => {
    handleScoreChange(key, val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto compute strengths and improvements based on scores
    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendedDrills: string[] = [];

    FOOTBALL_SKILLS.forEach(skill => {
      const score = scores[skill.key];
      if (score >= 80) {
        strengths.push(`${skill.nameTh} (${score} คะแนน)`);
      } else if (score < 70) {
        improvements.push(`${skill.nameTh} (${score} คะแนน)`);
        // Recommend drills from this skill
        if (skill.sampleDrills.length > 0) {
          recommendedDrills.push(skill.sampleDrills[0]);
        }
      }
    });

    if (recommendedDrills.length === 0) {
      recommendedDrills.push('แบบฝึกซ้อมทักษะเฉพาะตำแหน่งระดับก้าวหน้า (Advanced positional drills)');
    }

    const newEval: EvaluationRecord = {
      id: initialEvaluation?.id || `eval-${student.id}-${Date.now()}`,
      studentId: student.id,
      sessionName,
      sessionDate,
      scores,
      totalAverage,
      grade,
      coachNotes: coachNotes.trim() || `นักเรียนมีความตั้งใจในการเรียนและฝึกซ้อมระดับ${gradeBadge.label}`,
      strengths: initialEvaluation?.strengths?.length ? initialEvaluation.strengths : strengths,
      improvements: initialEvaluation?.improvements?.length ? initialEvaluation.improvements : improvements,
      recommendedDrills: initialEvaluation?.recommendedDrills?.length ? initialEvaluation.recommendedDrills : recommendedDrills,
    };

    onSave(newEval);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
              #{student.jerseyNumber}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {initialEvaluation ? 'แก้ไขการประเมินทักษะ' : 'บันทึกการประเมินทักษะฟุตบอล'}
              </h3>
              <p className="text-xs text-slate-300">
                {student.fullName} (น้อง{student.nickname}) ชั้น {student.grade}/{student.room}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Session Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รอบการประเมิน
              </label>
              <input
                type="text"
                list="session-presets"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="เช่น ประเมินกลางเทอม หรือ สัปดาห์ที่ 3"
              />
              <datalist id="session-presets">
                <option value="ประเมินต้นเทอม (Pre-Test)" />
                <option value="ประเมินกลางเทอม (Mid-Test)" />
                <option value="ประเมินปลายเทอม (Post-Test)" />
                <option value="ทดสอบสมรรถภาพและการเลี้ยงบอล (Session 1)" />
                <option value="ทดสอบการยิงและการส่งบอล (Session 2)" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่ประเมิน
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={e => setSessionDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Real-time Score Summary Banner */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div>
              <span className="text-xs text-emerald-800 font-medium">คะแนนเฉลี่ยรวม 6 ทักษะ</span>
              <div className="text-2xl font-black text-emerald-950">
                {totalAverage} <span className="text-xs font-normal text-emerald-700">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-800 font-medium block">ระดับผลการเรียน</span>
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${gradeBadge.bg} ${gradeBadge.color}`}>
                {gradeBadge.label}
              </span>
            </div>
          </div>

          {/* 6 Football Skills Inputs */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ให้คะแนนทักษะฟุตบอล (เต็ม 100 คะแนนต่อด้าน)
            </h4>

            {FOOTBALL_SKILLS.map(skill => {
              const currentVal = scores[skill.key];
              let rubricText = skill.rubric.improve;
              if (currentVal >= 80) rubricText = skill.rubric.excellent;
              else if (currentVal >= 70) rubricText = skill.rubric.good;
              else if (currentVal >= 50) rubricText = skill.rubric.fair;

              return (
                <div key={skill.key} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{skill.nameTh}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5 hidden sm:inline">
                        ({skill.nameEn})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quick preset buttons */}
                      <div className="hidden sm:flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(skill.key, 60)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                        >
                          60
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(skill.key, 75)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                        >
                          75
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(skill.key, 85)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                        >
                          85★
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentVal}
                          onChange={e => handleScoreChange(skill.key, parseInt(e.target.value) || 0)}
                          className="w-14 text-center font-bold text-sm py-1 bg-white border border-slate-300 rounded-md focus:outline-emerald-500"
                        />
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentVal}
                    onChange={e => handleScoreChange(skill.key, parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />

                  {/* Rubric descriptor preview */}
                  <div className="text-[11px] text-slate-500 flex items-start gap-1 bg-white p-2 rounded-lg border border-slate-100">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700">เกณฑ์ประเมิน:</strong> {rubricText}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coach Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ความคิดเห็น / คำแนะนำจากครูผู้สอนหรือโค้ช
            </label>
            <textarea
              rows={3}
              value={coachNotes}
              onChange={e => setCoachNotes(e.target.value)}
              className="w-full text-xs p-3 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="ระบุข้อสังเกต พัฒนาการ พฤติกรรมการเล่นเป็นทีม หรือคำชื่นชมสำหรับแจ้งผู้ปกครอง..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              บันทึกคะแนนประเมิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
