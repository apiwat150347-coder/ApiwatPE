import React, { useState } from 'react';
import { ThresholdRule, TriggeredAlert, Student, AlertConditionType } from '../types/football';
import { FOOTBALL_SKILLS } from '../data/skillsConfig';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Bell, 
  Sparkles, 
  Send, 
  Settings, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThresholdRulesModalProps {
  rules: ThresholdRule[];
  alerts: TriggeredAlert[];
  students: Student[];
  onSaveRules: (newRules: ThresholdRule[]) => void;
  onOpenLineAlert: (alert: TriggeredAlert) => void;
  onClose: () => void;
}

export const ThresholdRulesModal: React.FC<ThresholdRulesModalProps> = ({
  rules,
  alerts,
  students,
  onSaveRules,
  onOpenLineAlert,
  onClose,
}) => {
  const [currentRules, setCurrentRules] = useState<ThresholdRule[]>(rules);
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');
  const [isAddingRule, setIsAddingRule] = useState(false);

  // New rule form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<AlertConditionType>('overall_score_gte');
  const [newSkill, setNewSkill] = useState<string>('passing');
  const [newValue, setNewValue] = useState<number>(80);
  const [newBadge, setNewBadge] = useState<string>('🏆 เกณฑ์ระดับยอดเยี่ยม');
  const [newTemplate, setNewTemplate] = useState<string>(
    '🎉 ยินดีด้วยครับ! น้อง {nickname} สอบผ่านเกณฑ์ {skill} ได้คะแนน {score}% ประจำรุ่น!'
  );

  const handleToggleRule = (ruleId: string) => {
    const updated = currentRules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r);
    setCurrentRules(updated);
    onSaveRules(updated);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = currentRules.filter(r => r.id !== ruleId);
    setCurrentRules(updated);
    onSaveRules(updated);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: ThresholdRule = {
      id: `rule-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || `เกณฑ์คะแนน ${newValue}`,
      conditionType: newType,
      targetSkill: (newType === 'skill_score_gte' || newType === 'skill_score_lte') ? (newSkill as any) : undefined,
      thresholdValue: Number(newValue),
      badgeLabel: newBadge.trim(),
      alertMessageTemplate: newTemplate.trim(),
      lineNotifyEnabled: true,
      active: true,
    };

    const updated = [...currentRules, newRule];
    setCurrentRules(updated);
    onSaveRules(updated);
    setIsAddingRule(false);

    // reset
    setNewName('');
    setNewDesc('');
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                ระบบเงื่อนไขการแจ้งเตือนอัตโนมัติ (Automated Threshold Alerts)
              </h3>
              <p className="text-xs text-white/80">
                ตรวจจับเมื่อนักเรียนทำคะแนนถึงเกณฑ์ หรือต้องการการสนับสนุน พร้อมส่งเข้า LINE ได้ทันที
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

        {/* Tab Switcher */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex items-center justify-between text-sm font-semibold">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`py-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'alerts'
                  ? 'border-orange-600 text-orange-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              การแจ้งเตือนที่เกิดขึ้น ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`py-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'settings'
                  ? 'border-orange-600 text-orange-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              ตั้งค่าเงื่อนไขเกณฑ์ ({currentRules.length})
            </button>
          </div>

          <button
            type="button"
            onClick={triggerCelebration}
            className="text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition"
            title="ทดสอบเอฟเฟกต์แสดงความยินดี"
          >
            <Sparkles className="w-3.5 h-3.5" />
            จุดพลุฉลอง
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {activeTab === 'alerts' ? (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  ยังไม่มีการแจ้งเตือนเกณฑ์ในขณะนี้
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      alert.severity === 'warning'
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-xs border text-slate-800">
                          {alert.badgeLabel}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {alert.grade} • {alert.sessionName}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenLineAlert(alert)}
                      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl transition shadow-xs self-end sm:self-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                      ส่งแจ้งเตือนเข้า LINE
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Settings Tab */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">รายการเงื่อนไขเกณฑ์คะแนน</h4>
                  <p className="text-xs text-slate-500">เปิด-ปิดการใช้งาน หรือเพิ่มเกณฑ์ใหม่ตามต้องการ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingRule(!isAddingRule)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingRule ? 'ปิดฟอร์ม' : 'สร้างเงื่อนไขใหม่'}
                </button>
              </div>

              {/* Add Rule Form */}
              {isAddingRule && (
                <form onSubmit={handleCreateRule} className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3 animate-in fade-in">
                  <h5 className="font-bold text-xs text-slate-800">กำหนดเงื่อนไขใหม่</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ชื่อเงื่อนไข</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="เช่น ผ่านเกณฑ์ทักษะส่งบอลยอดเยี่ยม"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ประเภทเงื่อนไข</label>
                      <select
                        value={newType}
                        onChange={e => setNewType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="overall_score_gte">คะแนนรวมเฉลี่ย &gt;= เกณฑ์</option>
                        <option value="overall_score_lte">คะแนนรวมเฉลี่ย &lt; เกณฑ์ (เตือนฝึกเสริม)</option>
                        <option value="skill_score_gte">ทักษะเฉพาะด้าน &gt;= เกณฑ์</option>
                        <option value="skill_score_lte">ทักษะเฉพาะด้าน &lt; เกณฑ์</option>
                        <option value="improvement_gte">พัฒนาการเพิ่มขึ้น &gt;= +X%</option>
                      </select>
                    </div>

                    {(newType === 'skill_score_gte' || newType === 'skill_score_lte') && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">ทักษะเป้าหมาย</label>
                        <select
                          value={newSkill}
                          onChange={e => setNewSkill(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        >
                          {FOOTBALL_SKILLS.map(s => (
                            <option key={s.key} value={s.key}>{s.nameTh}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ค่าเกณฑ์คะแนน (ตัวเลข)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={newValue}
                        onChange={e => setNewValue(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ป้ายกำกับรางวัล / สัญลักษณ์</label>
                      <input
                        type="text"
                        required
                        value={newBadge}
                        onChange={e => setNewBadge(e.target.value)}
                        placeholder="เช่น 🏆 ผ่านเกณฑ์มาตรฐาน"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      เทมเพลตข้อความแจ้งเตือน (รองรับ {'{nickname}'}, {'{score}'}, {'{skill}'}, {'{diff}'})
                    </label>
                    <input
                      type="text"
                      required
                      value={newTemplate}
                      onChange={e => setNewTemplate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingRule(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-slate-200 rounded-lg"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg"
                    >
                      บันทึกเงื่อนไข
                    </button>
                  </div>
                </form>
              )}

              {/* Rules List */}
              <div className="space-y-3">
                {currentRules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-3.5 rounded-xl border transition ${
                      rule.active ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                          {rule.badgeLabel}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900">{rule.name}</h5>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleRule(rule.id)}
                          className="text-xs font-semibold flex items-center gap-1 text-slate-600 hover:text-slate-900"
                        >
                          {rule.active ? (
                            <ToggleRight className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                          <span>{rule.active ? 'เปิดใช้งาน' : 'ปิด'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="ลบเงื่อนไข"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {rule.description} • เกณฑ์: {rule.thresholdValue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
