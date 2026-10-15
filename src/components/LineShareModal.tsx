import React, { useState } from 'react';
import { Student, EvaluationRecord, TriggeredAlert } from '../types/football';
import { 
  formatStudentLineMessage, 
  formatMilestoneAlertLineMessage, 
  formatClassSummaryLineMessage, 
  openLineShare 
} from '../services/lineShare';
import { X, Send, Copy, Check, MessageSquare, Sparkles, Share2 } from 'lucide-react';

interface LineShareModalProps {
  student?: Student;
  evaluation?: EvaluationRecord;
  previousEvaluation?: EvaluationRecord;
  alert?: TriggeredAlert;
  allStudents?: Student[];
  customMessage?: string;
  onClose: () => void;
}

export const LineShareModal: React.FC<LineShareModalProps> = ({
  student,
  evaluation,
  previousEvaluation,
  alert,
  allStudents = [],
  customMessage,
  onClose,
}) => {
  // Determine default message
  let defaultMessage = '';
  if (customMessage) {
    defaultMessage = customMessage;
  } else if (alert) {
    defaultMessage = formatMilestoneAlertLineMessage(alert);
  } else if (student && evaluation) {
    defaultMessage = formatStudentLineMessage(student, evaluation, previousEvaluation);
  } else if (allStudents.length > 0) {
    defaultMessage = formatClassSummaryLineMessage('ป.3', allStudents);
  }

  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<'individual' | 'milestone' | 'class'>(
    alert ? 'milestone' : student ? 'individual' : 'class'
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenLine = () => {
    openLineShare(message);
  };

  const handleSwitchPreset = (preset: 'individual' | 'milestone' | 'class') => {
    setActivePreset(preset);
    if (preset === 'individual' && student && evaluation) {
      setMessage(formatStudentLineMessage(student, evaluation, previousEvaluation));
    } else if (preset === 'milestone') {
      if (alert) {
        setMessage(formatMilestoneAlertLineMessage(alert));
      } else if (student && evaluation) {
        // synthesize milestone message
        const synthAlert: TriggeredAlert = {
          id: 'temp-alert',
          ruleId: 'temp',
          studentId: student.id,
          studentName: student.fullName,
          studentNickname: student.nickname,
          grade: `${student.grade}/${student.room}`,
          sessionName: evaluation.sessionName,
          title: `แจ้งเตือนเกณฑ์ดีเด่น: น้อง${student.nickname}`,
          message: `🎉 ขอแสดงความยินดีกับน้อง ${student.nickname} ที่ผ่านเกณฑ์คะแนนทักษะฟุตบอลรวม ${Math.round(evaluation.totalAverage)}% (เกรด ${evaluation.grade}) พร้อมทักษะโดดเด่น ${evaluation.strengths.join(', ') || 'รอบด้าน'}!`,
          badgeLabel: '🏆 นักเตะดาวรุ่งยอดเยี่ยม',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: true,
          sentToLine: false,
        };
        setMessage(formatMilestoneAlertLineMessage(synthAlert));
      }
    } else if (preset === 'class' && allStudents.length > 0) {
      const grade = student ? student.grade : 'ป.4';
      setMessage(formatClassSummaryLineMessage(grade, allStudents));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#06C755] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                ส่งรายงานผลการเรียนผ่าน LINE กลุ่มทันที
              </h3>
              <p className="text-xs text-white/80">
                แชร์เข้ากลุ่มผู้ปกครอง กลุ่มครูพลศึกษา หรือแชทส่วนตัวด้วยคลิกเดียว
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            {student && evaluation && (
              <button
                type="button"
                onClick={() => handleSwitchPreset('individual')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition ${
                  activePreset === 'individual'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👤 รายบุคคล (น้อง{student.nickname})
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSwitchPreset('milestone')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition ${
                activePreset === 'milestone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏆 แจ้งเตือนผ่านเกณฑ์
            </button>

            {allStudents.length > 0 && (
              <button
                type="button"
                onClick={() => handleSwitchPreset('class')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition ${
                  activePreset === 'class'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 ภาพรวมระดับชั้น
              </button>
            )}
          </div>

          {/* Message Preview & Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                ตัวอย่างข้อความที่จะส่ง (สามารถแก้ไขข้อความได้ก่อนส่ง):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}
              </button>
            </div>

            <textarea
              rows={11}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full text-xs font-mono p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-[#06C755] focus:ring-1 focus:ring-[#06C755] text-slate-800 leading-relaxed"
            />
          </div>

          {/* LINE Info Callout */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>วิธีใช้งาน:</strong> กดปุ่ม <em>&quot;เปิดแอป LINE เพื่อส่งทันที&quot;</em> ระบบจะเปิดแอปพลิเคชัน LINE ให้คุณเลือกห้องแชทหรือกลุ่มผู้ปกครองที่ต้องการส่งข้อมูลได้โดยตรงทันที
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'คัดลอกเรียบร้อย' : 'คัดลอกลงคลิปบอร์ด'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              ปิดหน้าต่าง
            </button>

            <button
              onClick={handleOpenLine}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#06C755] hover:bg-[#05b34c] rounded-xl shadow-md transition transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              เปิดแอป LINE เพื่อส่งทันที
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
