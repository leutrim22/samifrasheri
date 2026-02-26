import React, { useEffect, useState } from 'react';
import { User, Assignment, ClassStudent } from '../types';
import { Users, BookOpen, ChevronRight, Plus, Save, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfessorDashboardProps {
  user: User;
}

export default function ProfessorDashboard({ user }: ProfessorDashboardProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedClass, setSelectedClass] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    student_id: '',
    section: '1',
    value: '5'
  });

  useEffect(() => {
    fetch(`/api/professor/${user.id}/assignments`)
      .then(res => res.json())
      .then(data => {
        setAssignments(data);
        setLoading(false);
      });
  }, [user.id]);

  const fetchStudents = async (assignment: Assignment) => {
    const res = await fetch(`/api/class/${assignment.class_id}/students?subjectId=${assignment.subject_id}`);
    setStudents(await res.json());
  };

  const handleClassSelect = async (assignment: Assignment) => {
    setSelectedClass(assignment);
    await fetchStudents(assignment);
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setSubmitting(true);
    try {
      await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: parseInt(gradeForm.student_id),
          subject_id: selectedClass.subject_id,
          section: parseInt(gradeForm.section),
          value: parseInt(gradeForm.value)
        })
      });
      setGradeForm({ ...gradeForm, student_id: '' });
      await fetchStudents(selectedClass);
    } catch (err) {
      alert('Gabim gjatë shtimit të notës');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!selectedClass || !confirm('A jeni të sigurt që dëshironi të fshini këtë notë?')) return;
    try {
      await fetch(`/api/grades/${gradeId}`, { method: 'DELETE' });
      await fetchStudents(selectedClass);
    } catch (err) {
      alert('Gabim gjatë fshirjes së notës');
    }
  };

  const calculateAverage = (grades: any[]) => {
    if (!grades || grades.length === 0) return '-';
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    return (sum / grades.length).toFixed(1);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8">
      {/* Sidebar: Classes */}
      <div className="lg:col-span-4 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-emerald-600" /> Klasat e Mia
        </h2>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <button
              key={assignment.id}
              onClick={() => handleClassSelect(assignment)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                selectedClass?.id === assignment.id 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                : 'bg-white border-gray-100 text-gray-700 hover:border-emerald-200'
              }`}
            >
              <div>
                <div className="font-bold">Klasa {assignment.class_name}</div>
                <div className={`text-xs ${selectedClass?.id === assignment.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                  Lënda: {assignment.subject_name} • Viti {assignment.class_year}
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 transition-transform ${selectedClass?.id === assignment.id ? 'translate-x-1' : 'text-gray-300 group-hover:text-emerald-600'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Student List & Grade Input */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {selectedClass ? (
            <motion.div
              key={selectedClass.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Plus className="mr-2 h-5 w-5 text-emerald-600" /> Vendos Notë të Re
                </h3>
                <form onSubmit={handleAddGrade} className="grid md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nxënësi</label>
                    <select
                      value={gradeForm.student_id}
                      onChange={(e) => setGradeForm({ ...gradeForm, student_id: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                      required
                    >
                      <option value="">Zgjidh nxënësin</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} {s.surname}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Periudha</label>
                    <select
                      value={gradeForm.section}
                      onChange={(e) => setGradeForm({ ...gradeForm, section: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                    >
                      <option value="1">Tremujori I</option>
                      <option value="2">Gjysmëvjetori</option>
                      <option value="3">Tremujori II</option>
                      <option value="4">Nota Përfundimtare</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nota (1-5)</label>
                    <select
                      value={gradeForm.value}
                      onChange={(e) => setGradeForm({ ...gradeForm, value: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="h-5 w-5 mr-2" /> {submitting ? 'Duke ruajtur...' : 'Ruaj Notën'}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-emerald-600" /> Pasqyra e Notave (Klasa {selectedClass.class_name})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nxënësi</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Tremujori I</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Gjysmëvjetori</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Tremujori II</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Nota Përf.</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Mesatarja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map((student) => {
                        const sections = [1, 2, 3, 4];
                        return (
                          <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                  {student.name[0]}{student.surname[0]}
                                </div>
                                <div className="font-bold text-gray-900 text-sm">{student.name} {student.surname}</div>
                              </div>
                            </td>
                            {sections.map(section => {
                              const sectionGrades = student.grades?.filter(g => g.section === section) || [];
                              return (
                                <td key={section} className="p-4 text-center">
                                  <div className="flex flex-wrap justify-center gap-1">
                                    {sectionGrades.map(grade => (
                                      <div key={grade.id} className="group relative">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">
                                          {grade.value}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteGrade(grade.id)}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                    {sectionGrades.length === 0 && <span className="text-gray-300 text-xs">-</span>}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                parseFloat(calculateAverage(student.grades || [])) >= 4.5 ? 'bg-emerald-100 text-emerald-700' :
                                parseFloat(calculateAverage(student.grades || [])) >= 3.5 ? 'bg-blue-100 text-blue-700' :
                                parseFloat(calculateAverage(student.grades || [])) >= 2.0 ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {calculateAverage(student.grades || [])}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="bg-emerald-50 p-4 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Zgjidhni një klasë</h3>
              <p className="text-gray-500 max-w-xs mt-2">
                Për të parë listën e nxënësve dhe për të vendosur nota, ju lutem zgjidhni njërën nga klasat në anën e majtë.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
