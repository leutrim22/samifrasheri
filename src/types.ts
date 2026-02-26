export type Role = 'admin' | 'professor' | 'student';

export interface User {
  id: number;
  email: string;
  role: Role;
  name: string;
  surname: string;
  dob?: string;
  year?: number;
  class_id?: number;
  class_name?: string;
  subjects?: string; // Comma separated for staff list
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
}

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  subject_name: string;
  section: 1 | 2 | 3 | 4; // 1: Tremujori 1, 2: Gjysmëvjetori, 3: Tremujori 2, 4: Nota përfundimtare
  value: number;
  created_at: string;
}

export interface Assignment {
  id: number;
  professor_id: number;
  subject_id: number;
  subject_name: string;
  class_id: number;
  class_name: string;
  class_year: number;
}

export interface ClassStudent {
  id: number;
  name: string;
  surname: string;
  grades?: Grade[];
}
