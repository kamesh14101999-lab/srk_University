# SKR University Management Portal

A web portal for SKR University, Vizag (Visakhapatnam), Andhra Pradesh, India, where the Principal/Admin, teachers, and students manage and view students, faculty, academics, attendance, exams, results, events, fests, cluster activities, sports, and clubs in one place.

## Goal

Replace scattered registers, spreadsheets, and notice boards with one system. Each role sees exactly what it needs:

- **Admin / Principal** → manage and monitor the whole university.
- **Teacher** → manage their own classes: attendance, marks, remarks.
- **Student** → see their own profile, attendance, marks, results, timetable, and university activities.

## Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, Recharts (charts only)
- **Backend:** Node, Express
- **Database:** MongoDB Atlas, Mongoose
- **Auth:** JWT in localStorage, bcrypt for password hashing
- **Reports:** `exceljs` (Excel) and `pdfkit` (PDF), generated on the server
- **Deploy:** Frontend on Vercel, backend on Render

## Repo structure

```
skr-university-portal/
  client/
    src/
      api/            # Axios instance + one file per resource (students.js, exams.js ...)
      context/        # AuthContext
      components/     # Reusable: Table, Pagination, Modal, ConfirmDialog, Toast, StatCard,
                      #   Badge, EmptyState, Loader, FormField, FilterBar, Sidebar, Topbar
      layouts/        # PublicLayout, DashboardLayout (sidebar changes by role)
      pages/
        public/       # Home, About, Departments, Courses, Events, Fests, Contact, Login
        admin/
        teacher/
        student/
        shared/       # Events, Fests, Clusters, Sports, Clubs, Calendar, Announcements
      routes/         # ProtectedRoute, RoleRoute, route config per role
      utils/          # formatters, grade colour helpers, constants
  server/
    src/
      config/         # db.js, env.js
      models/
      controllers/
      routes/
      middleware/     # protect, authorize, scope, validate, errorHandler
      services/       # grading.js, results.js, attendanceStats.js, reports.js
      utils/
      seed/           # seed.js + demo data
    server.js
  README.md
```

Two separate `package.json` files. No monorepo tooling.

## Roles and access

Hierarchy: **ADMIN → TEACHER → STUDENT**. Enforced on the server on every route. Hiding a menu item in the UI is not security.

| Area | Admin | Teacher | Student |
|---|---|---|---|
| Students | Full CRUD, activate/deactivate | Read students in own assigned classes, add remarks | Own profile only (read) |
| Teachers | Full CRUD, activate/deactivate | Own profile only | — |
| Departments, Courses, Subjects | Full CRUD | Read | Read (public info) |
| Academic years, semesters | Full CRUD | Read | Read |
| Teaching assignments | Full CRUD | Read own | — |
| Attendance | Read all, edit all | Mark/edit for own assigned subjects/sections | Read own |
| Exams | Full CRUD | Read exams for own subjects | Read own upcoming exams |
| Marks | Read/edit all | Enter/edit for own subjects, only while exam is not published | Read own, published only |
| Results | Generate, publish/unpublish | Read for own classes | Read own, published only |
| Events, Fests, Clusters, Sports, Clubs | Full CRUD | Read | Read |
| Timetable | Full CRUD | Read own teaching timetable | Read own class timetable |
| Academic calendar | Full CRUD | Read | Read |
| Announcements | Create for any audience | Create for own assigned students only | Read |
| Reports & exports | Yes | — | — |
| University info, facilities, settings | Edit | Read | Read |
| User accounts & roles | Yes | — | — |

## Data models

All models use Mongoose `{ timestamps: true }` so every document has `createdAt` and `updatedAt`. References are `ObjectId` refs with indexes on every field used for filtering.

### User
| field | type | notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | required, hashed, `select: false`, never returned |
| role | String | enum: `admin`, `teacher`, `student`. Required |
| isActive | Boolean | default `true`. Inactive users cannot log in |
| lastLoginAt | Date | |

### Student
| field | type | notes |
|---|---|---|
| user | ObjectId → User | required, unique |
| studentId | String | required, unique (e.g. `SKR24CSE001`) |
| rollNumber | String | required, unique |
| photoUrl | String | optional URL |
| dob | Date | required |
| gender | String | enum: `male`, `female`, `other` |
| phone | String | |
| address | String | |
| guardianName | String | |
| guardianPhone | String | |
| emergencyContact | String | |
| bloodGroup | String | enum of standard groups |
| department | ObjectId → Department | required, indexed |
| course | ObjectId → Course | required, indexed |
| year | Number | 1–course duration |
| semester | Number | 1–course semesters |
| section | String | e.g. `A`, `B` |
| admissionYear | Number | |
| batch | String | e.g. `2024-2028` |
| academicStatus | String | enum: `active`, `detained`, `graduated`, `dropped`. Default `active` |
| remarks | [{ teacher: ObjectId → Teacher, text: String, date: Date }] | added by teachers |

### Teacher
| field | type | notes |
|---|---|---|
| user | ObjectId → User | required, unique |
| employeeId | String | required, unique |
| photoUrl | String | optional URL |
| phone | String | |
| department | ObjectId → Department | required, indexed |
| designation | String | enum: `Professor`, `Associate Professor`, `Assistant Professor`, `Lecturer`, `Lab Instructor` |
| qualification | String | e.g. `Ph.D. (CSE)` |
| specialization | String | |
| experienceYears | Number | |
| joiningDate | Date | |
| status | String | enum: `active`, `on_leave`, `inactive` |

### Department
| field | type | notes |
|---|---|---|
| name | String | required, unique |
| code | String | required, unique, uppercase (e.g. `CSE`) |
| hod | ObjectId → Teacher | optional |
| description | String | |
| email | String | placeholder, configurable |
| phone | String | placeholder, configurable |

Student count, faculty list, and courses are computed by query, not stored.

### Course
| field | type | notes |
|---|---|---|
| name | String | required (e.g. `B.Tech Computer Science & Engineering`) |
| code | String | required, unique |
| department | ObjectId → Department | required |
| degreeType | String | enum: `UG`, `PG`, `Diploma`, `Certificate` |
| durationYears | Number | required |
| totalSemesters | Number | required |
| eligibility | String | |
| description | String | |
| intake | Number | |
| isActive | Boolean | default `true` |

### Subject
| field | type | notes |
|---|---|---|
| name | String | required |
| code | String | required, unique |
| course | ObjectId → Course | required |
| semester | Number | required |
| credits | Number | required, used for SGPA |
| type | String | enum: `theory`, `lab`, `elective` |

### AcademicYear
| field | type | notes |
|---|---|---|
| label | String | required, unique (e.g. `2026-27`) |
| startDate | Date | |
| endDate | Date | |
| isCurrent | Boolean | only one can be `true` |

### TeachingAssignment
The link that decides what a teacher can see. Every teacher permission check runs through this collection.

| field | type | notes |
|---|---|---|
| teacher | ObjectId → Teacher | required, indexed |
| subject | ObjectId → Subject | required |
| course | ObjectId → Course | required |
| semester | Number | required |
| section | String | required |
| academicYear | ObjectId → AcademicYear | required |

Unique index on `{ subject, course, semester, section, academicYear }`.

### Attendance
| field | type | notes |
|---|---|---|
| student | ObjectId → Student | required, indexed |
| subject | ObjectId → Subject | required, indexed |
| assignment | ObjectId → TeachingAssignment | required |
| date | Date | required, date only (no time) |
| status | String | enum: `present`, `absent` |
| markedBy | ObjectId → User | required |

Unique index on `{ student, subject, date }`. Re-marking a date updates, never duplicates.

### Exam
| field | type | notes |
|---|---|---|
| name | String | required (e.g. `Mid-Term 1 – Data Structures`) |
| type | String | enum: `internal`, `midterm`, `assignment`, `practical`, `semester`, `supplementary` |
| subject | ObjectId → Subject | required |
| course | ObjectId → Course | required |
| semester | Number | required |
| academicYear | ObjectId → AcademicYear | required |
| date | Date | |
| maxMarks | Number | required, > 0 |
| isPublished | Boolean | default `false`. Locks teacher edits when `true` |

### Mark
| field | type | notes |
|---|---|---|
| student | ObjectId → Student | required, indexed |
| exam | ObjectId → Exam | required, indexed |
| obtained | Number | required, 0 ≤ obtained ≤ exam.maxMarks |
| isAbsent | Boolean | default `false` |
| enteredBy | ObjectId → User | required |

Unique index on `{ student, exam }`. Grade and grade point are computed, not stored here.

### GradingRule
Configurable by Admin. Seeded with this default 10-point scale:

| minPercent | grade | gradePoint |
|---|---|---|
| 90 | O | 10 |
| 80 | A+ | 9 |
| 70 | A | 8 |
| 60 | B+ | 7 |
| 50 | B | 6 |
| 45 | C | 5 |
| 40 | P | 4 |
| 0 | F | 0 |

### Result
Generated by the server from marks, one per student per semester.

| field | type | notes |
|---|---|---|
| student | ObjectId → Student | required |
| course | ObjectId → Course | required |
| semester | Number | required |
| academicYear | ObjectId → AcademicYear | required |
| subjects | [{ subject, maxMarks, obtained, percent, grade, gradePoint, credits, status }] | snapshot at generation time |
| totalMax | Number | |
| totalObtained | Number | |
| percentage | Number | rounded to 2 decimals |
| sgpa | Number | rounded to 2 decimals |
| cgpa | Number | across all published semesters so far |
| status | String | enum: `pass`, `fail` |
| backlogs | Number | count of failed subjects |
| isPublished | Boolean | default `false` |
| publishedAt | Date | |

Unique index on `{ student, semester, academicYear }`.

### Event
| field | type | notes |
|---|---|---|
| name | String | required |
| type | String | enum: `cultural`, `technical`, `workshop`, `seminar`, `conference`, `guest_lecture`, `student_activity`, `competition` |
| description | String | |
| date | Date | required |
| startTime | String | `HH:mm` |
| endTime | String | `HH:mm`, must be after startTime |
| venue | String | |
| organizer | String | |
| coordinator | ObjectId → Teacher | |
| registrationRequired | Boolean | |
| participants | [ObjectId → Student] | |
| status | String | enum: `upcoming`, `ongoing`, `completed`, `cancelled` |
| imageUrls | [String] | URLs |

### Fest
| field | type | notes |
|---|---|---|
| name | String | required (e.g. `SKR Utsav 2026`) |
| year | Number | required, used for fest history |
| description | String | |
| startDate / endDate | Date | |
| venue | String | |
| programs | [{ title, category: `cultural`/`technical`/`sports`, date, venue }] | |
| registrationOpen | Boolean | |
| participants | [ObjectId → Student] | |
| winners | [{ program, position, student or teamName }] | |
| galleryUrls | [String] | |

### ClusterActivity
| field | type | notes |
|---|---|---|
| clusterName | String | required |
| activityName | String | required |
| activityType | String | |
| date | Date | |
| venue | String | |
| organizer | String | |
| departments | [ObjectId → Department] | participating departments |
| participants | [ObjectId → Student] | |
| winners | [{ position, student }] | |
| results | String | |
| certificateUrls | [String] | |
| photoUrls | [String] | |

### Sport, Tournament, Team, Fixture
- **Sport** — `name` (Cricket, Football, Volleyball, Basketball, Badminton, Chess, Athletics, Table Tennis, others), `description`.
- **Tournament** — `name`, `sport`, `startDate`, `endDate`, `venue`, `status`, `winnerTeam`.
- **Team** — `name`, `sport`, `tournament`, `department` (optional), `captain` → Student, `players` [→ Student], `coach` → Teacher.
- **Fixture** — `tournament`, `teamA`, `teamB`, `date`, `venue`, `scoreA`, `scoreB`, `winner`, `status`.

### Club, ClubMember
- **Club** — `name`, `description`, `facultyCoordinator` → Teacher, `studentCoordinator` → Student, `activities` [{ title, date, description }].
- **ClubMember** — `club`, `student`, `role` (`member`, `coordinator`), `joinedAt`. Unique on `{ club, student }`.

### Achievement
| field | type | notes |
|---|---|---|
| student | ObjectId → Student | required |
| title | String | required |
| category | String | enum: `academic`, `sports`, `cultural`, `technical`, `club`, `other` |
| date | Date | |
| sourceType / sourceId | String / ObjectId | optional link to Event, Fest, Tournament, etc. |

Students' sports, events, and activity tabs are built from participant lists plus this collection.

### TimetableEntry
| field | type | notes |
|---|---|---|
| assignment | ObjectId → TeachingAssignment | gives subject, teacher, course, semester, section |
| day | String | enum: `Mon`–`Sat` |
| startTime / endTime | String | `HH:mm` |
| room | String | |

The server rejects clashes: same teacher, or same course+semester+section, or same room, overlapping on the same day.

### CalendarEntry
| field | type | notes |
|---|---|---|
| title | String | required |
| type | String | enum: `semester_start`, `semester_end`, `holiday`, `internal_exam`, `semester_exam`, `results`, `event`, `workshop`, `fest`, `other` |
| startDate | Date | required |
| endDate | Date | optional, ≥ startDate |
| description | String | |

### Announcement, Notification
- **Announcement** — `title`, `body`, `category` (`general`, `exam`, `result`, `holiday`, `event`, `academic`, `alert`), `audience` (`all`, `teachers`, `students`, `assignment`), `assignment` (when a teacher targets their own class), `createdBy`, `isPinned`.
- **Notification** — `user`, `title`, `message`, `link`, `isRead`. Created by the server when an announcement targets a user, results are published, or marks are entered.

### Facility, UniversityInfo, Setting
- **Facility** — `name`, `category` (library, hostel, lab, transport, cafeteria, medical, sports, auditorium, computer_lab), `description`, `imageUrl`.
- **UniversityInfo** — single document: `overview`, `history`, `vision`, `mission`, `objectives`, `leadership` [{ name, designation, message, photoUrl }], `address`, `email`, `phone`, `mapEmbedUrl`, `accreditation`, `affiliation`, `approvals`, `placementInfo`, `studentSupport`.
- **Setting** — key/value: `attendanceThreshold` (default 75), `attendanceWarning` (default 65), `currentAcademicYear`, `passPercent` (default 40).

**Accreditation, rankings, affiliation, approvals, phone numbers, and emails are never invented.** They are empty in seed data, rendered as "To be updated" on the site, and edited by Admin.

## Calculations

All done on the server in `services/`. The client only displays them.

- **Attendance %** = present / total classes held × 100, rounded to 1 decimal. Available daily, per subject, per month, per semester, and overall.
- **Attendance indicator:** green ≥ `attendanceThreshold`, amber ≥ `attendanceWarning`, red below.
- **Subject percent** for a semester = sum of obtained / sum of max across that subject's exams. If a `supplementary` exam exists for the student, it replaces the `semester` exam marks.
- **Grade / grade point** = first GradingRule where subject percent ≥ `minPercent`.
- **Subject status** = `pass` if grade is not `F`, else `fail`.
- **SGPA** = Σ(credits × gradePoint) / Σ credits, rounded to 2 decimals.
- **CGPA** = Σ(credits × gradePoint) / Σ credits across all published semesters.
- **Semester result** = `pass` if every subject passes, else `fail` with `backlogs` count.

## API

Base path: `/api`. All list endpoints support `?page=&limit=` (default 1 and 20, max 100) and return `{ items, total, page, pages }`.

Middleware on protected routes: `protect` (valid JWT, active user) → `authorize(...roles)` → scope check for teachers and students.

**Auth**
- `POST /auth/login` → `{ identifier, password, role }` (identifier is email, Student ID, or Employee ID) → `{ token, user }`. Wrong role for the account is a login failure.
- `GET /auth/me` → current user with linked student/teacher profile (protected)
- `PATCH /auth/password` → change own password (protected)

There is no public register. Admin creates all accounts.

**Public** (no auth, used by the homepage)
- `GET /public/university` · `GET /public/departments` · `GET /public/courses` · `GET /public/faculty` (name, designation, department, photo only) · `GET /public/facilities` · `GET /public/events` · `GET /public/fests` · `GET /public/clusters` · `GET /public/sports` · `GET /public/announcements` (audience `all` only) · `GET /public/calendar`

**Dashboards**
- `GET /dashboard/admin` → counts, upcoming events/exams, recent results, attendance overview, performance summary, sports overview, recent announcements
- `GET /dashboard/teacher` → assigned classes, today's timetable, low-attendance students, pending mark entry
- `GET /dashboard/student` → profile summary, attendance %, latest SGPA/CGPA, today's timetable, upcoming exams, notifications

**Users** — admin
- `GET /users` · `PATCH /users/:id/status` (activate/deactivate) · `PATCH /users/:id/reset-password`

**Students**
- `GET /students` → admin: all; teacher: only students in own assignments. Filters: `search` (name, Student ID, roll number), `department`, `course`, `year`, `semester`, `section`, `batch`, `status`
- `POST /students` (admin) → creates User + Student together
- `GET /students/:id` → admin; teacher if in own class; student only if it is themselves
- `PATCH /students/:id` (admin) · `DELETE /students/:id` (admin)
- `POST /students/:id/remarks` (teacher, own class only)
- `GET /students/:id/attendance` · `/marks` · `/results` · `/activities` → same access as `GET /students/:id`; students see published results only

**Teachers**
- `GET /teachers` (admin) — filters: `search` (name, Employee ID), `department`, `designation`, `status`
- `POST /teachers` · `PATCH /teachers/:id` · `DELETE /teachers/:id` (admin)
- `GET /teachers/:id` → admin, or the teacher themselves
- `GET /teachers/:id/workload` (admin) → assignments, weekly hours

**Departments, Courses, Subjects, Academic Years, Teaching Assignments**
- Standard `GET` list, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` for each.
- Writes: admin only. Reads: any logged-in user.
- `DELETE` is refused with `409` if anything still references the record (e.g. a department with students).

**Attendance**
- `GET /attendance/sheet?assignment=&date=` → student list for that class with existing status (teacher must own the assignment)
- `PUT /attendance/sheet` → `{ assignment, date, records: [{ student, status }] }` bulk upsert. Date cannot be in the future
- `GET /attendance/summary?student=&subject=&from=&to=&groupBy=day|month|subject|semester`
- `GET /attendance/analytics` (admin) → by department, course, and section; list of students below threshold

**Exams**
- `GET /exams` → filtered by role scope; `?type=`, `?course=`, `?semester=`, `?upcoming=true`
- `POST` · `PATCH /:id` · `DELETE /:id` (admin)
- `PATCH /exams/:id/publish` · `PATCH /exams/:id/unpublish` (admin)

**Marks**
- `GET /marks/sheet?exam=` → all students for that exam with existing marks (teacher must own the subject)
- `PUT /marks/sheet` → `{ exam, records: [{ student, obtained, isAbsent }] }` bulk upsert. Refused with `403` for teachers if the exam is published
- `GET /grading-rules` · `PUT /grading-rules` (admin)

**Results**
- `POST /results/generate` (admin) → `{ course, semester, academicYear }` computes or recomputes unpublished results
- `GET /results` → admin: all; teacher: own classes; student: own and published only
- `PATCH /results/publish` · `PATCH /results/unpublish` (admin) → `{ course, semester, academicYear }`. Publishing creates notifications for each student

**Analytics**
- `GET /analytics/admin` → university average, department/course/semester performance, pass/fail %, top performers, students needing attention (low marks or low attendance), attendance vs performance points, grade distribution
- `GET /analytics/teacher` → per assignment: class average, subject average, top performers, low scorers, trend across exams
- `GET /analytics/student` → own marks trend, semester comparison, subject performance, attendance vs marks

**Events, Fests, Cluster Activities, Sports, Tournaments, Teams, Fixtures, Clubs, Achievements, Facilities, Calendar**
- `GET` list and `GET /:id` → any logged-in user
- `POST`, `PATCH /:id`, `DELETE /:id` → admin
- `POST /events/:id/register` (student) when `registrationRequired` and status is `upcoming`
- `POST /clubs/:id/members` · `DELETE /clubs/:id/members/:studentId` (admin)

**Timetable**
- `GET /timetable/me` → student: own class; teacher: own teaching timetable
- `GET /timetable?course=&semester=&section=` (admin, teacher)
- `POST` · `PATCH /:id` · `DELETE /:id` (admin). Clashes return `409` with the clashing entry

**Announcements & Notifications**
- `GET /announcements` → only those whose audience includes the current user
- `POST /announcements` → admin: any audience; teacher: audience `assignment` with one of their own assignments only
- `PATCH /:id` · `DELETE /:id` → admin, or the teacher who created it
- `GET /notifications` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all` → own only

**Reports** — admin
- `GET /reports/:type?format=pdf|xlsx&...filters`
- `type`: `students`, `faculty`, `attendance`, `marks`, `grades`, `semester-results`, `department-performance`, `course-performance`, `event-participation`, `sports-participation`, `achievements`

**Settings & University Info** — admin writes, everyone reads
- `GET /settings` · `PUT /settings`
- `GET /university` · `PUT /university`

## Screens

### Public site
1. **Home** — header with logo and nav, hero, About, Vision & Mission, Chancellor/Principal message, Departments, Courses, Faculty, Facilities, Events, Fests, Cluster Activities, Sports, Latest Announcements, Academic Calendar preview, Contact, Campus location, Footer.
2. **About** — overview, history, vision, mission, objectives, leadership, administration, campus, infrastructure, labs, library, hostels, transport, cafeteria, medical, computer labs, sports facilities, auditorium, student activities, placement/training, clubs, student support.
3. **Departments**, **Courses**, **Events**, **Fests** (with previous-year history), **Contact** — public read-only pages.
4. **Login** — tabs for Student / Teacher / Admin. Identifier, password, Remember me (keeps token in localStorage; unchecked uses sessionStorage), Forgot password (shows "Contact the university office / Admin to reset your password"). Redirects by role.
5. **404** — anything unmatched.

### Dashboard shell
Left sidebar (collapses to a drawer on mobile), top bar with global search (admin), notification bell, user menu.

**Admin sidebar:** Dashboard, Students, Teachers, Departments, Courses, Attendance, Examinations, Marks & Grades, Results, Events, University Fests, Cluster Activities, Sports & Games, Clubs, Timetable, Academic Calendar, Announcements, Reports, University Information, Settings.

**Teacher sidebar:** Dashboard, My Profile, My Classes, Students, Attendance, Marks, Results, Timetable, Events, Activities, Announcements.

**Student sidebar:** Dashboard, My Profile, My Attendance, My Subjects, My Marks, My Grades, My Results, My Timetable, Examinations, Events, Fests, Activities, Sports, Clubs, Announcements.

### Admin screens
- **Dashboard** — stat cards (Total Students, Total Teachers, Departments, Courses, Active Students, Upcoming Events, Upcoming Exams), charts (attendance overview, department performance, grade distribution), recent results, sports overview, recent announcements.
- **Students** — searchable, filterable, paginated table. Add/edit in a modal form. Delete and deactivate behind a confirm dialog. Row click → **Student profile** with tabs: Personal, Academic, Attendance, Subjects, Marks, Grades, Results, Events, Activities, Achievements.
- **Teachers** — same table pattern. **Teacher profile**: personal, qualification, subjects, classes, timetable, student performance, attendance responsibilities, events/activities, workload.
- **Departments, Courses, Subjects, Academic Years, Teaching Assignments** — table + modal CRUD.
- **Attendance** — analytics by department/course/section, low-attendance list, drill-down to sheets.
- **Examinations** — exam list with publish toggle.
- **Marks & Grades** — marks sheets for any exam, grading rule editor.
- **Results** — generate, review, publish/unpublish by course + semester.
- **Events, Fests, Cluster Activities, Sports & Games (tournaments, teams, fixtures, results), Clubs** — table + modal CRUD.
- **Timetable** — weekly grid editor per course/semester/section, with clash errors shown inline.
- **Academic Calendar** — month and week view, add/edit entries.
- **Announcements** — compose with audience and category, pin, edit, delete.
- **Reports** — pick report type, filters, download PDF or Excel.
- **University Information** — edit all public content and placeholder fields.
- **Settings** — attendance thresholds, pass percent, current academic year, user accounts (activate/deactivate, reset password).

### Teacher screens
- **Dashboard** — my classes, today's timetable, low-attendance students, pending mark entry, class average charts.
- **My Profile**, **My Classes** (one card per teaching assignment).
- **Students** — only students in my classes; profile view + add remark.
- **Attendance** — select department → course → year → semester → section → subject → date; mark all present by default, toggle absentees, save.
- **Marks** — select exam → grid of students with max marks shown; inline validation; locked once published.
- **Results** — read-only results for my classes; class analytics.
- **Timetable**, **Events**, **Activities** (fests, clusters, sports, clubs), **Announcements** (read all, post to my classes).

### Student screens
- **Dashboard** — profile card (Student ID, department, course, year, semester), attendance % with coloured ring, latest SGPA/CGPA, today's timetable, upcoming exams, events, announcements, notifications.
- **My Profile** — read-only.
- **My Attendance** — overall and per-subject %, monthly chart.
- **My Subjects**, **My Marks** (by exam), **My Grades**.
- **My Results** — per semester: `Subject | Max Marks | Obtained Marks | Grade | Grade Point | Result`, plus total, percentage, SGPA, CGPA, semester result. Published only; unpublished shows "Results not yet published".
- **My Timetable**, **Examinations**, **Events** (with register button), **Fests**, **Activities**, **Sports** (own teams and achievements), **Clubs** (own memberships), **Announcements**.

Unauthenticated users on a dashboard route → `/login`. Logged-in users on another role's route → their own dashboard with a "You don't have access to that page" toast.

## Rules and constraints

- **Authorization lives on the server.** Every controller checks role, then scope. A teacher's scope is their `TeachingAssignment` records; a student's scope is their own `Student` document. The student or teacher ID always comes from `req.user`, never from the request body or query.
- Teachers cannot delete users, change permissions, edit other teachers, change university-wide config, or reach any admin route.
- Students cannot edit marks, grades, or attendance, see other students' data, or see unpublished marks or results.
- Deactivated users are rejected by `protect` even if their token is still valid.
- Passwords hashed with bcrypt (cost 10+). The password field is excluded from every response.
- Login is rate-limited (`express-rate-limit`, e.g. 10 attempts per 15 minutes per IP). Use `helmet`.
- All env vars come from `.env`. Nothing hardcoded. `.env` is gitignored; ship `.env.example`.
- Validate on the server, not just in the form (`express-validator`). Examples: required fields per model, enums, unique IDs, `0 ≤ obtained ≤ maxMarks`, attendance date not in future, endTime after startTime, semester within course range.
- Every API error returns `{ message }` (plus `errors` array for validation) with a correct HTTP status: `400` validation, `401` not logged in, `403` not allowed, `404` not found, `409` conflict. No stack traces in responses.
- CORS allows only the frontend origin, read from an env var.
- Bulk writes (attendance, marks) are a single request per sheet, not one request per student.
- Destructive actions use a confirm dialog. Every save shows a toast.
- Loading, empty, and error states everywhere. A new teacher with no assignments sees "No classes assigned yet", not a blank page.
- Desktop-first, works on mobile. Tables scroll horizontally inside their card on small screens.
- Visual identity: deep blue primary, white, light grey surfaces, gold accent used sparingly. Not overly colourful.
- Keep it plain: no Redux, no TypeScript, no component library, no Docker. React state and Context for auth. Recharts is the only UI dependency beyond Tailwind.
- Images are URL fields in v1. No file upload storage.

## Seed data

`npm run seed` in `server/` wipes and loads realistic demo data:

- 1 admin, 9 departments (CSE, IT, ECE, MECH, CIVIL, EEE, Management, Science, Arts), ~15 courses across UG/PG/Diploma/Certificate, subjects with credits
- ~30 teachers with teaching assignments and a clash-free timetable
- ~300 students across departments, years, and sections
- Two semesters of attendance, exams, and marks; one semester of published results
- Events, a current fest plus two previous-year fests, cluster activities, tournaments with fixtures and winners, 8 clubs with members, achievements, calendar entries, announcements
- University info with placeholder text; accreditation, affiliation, approvals, and contact numbers left empty

Seed passwords come from `SEED_DEFAULT_PASSWORD`. The README lists one demo login per role.

## Env vars

**server/.env**
```
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SEED_DEFAULT_PASSWORD=
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## Build order

1. Server scaffold, Mongo connection, health check route, error handler
2. All Mongoose models and indexes
3. Seed script
4. Auth: login, `protect`, `authorize`, scope helpers, account activation
5. Departments, courses, subjects, academic years, teaching assignments
6. Students and teachers CRUD with search, filters, pagination
7. Attendance sheet + summary + analytics
8. Exams, marks sheet, grading rules
9. Result generation, publish/unpublish
10. Events, fests, cluster activities, sports, clubs, achievements
11. Timetable with clash detection, academic calendar
12. Announcements and notifications
13. Dashboards and analytics endpoints
14. Reports (PDF/Excel)
15. University info, facilities, settings, public routes
16. Client scaffold, Tailwind theme, router, Axios instance with token interceptor (logs out on `401`)
17. Reusable components: Table, Pagination, Modal, ConfirmDialog, Toast, StatCard, EmptyState, Loader, FilterBar
18. Public site and login
19. Dashboard layout and role-based sidebar, `ProtectedRoute` and `RoleRoute`
20. Admin screens
21. Teacher screens
22. Student screens
23. Permission test pass (see below), responsive pass, UI polish
24. README, `.env.example`, `.gitignore`
25. Deploy

## Out of scope

Email/SMS sending, self-service password reset by email, file uploads, fee management, admissions workflow, library circulation, hostel allotment, online payments, OAuth, dark mode, mobile apps, multi-campus. Not in v1 — do not add them.

## Definition of done

- Admin can log in, create a department, course, subject, teacher, and student; assign the teacher to a class; build a timetable; create an exam; generate and publish results; post an announcement; and download a report in PDF and Excel.
- Teacher can log in, see only their classes, mark attendance, enter marks, add a remark, and post an announcement to their class — and gets `403` on every admin route and on students outside their classes, when called directly via the API, not just through the UI.
- Student can log in and see their profile, attendance, published results with SGPA/CGPA, timetable, events, and announcements — and gets `403` on other students' IDs and on every teacher/admin write route via the API.
- A deactivated account cannot log in or use an old token.
- Unpublished results are invisible to students; published exams are locked for teachers.
- Both halves are deployed and talking to each other over HTTPS.
- The repo has a README with a live link, screenshots, features, stack, demo logins per role, and local setup steps.
