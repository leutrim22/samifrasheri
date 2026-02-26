import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("school_v5.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- 'admin', 'professor', 'student'
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    dob TEXT,
    year INTEGER,
    class_id INTEGER,
    FOREIGN KEY (class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS professor_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    professor_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    FOREIGN KEY (professor_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    section INTEGER NOT NULL, -- 1: Tremujori i parë, 2: Gjysmëvjetori, 3: Tremujori i dytë, 4: Nota përfundimtare
    value INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL, -- 'present', 'absent', 'late'
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  // Admin
  db.prepare("INSERT INTO users (email, password, role, name, surname) VALUES (?, ?, ?, ?, ?)").run(
    "admin@school.edu",
    "admin123",
    "admin",
    "Admin",
    "User"
  );

  // Classes
  const classIds = [];
  for (let y = 1; y <= 4; y++) {
    for (let c = 1; c <= 3; c++) {
      const info = db.prepare("INSERT INTO classes (name, year) VALUES (?, ?)").run(`${y}-${c}`, y);
      classIds.push(info.lastInsertRowid);
    }
  }

  // Subjects
  const subjects = [
    "Matematikë", "Gjuhë Shqipe", "Gjuhë Angleze", "Fizikë", "Kimi", 
    "Biologji", "Histori", "Gjeografi", "Informatikë", "Edukatë Fizike",
    "Sociologji", "Filozofi"
  ];
  const subjectIds = subjects.map(s => db.prepare("INSERT INTO subjects (name) VALUES (?)").run(s).lastInsertRowid);

  // Professor
  const profId = db.prepare("INSERT INTO users (email, password, role, name, surname) VALUES (?, ?, ?, ?, ?)").run(
    "prof@school.edu",
    "prof123",
    "professor",
    "Arben",
    "Krasniqi"
  ).lastInsertRowid;

  // Assign professor to some classes
  db.prepare("INSERT INTO professor_assignments (professor_id, subject_id, class_id) VALUES (?, ?, ?)").run(profId, subjectIds[0], classIds[0]);
  db.prepare("INSERT INTO professor_assignments (professor_id, subject_id, class_id) VALUES (?, ?, ?)").run(profId, subjectIds[0], classIds[6]); // 3-1

  // Student
  const studentId = db.prepare("INSERT INTO users (email, password, role, name, surname, dob, year, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    "student@school.edu",
    "student123",
    "student",
    "Driton",
    "Berisha",
    "2008-05-15",
    3,
    classIds[6] // 3-1
  ).lastInsertRowid;

  // Add more students to the same class for professor testing
  const names = ["Agim", "Besa", "Fatmir", "Gresa", "Ilir"];
  const surnames = ["Hoxha", "Gashi", "Leka", "Rama", "Zeka"];
  for (let i = 0; i < 5; i++) {
    db.prepare("INSERT INTO users (email, password, role, name, surname, dob, year, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      `student_3_1_${i}@school.edu`,
      "student123",
      "student",
      names[i],
      surnames[i],
      "2008-06-20",
      3,
      classIds[6]
    );
  }

  // Add students to Class 1-1 as well
  const names1 = ["Luan", "Teuta", "Valon", "Zana"];
  const surnames1 = ["Krasniqi", "Morina", "Shala", "Bytyqi"];
  for (let i = 0; i < 4; i++) {
    db.prepare("INSERT INTO users (email, password, role, name, surname, dob, year, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      `student_1_1_${i}@school.edu`,
      "student123",
      "student",
      names1[i],
      surnames1[i],
      "2010-09-10",
      1,
      classIds[0]
    );
  }

  // Add some initial grades for the demo student
  const demoSubjectIds = subjectIds.slice(0, 5);
  demoSubjectIds.forEach((sid, index) => {
    // Add 2-3 grades per subject in different sections
    db.prepare("INSERT INTO grades (student_id, subject_id, section, value) VALUES (?, ?, ?, ?)").run(studentId, sid, 1, 4 + (index % 2));
    db.prepare("INSERT INTO grades (student_id, subject_id, section, value) VALUES (?, ?, ?, ?)").run(studentId, sid, 1, 5);
    db.prepare("INSERT INTO grades (student_id, subject_id, section, value) VALUES (?, ?, ?, ?)").run(studentId, sid, 2, 4);
  });

  // Add some attendance data
  const dates = ["2025-09-01", "2025-09-02", "2025-09-03", "2025-09-04", "2025-09-05"];
  dates.forEach(date => {
    db.prepare("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)").run(studentId, date, "present");
  });
  db.prepare("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)").run(studentId, "2025-09-08", "absent");

  // News
  db.prepare("INSERT INTO news (title, content, date, category) VALUES (?, ?, ?, ?)").run(
    "Mirësevini në SHMK Gjimnazi \"Sami Frashëri\"",
    "Viti i ri shkollor fillon me sukses. Mirësevini në uebfaqen tonë të re bashkëkohore!",
    "2025-08-25",
    "Lajme"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Auth API
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Kredencialet e gabuara" });
    }
  });

  // Student API
  app.get("/api/student/:id/grades", (req, res) => {
    const grades = db.prepare(`
      SELECT g.*, s.name as subject_name 
      FROM grades g 
      JOIN subjects s ON g.subject_id = s.id 
      WHERE g.student_id = ?
    `).all(req.params.id);
    res.json(grades);
  });

  app.get("/api/student/:id/profile", (req, res) => {
    const profile = db.prepare(`
      SELECT u.*, c.name as class_name 
      FROM users u 
      LEFT JOIN classes c ON u.class_id = c.id 
      WHERE u.id = ?
    `).get(req.params.id);
    res.json(profile);
  });

  // Professor API
  app.get("/api/professor/:id/assignments", (req, res) => {
    const assignments = db.prepare(`
      SELECT pa.*, c.name as class_name, c.year as class_year, s.name as subject_name
      FROM professor_assignments pa
      JOIN classes c ON pa.class_id = c.id
      JOIN subjects s ON pa.subject_id = s.id
      WHERE pa.professor_id = ?
    `).all(req.params.id);
    res.json(assignments);
  });

  app.get("/api/class/:classId/students", (req, res) => {
    const { subjectId } = req.query;
    const students = db.prepare("SELECT id, name, surname FROM users WHERE class_id = ? AND role = 'student'").all(req.params.classId) as any[];
    
    if (subjectId) {
      const studentsWithGrades = students.map(student => {
        const grades = db.prepare("SELECT * FROM grades WHERE student_id = ? AND subject_id = ?").all(student.id, subjectId);
        return { ...student, grades };
      });
      res.json(studentsWithGrades);
    } else {
      res.json(students);
    }
  });

  app.delete("/api/grades/:id", (req, res) => {
    db.prepare("DELETE FROM grades WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/grades", (req, res) => {
    const { student_id, subject_id, section, value } = req.body;
    db.prepare("INSERT INTO grades (student_id, subject_id, section, value) VALUES (?, ?, ?, ?)").run(student_id, subject_id, section, value);
    res.json({ success: true });
  });

  // Public API
  app.get("/api/news", (req, res) => {
    const news = db.prepare("SELECT * FROM news ORDER BY date DESC").all();
    res.json(news);
  });

  app.get("/api/staff", (req, res) => {
    const staff = db.prepare(`
      SELECT u.id, u.name, u.surname, u.role, u.email, 
             GROUP_CONCAT(s.name) as subjects
      FROM users u
      LEFT JOIN professor_assignments pa ON u.id = pa.professor_id
      LEFT JOIN subjects s ON pa.subject_id = s.id
      WHERE u.role IN ('professor', 'admin')
      GROUP BY u.id
    `).all();
    res.json(staff);
  });

  // Admin API
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare(`
      SELECT u.id, u.email, u.role, u.name, u.surname, c.name as class_name 
      FROM users u
      LEFT JOIN classes c ON u.class_id = c.id
    `).all();
    res.json(users);
  });

  app.get("/api/admin/classes", (req, res) => {
    const classes = db.prepare(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM users WHERE class_id = c.id AND role = 'student') as student_count
      FROM classes c
    `).all();
    res.json(classes);
  });

  app.get("/api/admin/students-detailed", (req, res) => {
    const students = db.prepare(`
      SELECT u.id, u.name, u.surname, u.email, c.name as class_name
      FROM users u
      LEFT JOIN classes c ON u.class_id = c.id
      WHERE u.role = 'student'
    `).all() as any[];

    const detailed = students.map(s => {
      const grades = db.prepare(`
        SELECT g.*, sub.name as subject_name 
        FROM grades g 
        JOIN subjects s ON g.subject_id = s.id 
        JOIN subjects sub ON g.subject_id = sub.id
        WHERE g.student_id = ?
      `).all(s.id);
      
      const attendance = db.prepare("SELECT * FROM attendance WHERE student_id = ?").all(s.id);
      
      return { ...s, grades, attendance };
    });

    res.json(detailed);
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM grades WHERE student_id = ?").run(req.params.id);
    db.prepare("DELETE FROM attendance WHERE student_id = ?").run(req.params.id);
    db.prepare("DELETE FROM professor_assignments WHERE professor_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/classes", (req, res) => {
    const { name, year } = req.body;
    db.prepare("INSERT INTO classes (name, year) VALUES (?, ?)").run(name, year);
    res.json({ success: true });
  });

  app.post("/api/admin/users", (req, res) => {
    const { email, password, role, name, surname, dob, year, class_id } = req.body;
    db.prepare("INSERT INTO users (email, password, role, name, surname, dob, year, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      email, password, role, name, surname, dob, year, class_id
    );
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
