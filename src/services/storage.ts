import { Student, ThresholdRule, TriggeredAlert, GoogleSheetsConfig, AttendanceRecord } from '../types/football';
import { INITIAL_STUDENTS, INITIAL_THRESHOLD_RULES, INITIAL_ATTENDANCE_RECORDS } from '../data/mockData';
import { evaluateAllStudents } from './rulesEngine';

const STORAGE_KEYS = {
  STUDENTS: 'football_tracker_students_p34_v2',
  RULES: 'football_tracker_rules_p34_v2',
  ALERTS: 'football_tracker_alerts_p34_v2',
  SHEETS_CONFIG: 'football_tracker_sheets_config_p34_v2',
  ATTENDANCE: 'football_tracker_attendance_p34_v2',
};

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load students from localStorage', err);
  }
  saveStudents(INITIAL_STUDENTS);
  return INITIAL_STUDENTS;
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to localStorage', err);
  }
}

export function loadAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load attendance records', err);
  }
  saveAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
  return INITIAL_ATTENDANCE_RECORDS;
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save attendance records', err);
  }
}

export function loadThresholdRules(): ThresholdRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load rules', err);
  }
  saveThresholdRules(INITIAL_THRESHOLD_RULES);
  return INITIAL_THRESHOLD_RULES;
}

export function saveThresholdRules(rules: ThresholdRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save rules', err);
  }
}

export function loadAlerts(): TriggeredAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load alerts', err);
  }
  const initialAlerts = evaluateAllStudents(INITIAL_STUDENTS, INITIAL_THRESHOLD_RULES);
  saveAlerts(initialAlerts);
  return initialAlerts;
}

export function saveAlerts(alerts: TriggeredAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (err) {
    console.error('Failed to save alerts', err);
  }
}

export function loadSheetsConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load sheets config', err);
  }
  return {
    webhookUrl: '',
    sheetName: 'ประเมินทักษะฟุตบอล ป.3-ป.4 โรงเรียนวัดพลมานีย์',
    autoSync: false,
  };
}

export function saveSheetsConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save sheets config', err);
  }
}

export function resetToDefaultData(): { 
  students: Student[]; 
  rules: ThresholdRule[]; 
  alerts: TriggeredAlert[];
  attendance: AttendanceRecord[];
} {
  saveStudents(INITIAL_STUDENTS);
  saveThresholdRules(INITIAL_THRESHOLD_RULES);
  saveAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
  const alerts = evaluateAllStudents(INITIAL_STUDENTS, INITIAL_THRESHOLD_RULES);
  saveAlerts(alerts);
  return {
    students: INITIAL_STUDENTS,
    rules: INITIAL_THRESHOLD_RULES,
    alerts,
    attendance: INITIAL_ATTENDANCE_RECORDS,
  };
}
