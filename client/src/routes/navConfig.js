// Each role's nav is a mix of standalone items ({ label, path }) and
// collapsible sections ({ section, items: [{ label, path }] }).
export const NAV = {
  admin: [
    { label: 'Dashboard', path: '/admin' },
    {
      section: 'People',
      items: [
        { label: 'Students', path: '/admin/students' },
        { label: 'Teachers', path: '/admin/teachers' },
      ],
    },
    {
      section: 'Academics',
      items: [
        { label: 'Departments', path: '/admin/departments' },
        { label: 'Courses', path: '/admin/courses' },
        { label: 'Subjects', path: '/admin/subjects' },
        { label: 'Academic Years', path: '/admin/academic-years' },
        { label: 'Teaching Assignments', path: '/admin/teaching-assignments' },
      ],
    },
    {
      section: 'Operations',
      items: [
        { label: 'Attendance', path: '/admin/attendance' },
        { label: 'Examinations', path: '/admin/exams' },
        { label: 'Marks & Grades', path: '/admin/marks' },
        { label: 'Results', path: '/admin/results' },
        { label: 'Timetable', path: '/admin/timetable' },
      ],
    },
    {
      section: 'Campus Life',
      items: [
        { label: 'Events', path: '/admin/events' },
        { label: 'University Fests', path: '/admin/fests' },
        { label: 'Cluster Activities', path: '/admin/clusters' },
        { label: 'Sports & Games', path: '/admin/sports' },
        { label: 'Clubs', path: '/admin/clubs' },
        { label: 'Achievements', path: '/admin/achievements' },
      ],
    },
    {
      section: 'Communication',
      items: [
        { label: 'Academic Calendar', path: '/admin/calendar' },
        { label: 'Announcements', path: '/admin/announcements' },
      ],
    },
    {
      section: 'Administration',
      items: [
        { label: 'Reports', path: '/admin/reports' },
        { label: 'University Information', path: '/admin/university' },
        { label: 'Settings', path: '/admin/settings' },
      ],
    },
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher' },
    { label: 'My Profile', path: '/teacher/profile' },
    {
      section: 'My Teaching',
      items: [
        { label: 'My Classes', path: '/teacher/classes' },
        { label: 'Students', path: '/teacher/students' },
        { label: 'Timetable', path: '/teacher/timetable' },
      ],
    },
    {
      section: 'Academics',
      items: [
        { label: 'Attendance', path: '/teacher/attendance' },
        { label: 'Marks', path: '/teacher/marks' },
        { label: 'Results', path: '/teacher/results' },
      ],
    },
    {
      section: 'Campus Life',
      items: [
        { label: 'Events', path: '/teacher/events' },
        { label: 'Activities', path: '/teacher/activities' },
      ],
    },
    {
      section: 'Communication',
      items: [{ label: 'Announcements', path: '/teacher/announcements' }],
    },
  ],
  student: [
    { label: 'Dashboard', path: '/student' },
    { label: 'My Profile', path: '/student/profile' },
    {
      section: 'Academics',
      items: [
        { label: 'My Attendance', path: '/student/attendance' },
        { label: 'My Subjects', path: '/student/subjects' },
        { label: 'My Marks', path: '/student/marks' },
        { label: 'My Grades', path: '/student/grades' },
        { label: 'My Results', path: '/student/results' },
        { label: 'My Timetable', path: '/student/timetable' },
        { label: 'Examinations', path: '/student/exams' },
      ],
    },
    {
      section: 'Campus Life',
      items: [
        { label: 'Events', path: '/student/events' },
        { label: 'Fests', path: '/student/fests' },
        { label: 'Activities', path: '/student/activities' },
        { label: 'Sports', path: '/student/sports' },
        { label: 'Clubs', path: '/student/clubs' },
      ],
    },
    {
      section: 'Communication',
      items: [{ label: 'Announcements', path: '/student/announcements' }],
    },
  ],
};
