import { Student, EvaluationRecord, ThresholdRule, TriggeredAlert } from '../types/football';
import { FOOTBALL_SKILLS } from '../data/skillsConfig';

export function evaluateThresholdRules(
  student: Student,
  currentEval: EvaluationRecord,
  previousEval?: EvaluationRecord,
  rules: ThresholdRule[] = []
): TriggeredAlert[] {
  const triggered: TriggeredAlert[] = [];
  const activeRules = rules.filter(r => r.active);

  for (const rule of activeRules) {
    let matched = false;
    let scoreDisplay = 0;
    let diffDisplay = 0;

    switch (rule.conditionType) {
      case 'overall_score_gte':
        if (currentEval.totalAverage >= rule.thresholdValue) {
          matched = true;
          scoreDisplay = Math.round(currentEval.totalAverage);
        }
        break;

      case 'overall_score_lte':
        if (currentEval.totalAverage < rule.thresholdValue) {
          matched = true;
          scoreDisplay = Math.round(currentEval.totalAverage);
        }
        break;

      case 'skill_score_gte':
        if (rule.targetSkill) {
          const val = currentEval.scores[rule.targetSkill];
          if (val >= rule.thresholdValue) {
            matched = true;
            scoreDisplay = val;
          }
        }
        break;

      case 'skill_score_lte':
        if (rule.targetSkill) {
          const val = currentEval.scores[rule.targetSkill];
          if (val < rule.thresholdValue) {
            matched = true;
            scoreDisplay = val;
          }
        }
        break;

      case 'improvement_gte':
        if (previousEval) {
          const diff = Math.round((currentEval.totalAverage - previousEval.totalAverage) * 10) / 10;
          if (diff >= rule.thresholdValue) {
            matched = true;
            diffDisplay = diff;
            scoreDisplay = Math.round(currentEval.totalAverage);
          }
        }
        break;
    }

    if (matched) {
      const targetSkillName = rule.targetSkill 
        ? FOOTBALL_SKILLS.find(s => s.key === rule.targetSkill)?.nameTh || rule.targetSkill
        : 'คะแนนรวม';

      const formattedMessage = rule.alertMessageTemplate
        .replace('{nickname}', student.nickname)
        .replace('{name}', student.fullName)
        .replace('{score}', scoreDisplay.toString())
        .replace('{diff}', diffDisplay.toString())
        .replace('{skill}', targetSkillName);

      const isWarning = rule.conditionType.includes('lte');

      triggered.push({
        id: `alert-${student.id}-${rule.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: rule.id,
        studentId: student.id,
        studentName: student.fullName,
        studentNickname: student.nickname,
        grade: `${student.grade}/${student.room}`,
        sessionName: currentEval.sessionName,
        title: `${rule.name}: น้อง${student.nickname}`,
        message: formattedMessage,
        badgeLabel: rule.badgeLabel,
        severity: isWarning ? 'warning' : 'success',
        timestamp: new Date().toISOString(),
        read: false,
        sentToLine: false,
      });
    }
  }

  return triggered;
}

export function evaluateAllStudents(students: Student[], rules: ThresholdRule[]): TriggeredAlert[] {
  const allAlerts: TriggeredAlert[] = [];
  for (const stu of students) {
    if (stu.evaluations.length === 0) continue;
    const sorted = [...stu.evaluations].sort(
      (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );
    const latest = sorted[sorted.length - 1];
    const prev = sorted.length > 1 ? sorted[sorted.length - 2] : undefined;
    const alerts = evaluateThresholdRules(stu, latest, prev, rules);
    allAlerts.push(...alerts);
  }
  return allAlerts;
}
