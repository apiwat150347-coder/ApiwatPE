import { Student, EvaluationRecord, TriggeredAlert } from '../types/football';
import { FOOTBALL_SKILLS } from '../data/skillsConfig';

/**
 * Format student evaluation into a rich, readable LINE message
 */
export function formatStudentLineMessage(student: Student, evaluation: EvaluationRecord, previousEval?: EvaluationRecord): string {
  const dateStr = new Date(evaluation.sessionDate).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  let diffText = '';
  if (previousEval) {
    const diff = Math.round((evaluation.totalAverage - previousEval.totalAverage) * 10) / 10;
    if (diff > 0) {
      diffText = ` (📈 เพิ่มขึ้น +${diff}%)`;
    } else if (diff < 0) {
      diffText = ` (📉 เปลี่ยนแปลง ${diff}%)`;
    } else {
      diffText = ` (คงที่ 0%)`;
    }
  }

  const lines = [
    `⚽ [โรงเรียนวัดพลมานีย์ - สำนักงานเขตลาดกระบัง] ⚽`,
    `📋 รายงานผลการประเมินทักษะฟุตบอล (ป.3 - ป.4)`,
    `━━━━━━━━━━━━━━━━━━`,
    `👤 นักเรียน: ${student.fullName} (น้อง${student.nickname})`,
    `🏫 ระดับชั้น: ${student.grade}/${student.room} | เบอร์: #${student.jerseyNumber}`,
    `⚡ ตำแหน่ง: ${student.position}`,
    `📅 รอบประเมิน: ${evaluation.sessionName} (${dateStr})`,
    `━━━━━━━━━━━━━━━━━━`,
    `⭐ สรุปผลรวม: ${Math.round(evaluation.totalAverage)}% (เกรด ${evaluation.grade})${diffText}`,
    ``,
    `📊 คะแนนทักษะรายด้าน (เต็ม 100):`,
    `• การแป/ส่งบอล: ${evaluation.scores.passing} คะแนน`,
    `• การจับ/คุมบอลแรก: ${evaluation.scores.control} คะแนน`,
    `• เลี้ยงบอลซิกแซก: ${evaluation.scores.dribbling} คะแนน`,
    `• การยิงประตู: ${evaluation.scores.shooting} คะแนน`,
    `• การเดาะบอลสัมผัส: ${evaluation.scores.juggling} คะแนน`,
    `• ความคล่องตัว/ทีมเวิร์ก: ${evaluation.scores.agility_tactics} คะแนน`,
    ``,
  ];

  if (evaluation.strengths.length > 0) {
    lines.push(`🌟 จุดเด่น: ${evaluation.strengths.join(', ')}`);
  }

  if (evaluation.improvements.length > 0) {
    lines.push(`🎯 จุดที่ต้องฝึกเพิ่ม: ${evaluation.improvements.join(', ')}`);
  }

  if (evaluation.coachNotes) {
    lines.push(`💬 ความเห็นโค้ช: "${evaluation.coachNotes}"`);
  }

  if (evaluation.recommendedDrills.length > 0) {
    lines.push(`🏋️ แบบฝึกซ้อมแนะนำที่บ้าน:`);
    evaluation.recommendedDrills.forEach((drill, idx) => {
      lines.push(`  ${idx + 1}. ${drill}`);
    });
  }

  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`🌱 มาร่วมเป็นกำลังใจและพัฒนาศักยภาพน้องไปด้วยกันครับ!`);

  return lines.join('\n');
}

/**
 * Format automated milestone alert for LINE
 */
export function formatMilestoneAlertLineMessage(alert: TriggeredAlert): string {
  return [
    `🏆 [โรงเรียนวัดพลมานีย์] แจ้งเตือนเกณฑ์ดีเด่นทักษะฟุตบอล ⚽`,
    `━━━━━━━━━━━━━━━━━━`,
    `🎉 น้อง${alert.studentNickname} (${alert.studentName}) - ${alert.grade}`,
    `🎖️ รางวัล/เกณฑ์: ${alert.badgeLabel}`,
    `📅 รอบ: ${alert.sessionName}`,
    `━━━━━━━━━━━━━━━━━━`,
    `${alert.message}`,
    `━━━━━━━━━━━━━━━━━━`,
    `📢 กลุ่มสาระสุขศึกษาและพลศึกษา โรงเรียนวัดพลมานีย์ ขอแสดงความยินดีด้วยครับ!`,
  ].join('\n');
}

/**
 * Format class summary report for LINE
 */
export function formatClassSummaryLineMessage(grade: string, students: Student[]): string {
  const filtered = students.filter(s => s.grade === grade);
  const total = filtered.length;
  if (total === 0) return 'ไม่มีข้อมูลนักเรียนในระดับชั้นนี้';

  let totalScoreSum = 0;
  let countWithEvals = 0;
  let gradeACount = 0;

  filtered.forEach(s => {
    if (s.evaluations.length > 0) {
      const latest = s.evaluations[s.evaluations.length - 1];
      totalScoreSum += latest.totalAverage;
      countWithEvals++;
      if (latest.grade === 'A') gradeACount++;
    }
  });

  const avg = countWithEvals > 0 ? (totalScoreSum / countWithEvals).toFixed(1) : '0';

  const lines = [
    `📊 [โรงเรียนวัดพลมานีย์] สรุปผลทักษะฟุตบอลชั้น ${grade} ⚽`,
    `สำนักงานเขตลาดกระบัง กรุงเทพมหานคร`,
    `━━━━━━━━━━━━━━━━━━`,
    `👥 จำนวนนักเรียนทั้งหมด: ${total} คน`,
    `✅ ได้รับการประเมินแล้ว: ${countWithEvals} คน`,
    `📈 คะแนนเฉลี่ยรวมระดับชั้น: ${avg} คะแนน`,
    `🌟 นักเรียนระดับดีเยี่ยม (เกรด A): ${gradeACount} คน`,
    `━━━━━━━━━━━━━━━━━━`,
    `รายชื่อและพัฒนาการเด่น:`,
  ];

  filtered.slice(0, 10).forEach(s => {
    if (s.evaluations.length > 0) {
      const latest = s.evaluations[s.evaluations.length - 1];
      lines.push(`• น้อง${s.nickname} (#${s.jerseyNumber}): ${Math.round(latest.totalAverage)}% [${latest.grade}]`);
    } else {
      lines.push(`• น้อง${s.nickname} (#${s.jerseyNumber}): รอการประเมิน`);
    }
  });

  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`ส่งตรงจากระบบบันทึกและวิเคราะห์ผลการเรียนทักษะฟุตบอล`);

  return lines.join('\n');
}

/**
 * Open LINE App with pre-filled message (Mobile and Desktop friendly)
 */
export function openLineShare(message: string): void {
  const encoded = encodeURIComponent(message);
  const lineUrl = `https://line.me/R/msg/text/?${encoded}`;
  window.open(lineUrl, '_blank');
}
