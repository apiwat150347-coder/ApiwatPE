import React, { useState } from 'react';
import { Student, GoogleSheetsConfig } from '../types/football';
import { 
  generateGoogleSheetsTSV, 
  downloadGoogleSheetsCSV, 
  syncWithGoogleSheetsWebhook, 
  SAMPLE_APPS_SCRIPT_CODE 
} from '../services/googleSheets';
import { X, Table, Copy, Check, Download, RefreshCw, ExternalLink, Code, Sparkles, Database } from 'lucide-react';

interface GoogleSheetsModalProps {
  students: Student[];
  config: GoogleSheetsConfig;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  students,
  config,
  onSaveConfig,
  onClose,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl);
  const [sheetName, setSheetName] = useState(config.sheetName);
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);

  const handleCopyTSV = () => {
    const tsv = generateGoogleSheetsTSV(students);
    navigator.clipboard.writeText(tsv);
    setCopiedTSV(true);
    setTimeout(() => setCopiedTSV(false), 2500);
  };

  const handleDownloadCSV = () => {
    downloadGoogleSheetsCSV(students);
  };

  const handleSaveAndSync = async () => {
    const updatedConfig: GoogleSheetsConfig = {
      webhookUrl: webhookUrl.trim(),
      sheetName: sheetName.trim(),
      autoSync,
      lastSyncTime: new Date().toLocaleString('th-TH'),
    };
    onSaveConfig(updatedConfig);

    if (!webhookUrl.trim()) {
      setSyncStatus({
        success: false,
        message: 'กรุณากรอก Webhook URL ของ Google Apps Script ก่อนเริ่มการซิงค์',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    const res = await syncWithGoogleSheetsWebhook(webhookUrl.trim(), students);
    setIsSyncing(false);
    setSyncStatus(res);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Table className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                เชื่อมต่อและส่งออกข้อมูล Google Sheets
              </h3>
              <p className="text-xs text-white/80">
                ซิงค์คะแนนประเมินและรายชื่อนักเรียนไปยังสเปรดชีตของคุณแบบเรียลไทม์
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
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick 1-Click Paste into Google Sheets */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  วิธีที่ 1: คัดลอกตารางไปวางลง Google Sheets โดยตรง (เร็วที่สุด)
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  กดปุ่มด้านล่าง จากนั้นเปิด Google Sheets แล้วกด <code>Ctrl + V</code> (หรือ <code>Cmd + V</code>) ข้อมูลจะลงตารางทันที
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyTSV}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                {copiedTSV ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedTSV ? 'คัดลอกตารางแล้ว! ไปกด Ctrl+V ในชีตได้เลย' : 'คัดลอกตารางคะแนนทั้งหมด (Copy Table)'}
              </button>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                ดาวน์โหลดไฟล์ CSV (สำหรับ Google Sheets)
              </button>
            </div>
          </div>

          {/* Webhook Cloud Sync */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div>
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-teal-600" />
                วิธีที่ 2: ซิงค์อัตโนมัติผ่าน Google Apps Script Web App
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                เชื่อมต่อชีตของคุณด้วย Web App URL เพื่อให้ระบบส่งคะแนนเข้าชีตได้ทันทีทุกครั้งที่บันทึก
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-emerald-600"
                />
              </div>

              {config.lastSyncTime && (
                <div className="text-[11px] text-slate-500">
                  ซิงค์ล่าสุดเมื่อ: <span className="font-semibold text-slate-700">{config.lastSyncTime}</span>
                </div>
              )}

              {syncStatus && (
                <div
                  className={`p-3 rounded-lg text-xs ${
                    syncStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {syncStatus.message}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleSaveAndSync}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'บันทึกและซิงค์ข้อมูลเข้า Google Sheets'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowScriptCode(!showScriptCode)}
                  className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 px-3 py-2"
                >
                  <Code className="w-3.5 h-3.5" />
                  {showScriptCode ? 'ซ่อนโค้ด Apps Script' : 'ดูโค้ด Apps Script ฟรี'}
                </button>
              </div>

              {/* Code snippet drawer */}
              {showScriptCode && (
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2 mt-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-[11px] text-teal-400">Code.gs (วางใน Extensions &gt; Apps Script ใน Google Sheets)</span>
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedScript ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}
                    </button>
                  </div>
                  <pre className="font-mono text-[10.5px] overflow-x-auto p-2 bg-black/40 rounded leading-relaxed text-slate-300 max-h-48">
                    {SAMPLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
