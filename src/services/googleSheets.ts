import { Student, EvaluationRecord } from '../types/football';

/**
 * Generate Tab-Separated Values (TSV) suitable for direct Ctrl+V pasting into Google Sheets
 */
export function generateGoogleSheetsTSV(students: Student[]): string {
  const headers = [
    'รหัสนักเรียน',
    'ชื่อ-นามสกุล',
    'ชื่อเล่น',
    'ระดับชั้น',
    'ห้อง',
    'เบอร์เสื้อ',
    'ตำแหน่ง',
    'รอบประเมิน',
    'วันที่ประเมิน',
    'ส่งบอล (100)',
    'จับบอล (100)',
    'เลี้ยงบอล (100)',
    'ยิงประตู (100)',
    'เดาะบอล (100)',
    'คล่องตัว/ทีม (100)',
    'คะแนนเฉลี่ยรวม',
    'เกรด',
    'บันทึกของโค้ช',
  ];

  const rows: string[] = [headers.join('\t')];

  students.forEach(student => {
    if (student.evaluations.length === 0) {
      rows.push([
        student.studentCode,
        student.fullName,
        student.nickname,
        student.grade,
        student.room,
        student.jerseyNumber,
        student.position,
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
      ].join('\t'));
    } else {
      student.evaluations.forEach(ev => {
        rows.push([
          student.studentCode,
          student.fullName,
          student.nickname,
          student.grade,
          student.room,
          student.jerseyNumber,
          student.position,
          ev.sessionName,
          ev.sessionDate,
          ev.scores.passing,
          ev.scores.control,
          ev.scores.dribbling,
          ev.scores.shooting,
          ev.scores.juggling,
          ev.scores.agility_tactics,
          Math.round(ev.totalAverage * 10) / 10,
          ev.grade,
          `"${ev.coachNotes.replace(/"/g, '""')}"`,
        ].join('\t'));
      });
    }
  });

  return rows.join('\n');
}

/**
 * Generate CSV with UTF-8 BOM for Thai character compatibility in Google Sheets and Excel
 */
export function downloadGoogleSheetsCSV(students: Student[]): void {
  const headers = [
    'รหัสนักเรียน',
    'ชื่อ-นามสกุล',
    'ชื่อเล่น',
    'ระดับชั้น',
    'ห้อง',
    'เบอร์เสื้อ',
    'ตำแหน่ง',
    'รอบประเมิน',
    'วันที่ประเมิน',
    'ส่งบอล (100)',
    'จับบอล (100)',
    'เลี้ยงบอล (100)',
    'ยิงประตู (100)',
    'เดาะบอล (100)',
    'คล่องตัว/ทีม (100)',
    'คะแนนเฉลี่ยรวม',
    'เกรด',
    'จุดเด่น',
    'จุดที่ต้องพัฒนา',
    'บันทึกของโค้ช',
  ];

  const csvRows: string[] = [headers.map(h => `"${h}"`).join(',')];

  students.forEach(student => {
    student.evaluations.forEach(ev => {
      const row = [
        student.studentCode,
        student.fullName,
        student.nickname,
        student.grade,
        student.room,
        student.jerseyNumber,
        student.position,
        ev.sessionName,
        ev.sessionDate,
        ev.scores.passing,
        ev.scores.control,
        ev.scores.dribbling,
        ev.scores.shooting,
        ev.scores.juggling,
        ev.scores.agility_tactics,
        Math.round(ev.totalAverage * 10) / 10,
        ev.grade,
        ev.strengths.join('; '),
        ev.improvements.join('; '),
        ev.coachNotes,
      ];
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `football_skills_wat_phonmanee_p3_p4_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Send evaluations payload to Google Apps Script Webhook
 */
export async function syncWithGoogleSheetsWebhook(
  webhookUrl: string,
  students: Student[]
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      studentCount: students.length,
      records: students.flatMap(s => 
        s.evaluations.map(ev => ({
          studentCode: s.studentCode,
          fullName: s.fullName,
          nickname: s.nickname,
          grade: s.grade,
          room: s.room,
          jerseyNumber: s.jerseyNumber,
          position: s.position,
          sessionName: ev.sessionName,
          sessionDate: ev.sessionDate,
          passing: ev.scores.passing,
          control: ev.scores.control,
          dribbling: ev.scores.dribbling,
          shooting: ev.scores.shooting,
          juggling: ev.scores.juggling,
          agility_tactics: ev.scores.agility_tactics,
          totalAverage: ev.totalAverage,
          gradeResult: ev.grade,
          coachNotes: ev.coachNotes,
        }))
      ),
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script handles text/plain with no-cors preflight issues
      },
      body: JSON.stringify(payload),
      mode: 'no-cors', // standard Apps Script webhook pattern
    });

    return {
      success: true,
      message: 'ส่งข้อมูลไปยัง Google Sheets สำเร็จเรียบร้อยแล้ว!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อ Google Sheets Webhook ได้: ${error?.message || 'โปรดตรวจสอบ URL'}`,
    };
  }
}

/**
 * Ready-to-use Google Apps Script code snippet for the teacher's sheet
 */
export const SAMPLE_APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Check if header exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "รหัสนักเรียน", "ชื่อ-นามสกุล", "ชื่อเล่น", "ชั้น", "ห้อง", 
        "เบอร์", "ตำแหน่ง", "รอบประเมิน", "วันที่", "ส่งบอล", "จับบอล", 
        "เลี้ยงบอล", "ยิงประตู", "เดาะบอล", "ความคล่องตัว", "คะแนนเฉลี่ย", "เกรด", "หมายเหตุโค้ช"
      ]);
    }
    
    data.records.forEach(function(r) {
      sheet.appendRow([
        r.studentCode, r.fullName, r.nickname, r.grade, r.room,
        r.jerseyNumber, r.position, r.sessionName, r.sessionDate,
        r.passing, r.control, r.dribbling, r.shooting, r.juggling,
        r.agility_tactics, r.totalAverage, r.gradeResult, r.coachNotes
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;
