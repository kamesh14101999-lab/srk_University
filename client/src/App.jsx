import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Departments from './pages/public/Departments';
import Courses from './pages/public/Courses';
import Events from './pages/public/Events';
import Fests from './pages/public/Fests';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import NotFound from './pages/public/NotFound';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminStudentProfile from './pages/admin/AdminStudentProfile';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminTeacherProfile from './pages/admin/AdminTeacherProfile';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminAcademicYears from './pages/admin/AdminAcademicYears';
import AdminTeachingAssignments from './pages/admin/AdminTeachingAssignments';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminExams from './pages/admin/AdminExams';
import AdminMarks from './pages/admin/AdminMarks';
import AdminResults from './pages/admin/AdminResults';
import AdminTimetable from './pages/admin/AdminTimetable';
import AdminReports from './pages/admin/AdminReports';
import AdminUniversity from './pages/admin/AdminUniversity';
import AdminSettings from './pages/admin/AdminSettings';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherStudentProfile from './pages/teacher/TeacherStudentProfile';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherResults from './pages/teacher/TeacherResults';
import TeacherTimetable from './pages/teacher/TeacherTimetable';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentMarks from './pages/student/StudentMarks';
import StudentGrades from './pages/student/StudentGrades';
import StudentResults from './pages/student/StudentResults';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentExams from './pages/student/StudentExams';

import EventsPage from './pages/shared/EventsPage';
import FestsPage from './pages/shared/FestsPage';
import ClustersPage from './pages/shared/ClustersPage';
import SportsPage from './pages/shared/SportsPage';
import ClubsPage from './pages/shared/ClubsPage';
import CalendarPage from './pages/shared/CalendarPage';
import AnnouncementsPage from './pages/shared/AnnouncementsPage';
import AchievementsPage from './pages/shared/AchievementsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/events" element={<Events />} />
              <Route path="/fests" element={<Fests />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allow={['admin']} />}>
                <Route path="/admin" element={<DashboardLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="students/:id" element={<AdminStudentProfile />} />
                  <Route path="teachers" element={<AdminTeachers />} />
                  <Route path="teachers/:id" element={<AdminTeacherProfile />} />
                  <Route path="departments" element={<AdminDepartments />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="subjects" element={<AdminSubjects />} />
                  <Route path="academic-years" element={<AdminAcademicYears />} />
                  <Route path="teaching-assignments" element={<AdminTeachingAssignments />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="exams" element={<AdminExams />} />
                  <Route path="marks" element={<AdminMarks />} />
                  <Route path="results" element={<AdminResults />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="fests" element={<FestsPage />} />
                  <Route path="clusters" element={<ClustersPage />} />
                  <Route path="sports" element={<SportsPage />} />
                  <Route path="clubs" element={<ClubsPage />} />
                  <Route path="achievements" element={<AchievementsPage />} />
                  <Route path="timetable" element={<AdminTimetable />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="university" element={<AdminUniversity />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allow={['teacher']} />}>
                <Route path="/teacher" element={<DashboardLayout />}>
                  <Route index element={<TeacherDashboard />} />
                  <Route path="profile" element={<TeacherProfile />} />
                  <Route path="classes" element={<TeacherClasses />} />
                  <Route path="students" element={<TeacherStudents />} />
                  <Route path="students/:id" element={<TeacherStudentProfile />} />
                  <Route path="attendance" element={<TeacherAttendance />} />
                  <Route path="marks" element={<TeacherMarks />} />
                  <Route path="results" element={<TeacherResults />} />
                  <Route path="timetable" element={<TeacherTimetable />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="activities" element={<ClustersPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allow={['student']} />}>
                <Route path="/student" element={<DashboardLayout />}>
                  <Route index element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="attendance" element={<StudentAttendance />} />
                  <Route path="subjects" element={<StudentSubjects />} />
                  <Route path="marks" element={<StudentMarks />} />
                  <Route path="grades" element={<StudentGrades />} />
                  <Route path="results" element={<StudentResults />} />
                  <Route path="timetable" element={<StudentTimetable />} />
                  <Route path="exams" element={<StudentExams />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="fests" element={<FestsPage />} />
                  <Route path="activities" element={<ClustersPage />} />
                  <Route path="sports" element={<SportsPage />} />
                  <Route path="clubs" element={<ClubsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/unauthorized" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
