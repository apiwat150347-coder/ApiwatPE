import React, { useState } from 'react';
import { Student, AttendanceRecord, AttendanceStatus, GradeLevel } from '../types/football';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Send, 
  Save, 
  Printer, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCheck,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { openLineShare } from '../services/lineShare';

interface AttendanceSheetProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (record: AttendanceRecord) => void;
  onOpenLineCustomMessage: (msg: string) => void;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  students,
  attendanceRecords,
  onSaveAttendance,
  onOpenLineCustomMessage,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('ป.3');
  const [selectedRoom, setSelectedRoom] = useState<string>('1');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [topic, setTopic] = useState<string>('ทักษะการแปบอลและการรับส่งลูกฟุตบอลข้างเท้าด้านใน');

  // Filter students by selected Grade and Room
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.room === selectedRoom
  );

  // Initialize status map
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      initial[s.id] = 'present';
    });
    return initial;
  });

  // Post-lesson reflection notes
  const [learningOutcome, setLearningOutcome] = useState(
    'นักเรียนเข้าใจและสามารถปฏิบัติการแปบอลส่งเข้าคู่ได้อย่างแม่นยำ มีทัศนคติและวินัยในการเรียนดีมาก'
  );
  const [problems, setProblems] = useState(
    'นักเรียนบางคนยังวางเท้าหลักชิดหรือห่างลูกฟุตบอลเกินไป ทำให้ทิศทางบอลเบี้ยว'
  );
  const [solutions, setSolutions] = useState(
    'จัดให้นักเรียนจับคู่ฝึกเตะบอลนิ่งก่อน แล้วจึงเพิ่มระยะส่ง พร้อมให้เพื่อนช่วยดูตำแหน่งเท้าหลัก'
  );

  // When class changes, ensure students exist in map
  const getStatus = (studentId: string): AttendanceStatus => {
    return statusMap[studentId] || 'present';
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setStatusMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setStatusMap(updated);
  };

  // Counts
  const presentCount = classStudents.filter(s => getStatus(s.id) === 'present').length;
  const lateCount = classStudents.filter(s => getStatus(s.id) === 'late').length;
  const absentCount = classStudents.filter(s => getStatus(s.id) === 'absent').length;
  const leaveCount = classStudents.filter(s => getStatus(s.id) === 'leave').length;
  const total = classStudents.length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  const handleSave = () => {
    const record: AttendanceRecord = {
      id: `att-${selectedGrade}-${selectedRoom}-${date}-${lessonNumber}`,
      date,
      lessonNumber,
      topic: topic.trim(),
      grade: selectedGrade,
      room: selectedRoom,
      attendanceMap: { ...statusMap },
      postLessonNotes: {
        learningOutcome: learningOutcome.trim(),
        passedCount: presentCount,
        failedCount: absentCount,
        problems: problems.trim(),
        solutions: solutions.trim(),
        coachSignatureDate: date,
      },
    };

    onSaveAttendance(record);
  };

  // Generate LINE message for parents & school group
  const handleSendAttendanceToLine = () => {
    const absentStudents = classStudents.filter(s => getStatus(s.id) === 'absent');
    const leaveStudents = classStudents.filter(s => getStatus(s.id) === 'leave');

    const dateFormatted = new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const lines = [
      `📋 [โรงเรียนวัดพลมานีย์ - สำนักงานเขตลาดกระบัง] ⚽`,
      `รายงานเช็คชื่อ & บันทึกหลังสอนวิชาฟุตบอล`,
      `━━━━━━━━━━━━━━━━━━`,
      `🏫 ระดับชั้น: ${selectedGrade}/${selectedRoom} | คาบที่ ${lessonNumber}`,
      `📅 วันที่: ${dateFormatted}`,
      `📖 หน่วยการเรียน: "${topic}"`,
      `━━━━━━━━━━━━━━━━━━`,
      `👥 สถิติการเข้าเรียน:`,
      `• มาเรียน: ${presentCount} คน`,
      `• สาย: ${lateCount} คน`,
      `• ลา: ${leaveCount} คน ${leaveStudents.length > 0 ? `(${leaveStudents.map(s => s.nickname).join(', ')})` : ''}`,
      `• ขาด: ${absentCount} คน ${absentStudents.length > 0 ? `(${absentStudents.map(s => s.nickname).join(', ')})` : ''}`,
      `📈 อัตราการเข้าเรียน: ${attendanceRate}%`,
      `━━━━━━━━━━━━━━━━━━`,
      `📝 บันทึกผลหลังการเรียน:`,
      `• ผลการสอน: ${learningOutcome}`,
    ];

    if (problems) {
      lines.push(`• ปัญหาที่พบ: ${problems}`);
    }
    if (solutions) {
      lines.push(`• แนวทางพัฒนาต่อ: ${solutions}`);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`ครูผู้สอนวิชาพลศึกษา โรงเรียนวัดพลมานีย์`);

    const fullMessage = lines.join('\n');
    onOpenLineCustomMessage(fullMessage);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-0.5">
              <span>โรงเรียนวัดพลมานีย์</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-normal">สำนักงานเขตลาดกระบัง</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              ระบบเช็คชื่อ &amp; บันทึกผลหลังการเรียน (ชั้น ป.3 และ ป.4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เช็คชื่อรวดเร็วข้างสนาม บันทึกผลหลังสอนตามแผน และส่งรายงานเข้า LINE ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendAttendanceToLine}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Send className="w-4 h-4" />
              ส่งรายงานคาบนี้เข้า LINE
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              บันทึกข้อมูล
            </button>
          </div>
        </div>

        {/* Grade, Room, Date, Lesson selector */}
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
            <label className="block font-bold text-slate-700 mb-1">วันที่เรียน</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">คาบเรียนที่</label>
            <input
              type="number"
              min="1"
              max="40"
              value={lessonNumber}
              onChange={e => setLessonNumber(Number(e.target.value) || 1)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs font-bold"
            />
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 text-xs">
            หัวข้อ / สาระการเรียนรู้ฟุตบอลประจำคาบ
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="เช่น ทักษะการแปบอล, การเลี้ยงบอลซิกแซกผ่านกรวย..."
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs"
          />
        </div>
      </div>

      {/* Attendance Check-in Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Attendance Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              รายชื่อเช็คชื่อนักเรียน ชั้น {selectedGrade}/{selectedRoom} ({classStudents.length} คน)
            </h3>
          </div>

          {/* Quick Mark All Present (Designed for busy PE teachers) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">ปุ่มลัด:</span>
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              มาครบทุกคน
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('late')}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition"
            >
              สายทั้งหมด
            </button>
          </div>
        </div>

        {/* Attendance Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-emerald-50/50 border-b border-emerald-100 text-xs font-semibold">
          <div className="text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            มา: <strong>{presentCount}</strong> คน
          </div>
          <div className="text-amber-800 flex items-center gap-1">
            <Clock className="w-4 h-4 text-amber-600" />
            สาย: <strong>{lateCount}</strong> คน
          </div>
          <div className="text-rose-800 flex items-center gap-1">
            <XCircle className="w-4 h-4 text-rose-600" />
            ขาด: <strong>{absentCount}</strong> คน
          </div>
          <div className="text-blue-800 flex items-center gap-1">
            <FileText className="w-4 h-4 text-blue-600" />
            ลา: <strong>{leaveCount}</strong> คน
          </div>
          <div className="text-slate-800 flex items-center gap-1 font-bold">
            อัตรามาเรียน: {attendanceRate}%
          </div>
        </div>

        {/* Student Check-in List */}
        <div className="divide-y divide-slate-100">
          {classStudents.map(student => {
            const currentStatus = getStatus(student.id);

            return (
              <div
                key={student.id}
                className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    #{student.jerseyNumber}
                  </span>
                  <img
                    src={student.avatarUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80'}
                    alt={student.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {student.fullName} ({student.nickname})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      รหัส {student.studentCode} • {student.position}
                    </span>
                  </div>
                </div>

                {/* 4 Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'present')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    มา
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'late')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    สาย
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'absent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    ขาด
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'leave')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      currentStatus === 'leave'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    ลา
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post-Lesson Reflection (บันทึกผลหลังการจัดการเรียนรู้ของครู) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              บันทึกผลหลังการจัดการเรียนรู้ (Post-Lesson Record)
            </h3>
            <p className="text-xs text-slate-500">
              สำหรับบันทึกผลสัมฤทธิ์ ปัญหา และข้อเสนอแนะแนบแผนการสอนของครู
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            คาบที่ {lessonNumber} • {selectedGrade}/{selectedRoom}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-1 space-y-2">
            <label className="block font-bold text-slate-700">
              1. ผลการจัดการเรียนรู้ / การประเมิน
            </label>
            <textarea
              rows={4}
              value={learningOutcome}
              onChange={e => setLearningOutcome(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs leading-relaxed"
              placeholder="ระบุว่านักเรียนเข้าใจหรือปฏิบัติทักษะได้ตามเกณฑ์เพียงใด..."
            />
          </div>

          <div className="md:col-span-1 space-y-2">
            <label className="block font-bold text-slate-700">
              2. ปัญหาและอุปสรรคที่พบ
            </label>
            <textarea
              rows={4}
              value={problems}
              onChange={e => setProblems(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs leading-relaxed"
              placeholder="เช่น การวางเท้าหลักไม่ถูกต้อง, บอลกระดอน, พื้นสนามเปียก..."
            />
          </div>

          <div className="md:col-span-1 space-y-2">
            <label className="block font-bold text-slate-700">
              3. ข้อเสนอแนะ / การสอนซ่อมเสริม
            </label>
            <textarea
              rows={4}
              value={solutions}
              onChange={e => setSolutions(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600 focus:bg-white text-xs leading-relaxed"
              placeholder="แนวทางแก้ไขในคาบถัดไป หรือแบบฝึกซ้อมเสริม..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            บันทึกเมื่อ: {new Date(date).toLocaleDateString('th-TH')} • ครูผู้สอนพลศึกษา
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendAttendanceToLine}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-lg text-xs font-bold transition"
            >
              <Send className="w-3.5 h-3.5" />
              ส่งเข้า LINE
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
            >
              <Save className="w-3.5 h-3.5" />
              บันทึกหลังสอน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
