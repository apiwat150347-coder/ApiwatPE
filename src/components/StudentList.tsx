import React, { useState } from 'react';
import { Student, EvaluationRecord, GradeLevel, PlayerPosition } from '../types/football';
import { getGradeBadge } from '../data/skillsConfig';
import { 
  Search, 
  Filter, 
  Plus, 
  UserPlus, 
  Send, 
  Printer, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  LayoutGrid, 
  List,
  Sparkles
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onOpenScoreEntry: (student: Student) => void;
  onOpenLineShare: (student: Student, evaluation: EvaluationRecord) => void;
  onOpenPrintReport: (student: Student, evaluation: EvaluationRecord) => void;
  onAddStudent: (newStudent: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudent,
  onOpenScoreEntry,
  onOpenLineShare,
  onOpenPrintReport,
  onAddStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // New Student State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('ป.4');
  const [newRoom, setNewRoom] = useState('1');
  const [newJersey, setNewJersey] = useState<number>(10);
  const [newPosition, setNewPosition] = useState<PlayerPosition>('กองกลาง (MF)');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  // Filter logic
  const filtered = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
    const matchesPosition = selectedPosition === 'all' || student.position.includes(selectedPosition);

    return matchesSearch && matchesGrade && matchesPosition;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Student = {
      id: `stu-${Date.now()}`,
      studentCode: newCode.trim() || `P${newGrade.replace('ป.', '')}-${Math.floor(100 + Math.random() * 900)}`,
      fullName: newName.trim(),
      nickname: newNickname.trim(),
      grade: newGrade,
      room: newRoom.trim() || '1',
      jerseyNumber: Number(newJersey) || 1,
      position: newPosition,
      parentName: newParentName.trim() || undefined,
      parentPhone: newParentPhone.trim() || undefined,
      avatarUrl: `https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80`,
      evaluations: [],
    };

    onAddStudent(created);
    setIsAddingStudent(false);
    // Reset
    setNewName('');
    setNewNickname('');
    setNewCode('');
  };

  return (
    <div className="space-y-6">
      
      {/* Search, Filter, and View Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อนักเรียน, ชื่อเล่น, หรือรหัสประจำตัว..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Actions & View switch */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="มุมมองตาราง"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingStudent(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              เพิ่มนักเรียนใหม่
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">ระดับชั้น:</span>
            {(['all', 'ป.3', 'ป.4'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  selectedGrade === g
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g === 'all' ? 'ป.3 และ ป.4 ทั้งหมด' : `ชั้น ${g}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-400 font-medium">ตำแหน่ง:</span>
            <select
              value={selectedPosition}
              onChange={e => setSelectedPosition(e.target.value)}
              className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-xs font-medium focus:outline-emerald-600"
            >
              <option value="all">ทุกตำแหน่ง</option>
              <option value="กองหน้า">กองหน้า (FW)</option>
              <option value="กองกลาง">กองกลาง (MF)</option>
              <option value="กองหลัง">กองหลัง (DF)</option>
              <option value="ผู้รักษาประตู">ผู้รักษาประตู (GK)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              ลงทะเบียนนักเรียนใหม่ (ฟุตบอลระดับประถมศึกษา)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              กรอกข้อมูลเบื้องต้นของนักเรียนเพื่อเริ่มจัดทำประวัติการประเมินทักษะ
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล (ด.ช./ด.ญ.)</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="ด.ช. สมเกียรติ ยิ้มหวาน"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อเล่น</label>
                  <input
                    type="text"
                    required
                    value={newNickname}
                    onChange={e => setNewNickname(e.target.value)}
                    placeholder="น้องบอล"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ระดับชั้น</label>
                  <select
                    value={newGrade}
                    onChange={e => setNewGrade(e.target.value as GradeLevel)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="ป.3">ป.3</option>
                    <option value="ป.4">ป.4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ห้องเรียน</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    placeholder="1"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์เสื้อ</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newJersey}
                    onChange={e => setNewJersey(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งที่ถนัด</label>
                  <select
                    value={newPosition}
                    onChange={e => setNewPosition(e.target.value as PlayerPosition)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="กองหน้า (FW)">กองหน้า (FW)</option>
                    <option value="กองกลาง (MF)">กองกลาง (MF)</option>
                    <option value="กองหลัง (DF)">กองหลัง (DF)</option>
                    <option value="ผู้รักษาประตู (GK)">ผู้รักษาประตู (GK)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสนักเรียน (ถ้ามี)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    placeholder="เช่น P4-007"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ปกครอง</label>
                  <input
                    type="text"
                    value={newParentName}
                    onChange={e => setNewParentName(e.target.value)}
                    placeholder="คุณพ่อ / คุณแม่"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรผู้ปกครอง</label>
                  <input
                    type="text"
                    value={newParentPhone}
                    onChange={e => setNewParentPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold"
                >
                  บันทึกนักเรียนใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid or Table Display */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-medium">ไม่พบรายชื่อนักเรียนที่ตรงกับเงื่อนไขการค้นหา</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedGrade('all'); setSelectedPosition('all'); }}
            className="mt-2 text-xs text-emerald-600 hover:underline font-bold"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(student => {
            const evals = student.evaluations;
            const latestEval = evals.length > 0 ? evals[evals.length - 1] : null;
            const b = latestEval ? getGradeBadge(latestEval.grade) : null;

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Card Header & Avatar */}
                <div className="p-4 sm:p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student.avatarUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80'}
                          alt={student.fullName}
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-md shadow-xs">
                          #{student.jerseyNumber}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {student.grade}/{student.room}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {student.position.split('(')[0]}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 mt-1 flex items-center gap-1 group-hover:text-emerald-700 transition">
                          {student.fullName}
                        </h3>
                        <span className="text-xs text-slate-500">
                          น้อง{student.nickname}
                        </span>
                      </div>
                    </div>

                    {/* Latest Score Badge */}
                    {latestEval && b ? (
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.bg} ${b.color}`}>
                          เกรด {latestEval.grade}
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-0.5">
                          {Math.round(latestEval.totalAverage)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        รอการประเมิน
                      </span>
                    )}
                  </div>

                  {/* Skills Snapshot if evaluated */}
                  {latestEval ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1.5 mt-3">
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>รอบล่าสุด: {latestEval.sessionName.split('(')[0]}</span>
                        <span className="font-semibold text-emerald-700">ประเมินแล้ว {evals.length} ครั้ง</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1">
                        <div className="bg-white p-1 rounded border border-slate-100">
                          <span className="text-slate-400 block truncate">ส่งบอล</span>
                          <span className="font-bold text-slate-800">{latestEval.scores.passing}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-100">
                          <span className="text-slate-400 block truncate">เลี้ยงบอล</span>
                          <span className="font-bold text-slate-800">{latestEval.scores.dribbling}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-100">
                          <span className="text-slate-400 block truncate">ยิงประตู</span>
                          <span className="font-bold text-slate-800">{latestEval.scores.shooting}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-xs text-slate-400 mt-3">
                      ยังไม่มีข้อมูลการประเมินทักษะ
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(student)}
                    className="flex-1 py-1.5 px-2 font-bold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/50 rounded-lg text-center transition flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    กราฟพัฒนาการ
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenScoreEntry(student)}
                    className="py-1.5 px-2 font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition"
                    title="บันทึกคะแนนรอบใหม่"
                  >
                    + บันทึก
                  </button>

                  {latestEval && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenLineShare(student, latestEval)}
                        className="py-1.5 px-2 font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] rounded-lg transition flex items-center gap-1 shadow-xs"
                        title="ส่งรายงานเข้า LINE ทันที"
                      >
                        <Send className="w-3 h-3" />
                        LINE
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenPrintReport(student, latestEval)}
                        className="py-1.5 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                        title="ส่งออก PDF / พิมพ์"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">นักเรียน</th>
                  <th className="py-3 px-3">ระดับชั้น</th>
                  <th className="py-3 px-3">ตำแหน่ง</th>
                  <th className="py-3 px-3 text-center">รอบประเมิน</th>
                  <th className="py-3 px-3 text-right">คะแนนรวม</th>
                  <th className="py-3 px-3 text-center">เกรด</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(student => {
                  const evals = student.evaluations;
                  const latestEval = evals.length > 0 ? evals[evals.length - 1] : null;
                  const b = latestEval ? getGradeBadge(latestEval.grade) : null;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => onSelectStudent(student)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <img
                            src={student.avatarUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80'}
                            alt={student.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block hover:text-emerald-700">
                              {student.fullName} ({student.nickname})
                            </span>
                            <span className="text-[11px] text-slate-400">
                              #{student.jerseyNumber} • รหัส {student.studentCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {student.grade}/{student.room}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {student.position}
                      </td>

                      <td className="py-3 px-3 text-center text-slate-500 text-[11px]">
                        {latestEval ? `${evals.length} ครั้ง` : '0 ครั้ง'}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                        {latestEval ? `${Math.round(latestEval.totalAverage)}%` : '-'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {latestEval && b ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${b.bg} ${b.color}`}>
                            {latestEval.grade}
                          </span>
                        ) : '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectStudent(student)}
                            className="px-2.5 py-1 text-xs text-emerald-800 hover:bg-emerald-50 rounded-md font-bold"
                          >
                            กราฟ
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenScoreEntry(student)}
                            className="px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded-md font-semibold"
                          >
                            บันทึก
                          </button>
                          {latestEval && (
                            <button
                              type="button"
                              onClick={() => onOpenLineShare(student, latestEval)}
                              className="px-2.5 py-1 text-xs text-white bg-[#06C755] hover:bg-[#05b34c] rounded-md font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Send className="w-3 h-3" />
                              LINE
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
