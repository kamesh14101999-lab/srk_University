require('dotenv').config();
const mongoose = require('mongoose');
const { mongoUri, seedDefaultPassword } = require('../config/env');
const {
  User,
  Department,
  Course,
  Subject,
  AcademicYear,
  Student,
  Teacher,
  TeachingAssignment,
  Attendance,
  Exam,
  Mark,
  GradingRule,
  Result,
  Event,
  Fest,
  ClusterActivity,
  Sport,
  Tournament,
  Team,
  Fixture,
  Club,
  ClubMember,
  Achievement,
  TimetableEntry,
  CalendarEntry,
  Announcement,
  Notification,
  Facility,
  UniversityInfo,
  Setting,
} = require('../models');
const { DEPARTMENTS, COURSES, SUBJECT_AREAS, SPORTS, CLUB_NAMES, FIRST_NAMES, LAST_NAMES, DESIGNATIONS } = require('./data');
const { generateResultsForStudents } = require('../services/results');

let nameCounter = 0;
function nextName() {
  const first = FIRST_NAMES[nameCounter % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(nameCounter / FIRST_NAMES.length) % LAST_NAMES.length];
  nameCounter += 1;
  return `${first} ${last}`;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function wipeDatabase() {
  const collections = [
    User, Department, Course, Subject, AcademicYear, Student, Teacher, TeachingAssignment,
    Attendance, Exam, Mark, GradingRule, Result, Event, Fest, ClusterActivity, Sport,
    Tournament, Team, Fixture, Club, ClubMember, Achievement, TimetableEntry, CalendarEntry,
    Announcement, Notification, Facility, UniversityInfo, Setting,
  ];
  for (const model of collections) {
    await model.deleteMany({});
  }
}

async function seedGradingRules() {
  await GradingRule.insertMany([
    { minPercent: 90, grade: 'O', gradePoint: 10 },
    { minPercent: 80, grade: 'A+', gradePoint: 9 },
    { minPercent: 70, grade: 'A', gradePoint: 8 },
    { minPercent: 60, grade: 'B+', gradePoint: 7 },
    { minPercent: 50, grade: 'B', gradePoint: 6 },
    { minPercent: 45, grade: 'C', gradePoint: 5 },
    { minPercent: 40, grade: 'P', gradePoint: 4 },
    { minPercent: 0, grade: 'F', gradePoint: 0 },
  ]);
}

async function seedSettings() {
  await Setting.insertMany([
    { key: 'attendanceThreshold', value: 75 },
    { key: 'attendanceWarning', value: 65 },
    { key: 'currentAcademicYear', value: '2026-27' },
    { key: 'passPercent', value: 40 },
  ]);
}

async function seedUniversityInfo() {
  await UniversityInfo.create({
    overview: 'SKR University is committed to providing quality education across engineering, management, science, and arts disciplines in Visakhapatnam, Andhra Pradesh.',
    history: 'Founded with the mission of building industry-ready graduates, SKR University has grown into a multi-disciplinary campus serving the local community.',
    vision: 'To be a center of excellence in higher education, research, and innovation.',
    mission: 'To empower students with knowledge, skills, and values needed to succeed in a global environment.',
    objectives: 'Deliver outcome-based education; foster research and innovation; build strong industry partnerships; nurture holistic student development.',
    leadership: [
      { name: 'Dr. Principal Name', designation: 'Principal', message: 'Welcome to SKR University, where we nurture talent and build futures.', photoUrl: '' },
    ],
    address: 'Visakhapatnam, Andhra Pradesh, India',
    email: '',
    phone: '',
    mapEmbedUrl: '',
    accreditation: '',
    affiliation: '',
    approvals: '',
    placementInfo: 'The placement cell works with industry partners to provide internship and placement opportunities for final-year students.',
    studentSupport: 'Academic counselling, mentoring, and grievance redressal support are available to all students.',
  });
}

async function seedFacilities() {
  await Facility.insertMany([
    { name: 'Central Library', category: 'library', description: 'A multi-floor library with digital and print resources.' },
    { name: 'Boys & Girls Hostel', category: 'hostel', description: 'On-campus residential facility with mess and common rooms.' },
    { name: 'Computer Labs', category: 'computer_lab', description: 'Fully equipped labs for programming and software courses.' },
    { name: 'University Transport', category: 'transport', description: 'Bus services connecting major points in the city.' },
    { name: 'Cafeteria', category: 'cafeteria', description: 'On-campus dining facility.' },
    { name: 'Medical Center', category: 'medical', description: 'First-aid and basic medical care on campus.' },
    { name: 'Sports Complex', category: 'sports', description: 'Grounds and courts for cricket, football, basketball, and more.' },
    { name: 'Auditorium', category: 'auditorium', description: 'Main auditorium for events, fests, and seminars.' },
  ]);
}

async function seedDepartmentsAndCourses() {
  const departments = {};
  for (const d of DEPARTMENTS) {
    departments[d.code] = await Department.create(d);
  }

  const courses = [];
  for (const deptCode of Object.keys(COURSES)) {
    for (const c of COURSES[deptCode]) {
      const course = await Course.create({ ...c, department: departments[deptCode]._id });
      courses.push(course);
    }
  }

  return { departments, courses };
}

async function seedSubjects(courses) {
  const subjectsByCourse = {};
  const perSemester = 4;

  for (const course of courses) {
    const areas = SUBJECT_AREAS[course.code] || ['General Subject'];
    const subjects = [];
    let globalIdx = 0;

    for (let sem = 1; sem <= course.totalSemesters; sem += 1) {
      for (let i = 0; i < perSemester; i += 1) {
        const wrap = Math.floor(globalIdx / areas.length);
        const base = areas[globalIdx % areas.length];
        const name = wrap === 0 ? base : `${base} (Advanced ${wrap + 1})`;
        globalIdx += 1;

        const isLab = /lab|project|workshop/i.test(name);
        const subject = await Subject.create({
          name,
          code: `${course.code}-S${sem}-${i + 1}`,
          course: course._id,
          semester: sem,
          credits: isLab ? 2 : randomInt(3, 4),
          type: isLab ? (name.toLowerCase().includes('project') ? 'elective' : 'lab') : 'theory',
        });
        subjects.push(subject);
      }
    }
    subjectsByCourse[course._id.toString()] = subjects;
  }
  return subjectsByCourse;
}

async function seedAcademicYears() {
  const previous = await AcademicYear.create({
    label: '2025-26',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2026-05-31'),
    isCurrent: false,
  });
  const current = await AcademicYear.create({
    label: '2026-27',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2027-05-31'),
    isCurrent: true,
  });
  return { previous, current };
}

async function seedAdmin() {
  await User.create({
    name: 'University Admin',
    email: 'admin@skruniversity.edu',
    password: seedDefaultPassword,
    role: 'admin',
  });
}

async function seedTeachers(departments, count = 30) {
  const teachers = [];
  const deptCodes = Object.keys(departments);

  for (let i = 0; i < count; i += 1) {
    const deptCode = pick(deptCodes, i);
    const name = nextName();
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}${i}@skruniversity.edu`;
    const user = await User.create({ name, email, password: seedDefaultPassword, role: 'teacher' });
    const teacher = await Teacher.create({
      user: user._id,
      employeeId: `SKRT${String(i + 1).padStart(3, '0')}`,
      department: departments[deptCode]._id,
      designation: pick(DESIGNATIONS, i),
      qualification: pick(['Ph.D.', 'M.Tech', 'M.E.', 'M.Sc', 'MBA'], i),
      specialization: '',
      experienceYears: randomInt(1, 20),
      joiningDate: new Date(2010 + randomInt(0, 14), randomInt(0, 11), randomInt(1, 28)),
      status: 'active',
    });
    teachers.push(teacher);
  }
  return teachers;
}

async function seedStudents(courses, count = 300) {
  const students = [];
  let seq = 1;

  const perCourse = Math.ceil(count / courses.length);

  for (const course of courses) {
    for (let i = 0; i < perCourse && students.length < count; i += 1) {
      const name = nextName();
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}${seq}@skruniversity.edu`;
      const year = randomInt(1, course.durationYears);
      const semester = Math.min(course.totalSemesters, (year - 1) * 2 + randomInt(1, 2));
      const section = pick(['A', 'B'], i);
      const admissionYear = 2026 - (year - 1);
      const deptCode = Object.keys(COURSES).find((code) => COURSES[code].some((c) => c.code === course.code));

      const user = await User.create({ name, email, password: seedDefaultPassword, role: 'student' });
      const student = await Student.create({
        user: user._id,
        studentId: `SKR${admissionYear}${course.code.replace(/[^A-Z]/g, '').slice(0, 4)}${String(seq).padStart(3, '0')}`,
        rollNumber: `${deptCode}${year}${String(seq).padStart(3, '0')}`,
        dob: new Date(2000 + randomInt(2, 8), randomInt(0, 11), randomInt(1, 28)),
        gender: pick(['male', 'female'], i),
        phone: '',
        address: 'Visakhapatnam, Andhra Pradesh',
        guardianName: nextName(),
        guardianPhone: '',
        emergencyContact: '',
        bloodGroup: pick(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'], i),
        department: course.department,
        course: course._id,
        year,
        semester,
        section,
        admissionYear,
        batch: `${admissionYear}-${admissionYear + course.durationYears}`,
        academicStatus: 'active',
      });
      students.push(student);
      seq += 1;
    }
  }

  return students;
}

// Creates assignments for each course's current student semesters (under the current academic
// year) AND the semester before that (under the previous academic year), so there is a teacher
// of record for both the in-progress semester and the already-completed one — needed to attach
// attendance/timetable data to the completed semester as well.
async function seedTeachingAssignments(courses, subjectsByCourse, students, teachers, academicYears) {
  const assignments = [];
  let teacherIdx = 0;

  async function createFor(course, semester, academicYear) {
    const semStudents = students.filter(
      (s) => s.course.toString() === course._id.toString() && s.semester === semester
    );
    if (semStudents.length === 0) return;

    const sections = [...new Set(semStudents.map((s) => s.section))];
    const subjects = (subjectsByCourse[course._id.toString()] || []).filter((sub) => sub.semester === semester);

    for (const section of sections) {
      for (const subject of subjects) {
        const teacher = teachers[teacherIdx % teachers.length];
        teacherIdx += 1;
        try {
          const assignment = await TeachingAssignment.create({
            teacher: teacher._id,
            subject: subject._id,
            course: course._id,
            semester,
            section,
            academicYear: academicYear._id,
          });
          assignments.push(assignment);
        } catch {
          // duplicate combo, skip
        }
      }
    }
  }

  for (const course of courses) {
    const courseStudents = students.filter((s) => s.course.toString() === course._id.toString());
    const semesters = [...new Set(courseStudents.map((s) => s.semester))];

    for (const semester of semesters) {
      await createFor(course, semester, academicYears.current);
      if (semester > 1) {
        await createFor(course, semester - 1, academicYears.previous);
      }
    }
  }

  return assignments;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = [
  ['09:00', '10:00'],
  ['10:00', '11:00'],
  ['11:15', '12:15'],
  ['13:00', '14:00'],
  ['14:00', '15:00'],
];

async function seedTimetable(assignments) {
  const teacherBusy = new Set();
  const classBusy = new Set();

  for (const assignment of assignments) {
    let placed = false;
    for (const day of DAYS) {
      for (const [startTime, endTime] of SLOTS) {
        const teacherKey = `${assignment.teacher}|${day}|${startTime}`;
        const classKey = `${assignment.course}|${assignment.semester}|${assignment.section}|${day}|${startTime}`;
        if (teacherBusy.has(teacherKey) || classBusy.has(classKey)) continue;

        await TimetableEntry.create({
          assignment: assignment._id,
          day,
          startTime,
          endTime,
          room: `R-${assignment.course.toString().slice(-4)}-${assignment.section}`,
        });
        teacherBusy.add(teacherKey);
        classBusy.add(classKey);
        placed = true;
        break;
      }
      if (placed) break;
    }
  }
}

// Weekday dates starting `startOffsetDays` after `anchorDate`, `count` of them, skipping Sun/Sat.
function weekdaysFrom(anchorDate, startOffsetDays, count) {
  const dates = [];
  const cursor = new Date(anchorDate.getTime() + startOffsetDays * 24 * 60 * 60 * 1000);
  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

async function seedAttendance(assignments, students, admin) {
  const classDates = weekdaysFrom(new Date('2026-06-15'), 14, 24);

  for (const assignment of assignments) {
    const classStudents = students.filter(
      (s) =>
        s.course.toString() === assignment.course.toString() &&
        s.semester === assignment.semester &&
        s.section === assignment.section
    );
    if (classStudents.length === 0) continue;

    const ops = [];
    for (const date of classDates) {
      for (const student of classStudents) {
        const status = Math.random() < 0.88 ? 'present' : 'absent';
        ops.push({
          updateOne: {
            filter: { student: student._id, subject: assignment.subject, date },
            update: {
              $setOnInsert: {
                student: student._id,
                subject: assignment.subject,
                assignment: assignment._id,
                date,
                status,
                markedBy: admin._id,
              },
            },
            upsert: true,
          },
        });
      }
    }
    if (ops.length > 0) await Attendance.bulkWrite(ops);
  }
}

async function seedExamsMarksAndResults(courses, subjectsByCourse, students, academicYears) {
  const { previous, current } = academicYears;

  for (const course of courses) {
    const courseStudents = students.filter((s) => s.course.toString() === course._id.toString());
    const semesters = [...new Set(courseStudents.map((s) => s.semester))];

    for (const semester of semesters) {
      const subjects = (subjectsByCourse[course._id.toString()] || []).filter((sub) => sub.semester === semester);
      const semesterStudents = courseStudents.filter((s) => s.semester === semester);
      if (subjects.length === 0 || semesterStudents.length === 0) continue;

      // Current semester: internal + midterm + semester exam, unpublished.
      await createExamsAndMarks(subjects, semesterStudents, course, semester, current, false);

      // Previous semester (if this student has progressed beyond semester 1): published + generate results.
      if (semester > 1) {
        const prevSemester = semester - 1;
        const prevSubjects = (subjectsByCourse[course._id.toString()] || []).filter(
          (sub) => sub.semester === prevSemester
        );
        if (prevSubjects.length > 0) {
          await createExamsAndMarks(prevSubjects, semesterStudents, course, prevSemester, previous, true);
          const prevExams = await Exam.find({ course: course._id, semester: prevSemester, academicYear: previous._id });
          await generateResultsForStudents({
            students: semesterStudents,
            subjects: prevSubjects,
            exams: prevExams,
            course: course._id,
            semester: prevSemester,
            academicYear: previous._id,
          });
          await Result.updateMany(
            { student: { $in: semesterStudents.map((s) => s._id) }, semester: prevSemester, academicYear: previous._id },
            { isPublished: true, publishedAt: new Date() }
          );
        }
      }
    }
  }
}

async function createExamsAndMarks(subjects, students, course, semester, academicYear, published) {
  const examTypes = [
    { type: 'internal', maxMarks: 20 },
    { type: 'midterm', maxMarks: 30 },
    { type: 'semester', maxMarks: 50 },
  ];

  for (const subject of subjects) {
    for (const examType of examTypes) {
      const exam = await Exam.create({
        name: `${examType.type.charAt(0).toUpperCase() + examType.type.slice(1)} - ${subject.name}`,
        type: examType.type,
        subject: subject._id,
        course: course._id,
        semester,
        academicYear: academicYear._id,
        date: academicYear.startDate ? new Date(academicYear.startDate.getTime() + 60 * 24 * 60 * 60 * 1000) : new Date(),
        maxMarks: examType.maxMarks,
        isPublished: published,
      });

      const admin = await User.findOne({ role: 'admin' });
      const marks = students.map((student) => {
        const isAbsent = Math.random() < 0.03;
        const pct = randomInt(40, 97) / 100;
        return {
          student: student._id,
          exam: exam._id,
          obtained: isAbsent ? 0 : Math.round(examType.maxMarks * pct),
          isAbsent,
          enteredBy: admin._id,
        };
      });
      if (marks.length > 0) await Mark.insertMany(marks);
    }
  }
}

async function seedEvents(teachers, students) {
  const now = new Date();
  const types = ['cultural', 'technical', 'workshop', 'seminar', 'conference', 'guest_lecture', 'student_activity', 'competition'];
  const events = [];

  for (let i = 0; i < 10; i += 1) {
    const daysOffset = randomInt(-60, 90);
    const date = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const status = date < now ? 'completed' : 'upcoming';
    const participants = students.slice(i * 5, i * 5 + randomInt(5, 15)).map((s) => s._id);

    const event = await Event.create({
      name: `${pick(types, i).replace('_', ' ')} event ${i + 1}`,
      type: pick(types, i),
      description: 'A university-organized activity for students and faculty.',
      date,
      startTime: '10:00',
      endTime: '13:00',
      venue: 'Main Auditorium',
      organizer: 'SKR University',
      coordinator: teachers[i % teachers.length]._id,
      registrationRequired: i % 2 === 0,
      participants,
      status,
      imageUrls: [],
    });
    events.push(event);
  }
  return events;
}

async function seedFests(students) {
  const currentYear = 2026;
  const fests = [];

  for (let i = 0; i < 3; i += 1) {
    const year = currentYear - i;
    const fest = await Fest.create({
      name: `SKR Utsav ${year}`,
      year,
      description: 'Annual cultural and technical fest of SKR University.',
      startDate: new Date(`${year}-11-10`),
      endDate: new Date(`${year}-11-12`),
      venue: 'University Campus',
      programs: [
        { title: 'Dance Competition', category: 'cultural', date: new Date(`${year}-11-10`), venue: 'Open Air Theatre' },
        { title: 'Hackathon', category: 'technical', date: new Date(`${year}-11-11`), venue: 'Computer Labs' },
        { title: 'Cricket Tournament', category: 'sports', date: new Date(`${year}-11-12`), venue: 'Sports Ground' },
      ],
      registrationOpen: i === 0,
      participants: students.slice(0, 30).map((s) => s._id),
      winners:
        i > 0
          ? [
              { program: 'Dance Competition', position: '1st', student: students[0]._id },
              { program: 'Hackathon', position: '1st', teamName: 'Code Warriors' },
            ]
          : [],
      galleryUrls: [],
    });
    fests.push(fest);
  }
  return fests;
}

async function seedClusterActivities(departments, students) {
  const deptList = Object.values(departments);
  const activities = [];
  for (let i = 0; i < 5; i += 1) {
    const activity = await ClusterActivity.create({
      clusterName: `Cluster ${i + 1}`,
      activityName: `Inter-department activity ${i + 1}`,
      activityType: pick(['Technical Quiz', 'Paper Presentation', 'Poster Making', 'Debate'], i),
      date: new Date(2026, randomInt(0, 11), randomInt(1, 28)),
      venue: 'Seminar Hall',
      organizer: 'Cluster Committee',
      departments: [deptList[i % deptList.length]._id, deptList[(i + 1) % deptList.length]._id],
      participants: students.slice(i * 3, i * 3 + 6).map((s) => s._id),
      winners: [{ position: '1st', student: students[i]._id }],
      results: 'Completed successfully with good participation.',
      certificateUrls: [],
      photoUrls: [],
    });
    activities.push(activity);
  }
  return activities;
}

async function seedSports(departments, students, teachers) {
  const sports = [];
  for (const name of SPORTS) {
    sports.push(await Sport.create({ name, description: `University-level ${name} activities and tournaments.` }));
  }

  const deptList = Object.values(departments);

  for (let i = 0; i < 3; i += 1) {
    const sport = sports[i % sports.length];
    const tournament = await Tournament.create({
      name: `${sport.name} Championship 2026`,
      sport: sport._id,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-15'),
      venue: 'Sports Complex',
      status: i === 0 ? 'completed' : 'upcoming',
    });

    const teams = [];
    for (let t = 0; t < 4; t += 1) {
      const dept = deptList[t % deptList.length];
      const deptStudents = students.filter((s) => s.department.toString() === dept._id.toString());
      const team = await Team.create({
        name: `${dept.code} Warriors`,
        sport: sport._id,
        tournament: tournament._id,
        department: dept._id,
        captain: deptStudents[0]?._id,
        players: deptStudents.slice(0, 6).map((s) => s._id),
        coach: teachers[t % teachers.length]._id,
      });
      teams.push(team);
    }

    if (i === 0 && teams.length >= 2) {
      await Fixture.create({
        tournament: tournament._id,
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        date: new Date('2026-09-10'),
        venue: 'Sports Complex',
        scoreA: 3,
        scoreB: 1,
        winner: teams[0]._id,
        status: 'completed',
      });
      tournament.winnerTeam = teams[0]._id;
      await tournament.save();
    } else if (teams.length >= 2) {
      await Fixture.create({
        tournament: tournament._id,
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        date: new Date('2026-12-01'),
        venue: 'Sports Complex',
        status: 'scheduled',
      });
    }
  }
}

async function seedClubs(teachers, students) {
  for (let i = 0; i < CLUB_NAMES.length; i += 1) {
    const club = await Club.create({
      name: CLUB_NAMES[i],
      description: `The ${CLUB_NAMES[i]} brings together students with a shared interest.`,
      facultyCoordinator: teachers[i % teachers.length]._id,
      studentCoordinator: students[i]._id,
      activities: [
        { title: `${CLUB_NAMES[i]} Orientation`, date: new Date('2026-08-05'), description: 'Welcome session for new members.' },
        { title: `${CLUB_NAMES[i]} Showcase`, date: new Date('2026-11-20'), description: 'Annual showcase event.' },
      ],
    });

    const members = students.slice(i * 8, i * 8 + randomInt(5, 10));
    for (const student of members) {
      await ClubMember.create({ club: club._id, student: student._id, role: 'member' });
    }
  }
}

async function seedAchievements(students) {
  const categories = ['academic', 'sports', 'cultural', 'technical', 'club', 'other'];
  for (let i = 0; i < 15; i += 1) {
    await Achievement.create({
      student: students[i]._id,
      title: `Achievement ${i + 1}`,
      category: pick(categories, i),
      date: new Date(2026, randomInt(0, 11), randomInt(1, 28)),
      sourceType: '',
      sourceId: null,
    });
  }
}

async function seedCalendar() {
  await CalendarEntry.insertMany([
    { title: 'Semester Begins', type: 'semester_start', startDate: new Date('2026-06-15') },
    { title: 'Mid-Term Exams', type: 'internal_exam', startDate: new Date('2026-08-10'), endDate: new Date('2026-08-17') },
    { title: 'SKR Utsav 2026', type: 'fest', startDate: new Date('2026-11-10'), endDate: new Date('2026-11-12') },
    { title: 'Semester End Exams', type: 'semester_exam', startDate: new Date('2026-11-25'), endDate: new Date('2026-12-05') },
    { title: 'Winter Break', type: 'holiday', startDate: new Date('2026-12-20'), endDate: new Date('2027-01-02') },
    { title: 'Results Declaration', type: 'results', startDate: new Date('2027-01-10') },
  ]);
}

async function seedAnnouncements() {
  const admin = await User.findOne({ role: 'admin' });
  await Announcement.insertMany([
    {
      title: 'Welcome to the new academic year',
      body: 'We welcome all students and faculty to the 2026-27 academic year.',
      category: 'general',
      audience: 'all',
      createdBy: admin._id,
      isPinned: true,
    },
    {
      title: 'Mid-Term Exam Schedule Released',
      body: 'The mid-term examination schedule has been published. Please check your timetable.',
      category: 'exam',
      audience: 'students',
      createdBy: admin._id,
      isPinned: false,
    },
    {
      title: 'Faculty Meeting',
      body: 'All faculty are requested to attend the department meeting this Friday.',
      category: 'academic',
      audience: 'teachers',
      createdBy: admin._id,
      isPinned: false,
    },
  ]);
}

async function run() {
  if (!mongoUri) {
    console.error('MONGO_URI is not set. Add it to server/.env before seeding.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('[seed] Connected to MongoDB');

  console.log('[seed] Wiping existing data...');
  await wipeDatabase();

  console.log('[seed] Grading rules, settings, university info, facilities...');
  await seedGradingRules();
  await seedSettings();
  await seedUniversityInfo();
  await seedFacilities();

  console.log('[seed] Departments and courses...');
  const { departments, courses } = await seedDepartmentsAndCourses();

  console.log('[seed] Subjects...');
  const subjectsByCourse = await seedSubjects(courses);

  console.log('[seed] Academic years...');
  const academicYears = await seedAcademicYears();

  console.log('[seed] Admin user...');
  await seedAdmin();

  console.log('[seed] Teachers...');
  const teachers = await seedTeachers(departments, 30);

  console.log('[seed] Students...');
  const students = await seedStudents(courses, 300);

  console.log('[seed] Teaching assignments...');
  const assignments = await seedTeachingAssignments(courses, subjectsByCourse, students, teachers, academicYears);
  const currentAssignments = assignments.filter((a) => a.academicYear.toString() === academicYears.current._id.toString());

  console.log('[seed] Timetable...');
  await seedTimetable(currentAssignments);

  console.log('[seed] Attendance...');
  const adminUser = await User.findOne({ role: 'admin' });
  await seedAttendance(assignments, students, adminUser);

  console.log('[seed] Exams, marks, and results...');
  await seedExamsMarksAndResults(courses, subjectsByCourse, students, academicYears);

  console.log('[seed] Events...');
  const events = await seedEvents(teachers, students);

  console.log('[seed] Fests...');
  await seedFests(students);

  console.log('[seed] Cluster activities...');
  await seedClusterActivities(departments, students);

  console.log('[seed] Sports, tournaments, teams, fixtures...');
  await seedSports(departments, students, teachers);

  console.log('[seed] Clubs...');
  await seedClubs(teachers, students);

  console.log('[seed] Achievements...');
  await seedAchievements(students);

  console.log('[seed] Academic calendar...');
  await seedCalendar();

  console.log('[seed] Announcements...');
  await seedAnnouncements();

  console.log('[seed] Done.');
  console.log(`[seed] Departments: ${Object.keys(departments).length}, Courses: ${courses.length}, Teachers: ${teachers.length}, Students: ${students.length}, Events: ${events.length}`);
  console.log(`[seed] Demo login password for all seeded accounts: ${seedDefaultPassword}`);
  console.log('[seed] Admin login: admin@skruniversity.edu');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
