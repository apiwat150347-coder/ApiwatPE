export type GradeLevel = 'ป.3' | 'ป.4';

export type PlayerPosition = 'กองหน้า (FW)' | 'กองกลาง (MF)' | 'กองหลัง (DF)' | 'ผู้รักษาประตู (GK)';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: string;
  date: string;          // YYYY-MM-DD
  lessonNumber: number;  // แผนการสอนที่ / คาบที่
  topic: string;         // สาระการเรียนรู้ เช่น "ทักษะการแปบอลและการส่งบอลเรียด"
  grade: GradeLevel;
  room: string;          // 1 หรือ 2
  attendanceMap: Record<string, AttendanceStatus>; // studentId -> status
  // บันทึกผลหลังการจัดการเรียนรู้ (Post-Lesson Record)
  postLessonNotes: {
    learningOutcome: string;  // ผลการจัดการเรียนรู้ (เช่น นักเรียนเข้าใจและปฏิบัติทักษะได้ถูกต้อง)
    passedCount: number;      // จำนวนที่ผ่านเกณฑ์
    failedCount: number;      // จำนวนที่ไม่ผ่านเกณฑ์
    problems: string;         // ปัญหาและอุปสรรค
    solutions: string;        // แนวทางแก้ไข / การจัดสอนซ่อมเสริม
    coachSignatureDate: string;
  };
}

export interface SkillScores {
  passing: number;        // การส่งบอลและแปบอล (0-100)
  control: number;        // การจับบอลและคอนโทรลบอลแรก (0-100)
  dribbling: number;      // การเลี้ยงบอลซิกแซกและความคล่องตัว (0-100)
  shooting: number;       // การยิงประตูและการวางเท้า (0-100)
  juggling: number;       // การเดาะบอลและความคุ้นเคยกับลูกฟุตบอล (0-100)
  agility_tactics: number;// ความคล่องแคล่ว ทัศนคติ และทีมเวิร์ก (0-100)
}

export interface EvaluationRecord {
  id: string;
  studentId: string;
  sessionName: string;   // e.g. "ประเมินระหว่างเรียน (Mid-Term)", "ประเมินปลายเทอม (Final)"
  sessionDate: string;   // YYYY-MM-DD
  scores: SkillScores;
  behaviorScore?: number; // คะแนนจิตพิสัย/การมีน้ำใจนักกีฬา (0-100)
  totalAverage: number;  // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  coachNotes: string;    // บันทึกหลังการเรียนของครู
  strengths: string[];   // จุดเด่น
  improvements: string[];// สิ่งที่ควรพัฒนา
  recommendedDrills: string[]; // แบบฝึกซ้อมที่แนะนำ
}

export interface Student {
  id: string;
  studentCode: string;   // รหัสนักเรียน เช่น P3-001
  fullName: string;      // ชื่อ-นามสกุล เช่น ด.ช. ภัทรพล เจริญวิทย์
  nickname: string;      // ชื่อเล่น เช่น กัปตัน
  grade: GradeLevel;     // ป.3 หรือ ป.4
  room: string;          // ห้อง 1 หรือ 2
  jerseyNumber: number;  // เบอร์เสื้อ / เลขที่
  position: PlayerPosition;
  avatarUrl?: string;
  parentName?: string;
  parentPhone?: string;
  parentLineId?: string;
  dateOfBirth?: string;
  evaluations: EvaluationRecord[];
}

export type AlertConditionType = 
  | 'overall_score_gte'    // คะแนนรวมเฉลี่ย >= X
  | 'overall_score_lte'    // คะแนนรวมเฉลี่ย < X (เตือนฝึกเสริม)
  | 'skill_score_gte'      // ทักษะเฉพาะด้าน >= X
  | 'skill_score_lte'      // ทักษะเฉพาะด้าน < X
  | 'improvement_gte';     // พัฒนาการจากครั้งก่อน >= +X%

export interface ThresholdRule {
  id: string;
  name: string;
  description: string;
  conditionType: AlertConditionType;
  targetSkill?: keyof SkillScores;
  thresholdValue: number;
  badgeLabel: string;
  alertMessageTemplate: string;
  lineNotifyEnabled: boolean;
  active: boolean;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  studentId: string;
  studentName: string;
  studentNickname: string;
  grade: string;
  sessionName: string;
  title: string;
  message: string;
  badgeLabel: string;
  severity: 'success' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  sentToLine: boolean;
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
}

export interface LineGroupConfig {
  groupName: string;
  lineNotifyToken?: string;
  autoSendAlerts: boolean;
}
