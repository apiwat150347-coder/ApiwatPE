import React from 'react';
import { 
  Users, 
  BarChart3, 
  Bell, 
  Table, 
  RotateCcw, 
  CalendarCheck,
  ClipboardList,
  Share2
} from 'lucide-react';
import { TriggeredAlert } from '../types/football';

export type AppTab = 'attendance' | 'students' | 'gradebook' | 'analytics';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenRulesModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenLineModal: () => void;
  onResetData: () => void;
  alerts: TriggeredAlert[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenRulesModal,
  onOpenSheetsModal,
  onOpenLineModal,
  onResetData,
  alerts,
}) => {
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl shadow-lg ring-2 ring-emerald-400/30 shrink-0">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white tracking-tight">
                  โรงเรียนวัดพลมานีย์
                </span>
                <span className="inline-block text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  ป.3 และ ป.4
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-none">
                สำนักงานเขตลาดกระบัง • ทักษะฟุตบอลและเช็คชื่อ
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => onSelectTab('attendance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentTab === 'attendance'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              เช็คชื่อ &amp; บันทึกหลังสอน
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('students')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentTab === 'students'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              นักเรียน &amp; กราฟพัฒนาการ
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('gradebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentTab === 'gradebook'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              ตารางกรอกคะแนนเทอม
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              วิเคราะห์ภาพรวม
            </button>
          </nav>

          {/* Quick Integration & Tool Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Instant LINE Share Button */}
            <button
              type="button"
              onClick={onOpenLineModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition shadow-xs"
              title="ส่งรายงานเข้า LINE กลุ่ม"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ส่งเข้า LINE</span>
            </button>

            {/* Google Sheets Sync Button */}
            <button
              type="button"
              onClick={onOpenSheetsModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition"
              title="เชื่อมต่อและส่งออก Google Sheets"
            >
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Google Sheets</span>
            </button>

            {/* Automated Alert Rules & Bell */}
            <button
              type="button"
              onClick={onOpenRulesModal}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition"
              title="ตั้งค่าเงื่อนไขแจ้งเตือนอัตโนมัติ"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Reset Data */}
            <button
              type="button"
              onClick={onResetData}
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition"
              title="รีเซ็ตเป็นข้อมูลตัวอย่างตั้งต้น"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Row */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-800 text-[11px] font-semibold overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => onSelectTab('attendance')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap ${
              currentTab === 'attendance' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            เช็คชื่อ &amp; หลังสอน
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('students')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap ${
              currentTab === 'students' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            นักเรียน &amp; กราฟ
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('gradebook')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap ${
              currentTab === 'gradebook' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            กรอกคะแนนเทอม
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg whitespace-nowrap ${
              currentTab === 'analytics' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            วิเคราะห์
          </button>
        </div>
      </div>
    </header>
  );
};
