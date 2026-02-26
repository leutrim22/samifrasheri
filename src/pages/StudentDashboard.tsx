import React, { useEffect, useState } from 'react';
import { User, Grade } from '../types';
import { Book, TrendingUp, Calendar, User as UserIcon, GraduationCap, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentDashboardProps {
  user: User;
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [profileRes, gradesRes] = await Promise.all([
        fetch(`/api/student/${user.id}/profile`),
        fetch(`/api/student/${user.id}/grades`)
      ]);
      setProfile(await profileRes.json());
      setGrades(await gradesRes.json());
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  // Group grades by subject
  const subjectsMap: Record<string, Record<number, number[]>> = {};
  grades.forEach(g => {
    if (!subjectsMap[g.subject_name]) subjectsMap[g.subject_name] = { 1: [], 2: [], 3: [], 4: [] };
    subjectsMap[g.subject_name][g.section].push(g.value);
  });

  const calculateSubjectAverage = (subjectGrades: Record<number, number[]>) => {
    const allValues = Object.values(subjectGrades).flat();
    if (allValues.length === 0) return 0;
    return (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(2);
  };

  const calculateOverallAverage = () => {
    const allValues = grades.map(g => g.value);
    if (allValues.length === 0) return 0;
    return (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.name} {profile?.surname}</h1>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1.5" /> {profile?.dob}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <GraduationCap className="h-4 w-4 mr-1.5" /> Viti {profile?.year}, Klasa {profile?.class_name}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 px-6 py-4 rounded-2xl text-center">
          <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Nota Mesatare</div>
          <div className="text-4xl font-black text-emerald-700">{calculateOverallAverage()}</div>
        </div>
      </motion.div>

      {/* Grades Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Book className="mr-2 h-5 w-5 text-emerald-600" /> Pasqyra e Notave
          </h2>
          <button className="flex items-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors">
            <Download className="h-4 w-4 mr-2" /> Shkarko Raportin (PDF)
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lënda</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tremujori I</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gjysmëvjetori</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tremujori II</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nota Përfundimtare</th>
                <th className="p-4 text-xs font-bold text-emerald-600 uppercase tracking-wider text-right">Mesatarja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(subjectsMap).map(([subject, sections]) => (
                <tr key={subject} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{subject}</td>
                  {[1, 2, 3, 4].map(section => (
                    <td key={section} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {sections[section as 1|2|3|4].map((v, i) => (
                          <span key={i} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                            v >= 4 ? 'bg-emerald-100 text-emerald-700' : 
                            v === 3 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {v}
                          </span>
                        ))}
                        {sections[section as 1|2|3|4].length === 0 && <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm">
                      {calculateSubjectAverage(sections)}
                    </span>
                  </td>
                </tr>
              ))}
              {Object.keys(subjectsMap).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                    Nuk ka nota të regjistruara ende.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Vijueshmëria</h3>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex items-end space-x-2">
            <div className="text-3xl font-black text-gray-900">98%</div>
            <div className="text-sm text-emerald-600 font-bold mb-1">+2% këtë muaj</div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
