export const ROLES = {
  GUEST: 'guest',
  STUDENT: 'student',
  TEACHER: 'teacher', // legacy UI label → maps to admin on signup
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const BADGE_DEFS = [
  { id: 'first_lesson', label: 'First Steps', minPoints: 10 },
  { id: 'engaged', label: 'Community Voice', minPoints: 50 },
  { id: 'scholar', label: 'Scholar', minPoints: 100 },
  { id: 'champion', label: 'Champion', minPoints: 250 },
];

export const COLORS = {
  brand: '#1a78f5',
  ink: '#22262f',
  muted: '#667690',
  border: '#d5dae2',
  bg: '#f6f7f9',
  white: '#ffffff',
  success: '#16a34a',
  danger: '#dc2626',
};

