export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function attendanceColor(percent, threshold = 75, warning = 65) {
  if (percent >= threshold) return 'green';
  if (percent >= warning) return 'amber';
  return 'red';
}

export const ATTENDANCE_COLOR_CLASSES = {
  green: 'text-green-700 bg-green-100',
  amber: 'text-amber-700 bg-amber-100',
  red: 'text-red-700 bg-red-100',
};

export const GRADE_COLOR_CLASSES = {
  O: 'text-green-700 bg-green-100',
  'A+': 'text-green-700 bg-green-100',
  A: 'text-primary-700 bg-primary-100',
  'B+': 'text-primary-700 bg-primary-100',
  B: 'text-amber-700 bg-amber-100',
  C: 'text-amber-700 bg-amber-100',
  P: 'text-amber-700 bg-amber-100',
  F: 'text-red-700 bg-red-100',
};
