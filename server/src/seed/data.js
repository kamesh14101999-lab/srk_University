const DEPARTMENTS = [
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Electronics & Communication Engineering', code: 'ECE' },
  { name: 'Mechanical Engineering', code: 'MECH' },
  { name: 'Civil Engineering', code: 'CIVIL' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE' },
  { name: 'Management Studies', code: 'MGMT' },
  { name: 'Science', code: 'SCI' },
  { name: 'Arts', code: 'ARTS' },
];

// keyed by department code
const COURSES = {
  CSE: [
    { name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE', degreeType: 'UG', durationYears: 4, totalSemesters: 8, intake: 120 },
    { name: 'M.Tech Computer Science & Engineering', code: 'MTECH-CSE', degreeType: 'PG', durationYears: 2, totalSemesters: 4, intake: 30 },
  ],
  IT: [{ name: 'B.Tech Information Technology', code: 'BTECH-IT', degreeType: 'UG', durationYears: 4, totalSemesters: 8, intake: 60 }],
  ECE: [{ name: 'B.Tech Electronics & Communication Engineering', code: 'BTECH-ECE', degreeType: 'UG', durationYears: 4, totalSemesters: 8, intake: 60 }],
  MECH: [
    { name: 'B.Tech Mechanical Engineering', code: 'BTECH-MECH', degreeType: 'UG', durationYears: 4, totalSemesters: 8, intake: 60 },
    { name: 'Diploma in Mechanical Engineering', code: 'DIP-MECH', degreeType: 'Diploma', durationYears: 3, totalSemesters: 6, intake: 30 },
  ],
  CIVIL: [{ name: 'B.Tech Civil Engineering', code: 'BTECH-CIVIL', degreeType: 'UG', durationYears: 4, totalSemesters: 8, intake: 60 }],
  EEE: [{ name: 'B.Tech Electrical & Electronics Engineering', code: 'BTECH-EEE', degreeType: 'UG', durationYears: 4, totalSemesters: 8, intake: 60 }],
  MGMT: [
    { name: 'Master of Business Administration', code: 'MBA', degreeType: 'PG', durationYears: 2, totalSemesters: 4, intake: 60 },
    { name: 'Certificate in Business Analytics', code: 'CERT-BA', degreeType: 'Certificate', durationYears: 1, totalSemesters: 2, intake: 40 },
  ],
  SCI: [
    { name: 'B.Sc Mathematics, Physics, Chemistry', code: 'BSC-MPC', degreeType: 'UG', durationYears: 3, totalSemesters: 6, intake: 60 },
    { name: 'M.Sc Chemistry', code: 'MSC-CHEM', degreeType: 'PG', durationYears: 2, totalSemesters: 4, intake: 20 },
  ],
  ARTS: [{ name: 'B.A. Economics, Political Science, History', code: 'BA-EPH', degreeType: 'UG', durationYears: 3, totalSemesters: 6, intake: 60 }],
};

const SUBJECT_AREAS = {
  'BTECH-CSE': ['Programming Fundamentals', 'Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Algorithms', 'Software Engineering', 'Web Technologies', 'Machine Learning', 'Compiler Design', 'Distributed Systems', 'Cloud Computing', 'Cyber Security', 'Mobile App Development', 'Project Work'],
  'MTECH-CSE': ['Advanced Algorithms', 'Advanced Databases', 'Research Methodology', 'Big Data Analytics', 'Advanced Computer Networks', 'Thesis Phase I', 'Thesis Phase II'],
  'BTECH-IT': ['Programming Fundamentals', 'Data Structures', 'Information Security', 'Web Technologies', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Software Testing', 'Cloud Computing', 'Mobile Computing', 'Project Work'],
  'BTECH-ECE': ['Circuit Theory', 'Electronic Devices', 'Digital Electronics', 'Signals & Systems', 'Communication Systems', 'Microprocessors', 'VLSI Design', 'Embedded Systems', 'Antenna Theory', 'Project Work'],
  'BTECH-MECH': ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Manufacturing Technology', 'Machine Design', 'Heat Transfer', 'Robotics', 'Automobile Engineering', 'CAD/CAM', 'Project Work'],
  'DIP-MECH': ['Engineering Drawing', 'Workshop Technology', 'Applied Mechanics', 'Thermal Engineering', 'Manufacturing Processes', 'Project Work'],
  'BTECH-CIVIL': ['Surveying', 'Building Materials', 'Structural Analysis', 'Geotechnical Engineering', 'Transportation Engineering', 'Concrete Technology', 'Environmental Engineering', 'Project Work'],
  'BTECH-EEE': ['Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems', 'Power Electronics', 'Electrical Measurements', 'Renewable Energy Systems', 'Project Work'],
  MBA: ['Principles of Management', 'Financial Accounting', 'Marketing Management', 'Organizational Behaviour', 'Business Statistics', 'Human Resource Management', 'Operations Management', 'Strategic Management'],
  'CERT-BA': ['Introduction to Analytics', 'Statistics for Business', 'Data Visualization', 'Applied Analytics Project'],
  'BSC-MPC': ['Mathematics I', 'Physics I', 'Chemistry I', 'Mathematics II', 'Physics II', 'Chemistry II', 'Mathematical Methods', 'Applied Physics'],
  'MSC-CHEM': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Research Project'],
  'BA-EPH': ['Microeconomics', 'Indian Political System', 'Modern Indian History', 'Macroeconomics', 'Comparative Politics', 'World History'],
};

const SPORTS = ['Cricket', 'Football', 'Volleyball', 'Basketball', 'Badminton', 'Chess', 'Athletics', 'Table Tennis'];

const CLUB_NAMES = [
  'Coding Club',
  'Robotics Club',
  'Literary & Debate Club',
  'Music Club',
  'Dance Club',
  'Photography Club',
  'Entrepreneurship Cell',
  'Social Service Club',
];

const FIRST_NAMES = [
  'Aditya', 'Priya', 'Rahul', 'Sneha', 'Arjun', 'Kavya', 'Vikram', 'Ananya', 'Rohan', 'Divya',
  'Karthik', 'Meera', 'Siddharth', 'Pooja', 'Nikhil', 'Shreya', 'Varun', 'Neha', 'Aakash', 'Riya',
  'Sanjay', 'Lakshmi', 'Manoj', 'Swathi', 'Harish', 'Deepika', 'Suresh', 'Anjali', 'Ravi', 'Nisha',
  'Kiran', 'Pavani', 'Naveen', 'Spoorthi', 'Gopal', 'Haritha', 'Praveen', 'Lavanya', 'Ajay', 'Keerthi',
];

const LAST_NAMES = [
  'Reddy', 'Rao', 'Sharma', 'Verma', 'Naidu', 'Kumar', 'Chowdary', 'Prasad', 'Varma', 'Patel',
  'Nair', 'Iyer', 'Gupta', 'Shetty', 'Pillai', 'Murthy', 'Raju', 'Sastry', 'Devi', 'Rani',
];

const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor'];

module.exports = {
  DEPARTMENTS,
  COURSES,
  SUBJECT_AREAS,
  SPORTS,
  CLUB_NAMES,
  FIRST_NAMES,
  LAST_NAMES,
  DESIGNATIONS,
};
