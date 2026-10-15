/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Student, 
  EvaluationRecord, 
  ThresholdRule, 
  TriggeredAlert, 
  GoogleSheetsConfig,
  AttendanceRecord 
} from './types/football';
import { 
  loadStudents, 
  saveStudents, 
  loadThresholdRules, 
  saveThresholdRules, 
  loadAlerts, 
  saveAlerts, 
  loadSheetsConfig, 
  saveSheetsConfig,
  loadAttendanceRecords,
  saveAttendanceRecords,
  resetToDefaultData 
} from './services/storage';
import { evaluateThresholdRules, evaluateAllStudents } from './services/rulesEngine';
import { syncWithGoogleSheetsWebhook } from './services/googleSheets';
import { Navbar, AppTab } from './components/Navbar';
import { StudentList } from './components/StudentList';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ScoreEntryModal } from './components/ScoreEntryModal';
import { LineShareModal } from './components/LineShareModal';
import { ThresholdRulesModal } from './components/ThresholdRulesModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { PrintReportCard } from './components/PrintReportCard';
import { ClassAnalytics } from './components/ClassAnalytics';
import { AttendanceSheet } from './components/AttendanceSheet';
import { QuickGradebook } from './components/QuickGradebook';
import confetti from 'canvas-confetti';
import { Sparkles, CalendarCheck, ClipboardList, Users, BarChart3 } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rules, setRules] = useState<ThresholdRule[]>([]);
  const [alerts, setAlerts] = useState<TriggeredAlert[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    webhookUrl: '',
    sheetName: 'ประเมินทักษะฟุตบอล ป.3-ป.4',
    autoSync: false,
  });

  // Current active tab - defaults to Attendance for everyday teacher convenience
  const [currentTab, setCurrentTab] = useState<AppTab>('attendance');

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scoreEntryTarget, setScoreEntryTarget] = useState<{ student: Student; evaluation?: EvaluationRecord } | null>(null);
  const [lineShareTarget, setLineShareTarget] = useState<{
    student?: Student;
    evaluation?: EvaluationRecord;
    previousEvaluation?: EvaluationRecord;
    alert?: TriggeredAlert;
    allStudents?: Student[];
    customMessage?: string;
  } | null>(null);
  const [printReportTarget, setPrintReportTarget] = useState<{ student: Student; evaluation: EvaluationRecord } | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Initial Data
  useEffect(() => {
    const loadedStudents = loadStudents();
    const loadedRules = loadThresholdRules();
    const loadedAlerts = loadAlerts();
    const loadedConfig = loadSheetsConfig();
    const loadedAttendance = loadAttendanceRecords();

    setStudents(loadedStudents);
    setRules(loadedRules);
    setAlerts(loadedAlerts);
    setSheetsConfig(loadedConfig);
    setAttendanceRecords(loadedAttendance);
  }, []);

  // Handler: Save Attendance & Post-Lesson Record
  const handleSaveAttendance = (record: AttendanceRecord) => {
    const existingIndex = attendanceRecords.findIndex(r => r.id === record.id);
    let updated: AttendanceRecord[] = [];

    if (existingIndex >= 0) {
      updated = [...attendanceRecords];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...attendanceRecords];
    }

    setAttendanceRecords(updated);
    saveAttendanceRecords(updated);
    showToast(`บันทึกการเช็คชื่อและบันทึกหลังสอน คาบที่ ${record.lessonNumber} (${record.grade}/${record.room}) เรียบร้อยแล้ว`);
  };

  // Handler: Save All Student Scores from Quick Gradebook
  const handleSaveAllScores = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    saveStudents(updatedStudents);

    // Re-evaluate rules
    const newAlerts = evaluateAllStudents(updatedStudents, rules);
    setAlerts(newAlerts);
    saveAlerts(newAlerts);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast('บันทึกคะแนนยกห้องเรียบร้อยแล้ว กราฟและระดับผลการเรียนอัปเดตทันที');

    if (sheetsConfig.autoSync && sheetsConfig.webhookUrl) {
      syncWithGoogleSheetsWebhook(sheetsConfig.webhookUrl, updatedStudents);
    }
  };

  // Handler: Save/Update Individual Evaluation
  const handleSaveEvaluation = (savedEval: EvaluationRecord) => {
    if (!scoreEntryTarget) return;
    const targetStudent = scoreEntryTarget.student;

    const existingIndex = targetStudent.evaluations.findIndex(e => e.id === savedEval.id);
    let updatedEvals: EvaluationRecord[] = [];

    if (existingIndex >= 0) {
      updatedEvals = [...targetStudent.evaluations];
      updatedEvals[existingIndex] = savedEval;
    } else {
      updatedEvals = [...targetStudent.evaluations, savedEval];
    }

    const updatedStudent: Student = {
      ...targetStudent,
      evaluations: updatedEvals,
    };

    const updatedStudentsList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updatedStudentsList);
    saveStudents(updatedStudentsList);

    if (selectedStudent && selectedStudent.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }

    // Evaluate Threshold Rules & Milestones
    const prevEval = updatedEvals.length > 1 ? updatedEvals[updatedEvals.length - 2] : undefined;
    const newTriggeredAlerts = evaluateThresholdRules(updatedStudent, savedEval, prevEval, rules);

    if (newTriggeredAlerts.length > 0) {
      const mergedAlerts = [...newTriggeredAlerts, ...alerts];
      setAlerts(mergedAlerts);
      saveAlerts(mergedAlerts);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      showToast(`🎉 น้อง${updatedStudent.nickname} ปลดล็อคเกณฑ์: ${newTriggeredAlerts[0].badgeLabel}!`);
    } else {
      showToast(`บันทึกผลการประเมินน้อง${updatedStudent.nickname} เรียบร้อยแล้ว`);
    }

    if (sheetsConfig.autoSync && sheetsConfig.webhookUrl) {
      syncWithGoogleSheetsWebhook(sheetsConfig.webhookUrl, updatedStudentsList);
    }

    setScoreEntryTarget(null);
  };

  // Handler: Add New Student
  const handleAddStudent = (newStudent: Student) => {
    const updated = [newStudent, ...students];
    setStudents(updated);
    saveStudents(updated);
    showToast(`เพิ่มนักเรียน "${newStudent.fullName}" (${newStudent.grade}/${newStudent.room}) เข้าระบบสำเร็จ`);
  };

  // Handler: Save Rules
  const handleSaveRules = (newRules: ThresholdRule[]) => {
    setRules(newRules);
    saveThresholdRules(newRules);
    showToast('บันทึกการตั้งค่าเกณฑ์การแจ้งเตือนเรียบร้อยแล้ว');
  };

  // Handler: Save Sheets Config
  const handleSaveSheetsConfig = (newConfig: GoogleSheetsConfig) => {
    setSheetsConfig(newConfig);
    saveSheetsConfig(newConfig);
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลเป็นชุดตัวอย่างตั้งต้น (ป.3 และ ป.4) ใช่หรือไม่?')) {
      const def = resetToDefaultData();
      setStudents(def.students);
      setRules(def.rules);
      setAlerts(def.alerts);
      setAttendanceRecords(def.attendance);
      setSelectedStudent(null);
      showToast('รีเซ็ตข้อมูลตัวอย่าง ป.3 และ ป.4 เรียบร้อยแล้ว');
    }
  };

  const p3Count = students.filter(s => s.grade === 'ป.3').length;
  const p4Count = students.filter(s => s.grade === 'ป.4').length;

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans antialiased flex flex-col selection:bg-emerald-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 border border-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenLineModal={() => setLineShareTarget({ allStudents: students })}
        onResetData={handleResetData}
        alerts={alerts}
      />

      {/* School Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white py-5 px-4 sm:px-6 lg:px-8 border-b border-emerald-950/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              โรงเรียนวัดพลมานีย์ สำนักงานเขตลาดกระบัง กรุงเทพมหานคร
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              ระบบบันทึกและวิเคราะห์ผลการเรียนทักษะฟุตบอล (ป.3 และ ป.4)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา: เครื่องมือช่วยครูเช็คชื่อเข้าเรียน กรอกคะแนนในเทอม บันทึกผลหลังสอน วิเคราะห์กราฟพัฒนาการ และส่งรายงานเข้าไลน์กลุ่มทันที
            </p>
          </div>

          {/* Quick Metrics for P.3 and P.4 */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-3 border-r border-white/15">
              <span className="text-[10px] text-emerald-300 block font-medium">นักเรียน ป.3</span>
              <span className="text-xl font-black text-white">{p3Count}</span>
              <span className="text-[10px] text-slate-300"> คน</span>
            </div>
            <div className="text-center px-3 border-r border-white/15">
              <span className="text-[10px] text-emerald-300 block font-medium">นักเรียน ป.4</span>
              <span className="text-xl font-black text-white">{p4Count}</span>
              <span className="text-[10px] text-slate-300"> คน</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-emerald-300 block font-medium">บันทึกคาบเรียน</span>
              <span className="text-xl font-black text-emerald-400">{attendanceRecords.length}</span>
              <span className="text-[10px] text-slate-300"> แผน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content View Switcher */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {currentTab === 'attendance' && (
          <AttendanceSheet
            students={students}
            attendanceRecords={attendanceRecords}
            onSaveAttendance={handleSaveAttendance}
            onOpenLineCustomMessage={msg => setLineShareTarget({ customMessage: msg, allStudents: students })}
          />
        )}

        {currentTab === 'gradebook' && (
          <QuickGradebook
            students={students}
            onSaveAllStudentScores={handleSaveAllScores}
            onOpenLineCustomMessage={msg => setLineShareTarget({ customMessage: msg, allStudents: students })}
          />
        )}

        {currentTab === 'students' && (
          <StudentList
            students={students}
            onSelectStudent={stu => setSelectedStudent(stu)}
            onOpenScoreEntry={stu => setScoreEntryTarget({ student: stu })}
            onOpenLineShare={(stu, ev) => setLineShareTarget({ student: stu, evaluation: ev })}
            onOpenPrintReport={(stu, ev) => setPrintReportTarget({ student: stu, evaluation: ev })}
            onAddStudent={handleAddStudent}
          />
        )}

        {currentTab === 'analytics' && (
          <ClassAnalytics
            students={students}
            onOpenLineSummary={grade => setLineShareTarget({ allStudents: students })}
            onSelectStudent={stu => setSelectedStudent(stu)}
          />
        )}
      </main>

      {/* Student Detail Modal (Radar & Growth) */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          rules={rules}
          onClose={() => setSelectedStudent(null)}
          onOpenScoreEntry={(stu, ev) => setScoreEntryTarget({ student: stu, evaluation: ev })}
          onOpenLineShare={(stu, ev) => setLineShareTarget({ student: stu, evaluation: ev })}
          onOpenPrintReport={(stu, ev) => setPrintReportTarget({ student: stu, evaluation: ev })}
        />
      )}

      {/* Score Entry / Rubric Modal */}
      {scoreEntryTarget && (
        <ScoreEntryModal
          student={scoreEntryTarget.student}
          initialEvaluation={scoreEntryTarget.evaluation}
          onClose={() => setScoreEntryTarget(null)}
          onSave={handleSaveEvaluation}
        />
      )}

      {/* LINE Share Modal */}
      {lineShareTarget && (
        <LineShareModal
          student={lineShareTarget.student}
          evaluation={lineShareTarget.evaluation}
          previousEvaluation={lineShareTarget.previousEvaluation}
          alert={lineShareTarget.alert}
          allStudents={lineShareTarget.allStudents || students}
          customMessage={lineShareTarget.customMessage}
          onClose={() => setLineShareTarget(null)}
        />
      )}

      {/* Threshold Rules Modal */}
      {isRulesModalOpen && (
        <ThresholdRulesModal
          rules={rules}
          alerts={alerts}
          students={students}
          onSaveRules={handleSaveRules}
          onOpenLineAlert={alert => {
            setIsRulesModalOpen(false);
            setLineShareTarget({ alert });
          }}
          onClose={() => setIsRulesModalOpen(false)}
        />
      )}

      {/* Google Sheets Modal */}
      {isSheetsModalOpen && (
        <GoogleSheetsModal
          students={students}
          config={sheetsConfig}
          onSaveConfig={handleSaveSheetsConfig}
          onClose={() => setIsSheetsModalOpen(false)}
        />
      )}

      {/* Printable Report Card (A4 PDF) */}
      {printReportTarget && (
        <PrintReportCard
          student={printReportTarget.student}
          evaluation={printReportTarget.evaluation}
          onClose={() => setPrintReportTarget(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-slate-800 text-sm">
            โรงเรียนวัดพลมานีย์ สำนักงานเขตลาดกระบัง กรุงเทพมหานคร
          </p>
          <p className="text-slate-600 font-medium mt-0.5">
            กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา • ระบบบันทึกและวิเคราะห์ผลการเรียนทักษะฟุตบอล (ป.3 และ ป.4)
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            เช็คชื่อข้างสนาม • ตารางกรอกคะแนนยกห้อง • บันทึกผลหลังสอน • ส่ง LINE กลุ่ม • ส่งออก PDF • เชื่อมต่อ Google Sheets
          </p>
        </div>
      </footer>
    </div>
  );
}
