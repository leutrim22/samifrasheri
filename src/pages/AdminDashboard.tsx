import React, { useEffect, useState } from 'react';
import { User, Role } from '../types';
import { Users, UserPlus, Shield, Settings, Trash2, Search, Filter, BookOpen, Plus, GraduationCap, Calendar, AlertCircle, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClassData {
  id: number;
  name: string;
  year: number;
  student_count: number;
}

interface DetailedStudent extends User {
  grades: any[];
  attendance: any[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [detailedStudents, setDetailedStudents] = useState<DetailedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'students'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DetailedStudent | null>(null);

  // Form states
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    role: 'student' as Role,
    name: '',
    surname: '',
    class_id: ''
  });

  const [classForm, setClassForm] = useState({
    name: '',
    year: '1'
  });

  const fetchData = async () => {
    setLoading(true);
    const [uRes, cRes, sRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/classes'),
      fetch('/api/admin/students-detailed')
    ]);
    setUsers(await uRes.json());
    setClasses(await cRes.json());
    setDetailedStudents(await sRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!confirm('A jeni të sigurt që dëshironi të fshini këtë përdorues? Të gjitha të dhënat e ndërlidhura do të fshihen.')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userForm,
        class_id: userForm.class_id ? parseInt(userForm.class_id) : null,
        year: userForm.class_id ? classes.find(c => c.id === parseInt(userForm.class_id))?.year : null
      })
    });
    setShowUserModal(false);
    setUserForm({ email: '', password: '', role: 'student', name: '', surname: '', class_id: '' });
    fetchData();
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...classForm,
        year: parseInt(classForm.year)
      })
    });
    setShowClassModal(false);
    setClassForm({ name: '', year: '1' });
    fetchData();
  };

  const filteredUsers = users.filter(u => 
    `${u.name} ${u.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = detailedStudents.filter(s => {
    const matchesSearch = `${s.name} ${s.surname}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || s.class_name === classFilter;
    return matchesSearch && matchesClass;
  });

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Paneli i Administratorit</h1>
          <p className="text-gray-500 mt-1">Menaxhimi qendror i nxënësve, profesorëve dhe strukturës shkollore.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowClassModal(true)}
            className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Shto Klasë
          </button>
          <button 
            onClick={() => setShowUserModal(true)}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center shadow-lg shadow-emerald-100"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Regjistro Përdorues
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'users', label: 'Përdoruesit', icon: Users },
          { id: 'classes', label: 'Klasat', icon: BookOpen },
          { id: 'students', label: 'Pasqyra e Nxënësve', icon: GraduationCap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-6 py-4 border-b-2 transition-all font-bold text-sm ${
              activeTab === tab.id 
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Kërko sipas emrit ose email-it..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Përdoruesi</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Roli</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Klasa</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Veprimet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                              {user.name[0]}{user.surname[0]}
                            </div>
                            <div className="font-bold text-gray-900 text-sm">{user.name} {user.surname}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'professor' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">{user.class_name || '-'}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'classes' && (
          <motion.div 
            key="classes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {classes.map(c => (
              <button 
                key={c.id} 
                onClick={() => {
                  setClassFilter(c.name);
                  setActiveTab('students');
                }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Viti {c.year}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Klasa {c.name}</h3>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" /> {c.student_count} Nxënës
                </div>
                <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  Shiko nxënësit <ChevronRight className="h-3 w-3 ml-1" />
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div 
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Kërko nxënësin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
                <select 
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="p-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm font-medium bg-white"
                >
                  <option value="all">Të gjitha klasat</option>
                  {classes.map(c => <option key={c.id} value={c.name}>Klasa {c.name}</option>)}
                </select>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Duke treguar <span className="text-emerald-600 font-bold">{filteredStudents.length}</span> nxënës
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nxënësi</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Klasa</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Nota Mesatare</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Mungesat</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Statusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((student) => {
                      const avg = student.grades.length > 0 
                        ? (student.grades.reduce((acc, g) => acc + g.value, 0) / student.grades.length).toFixed(1)
                        : '-';
                      const absences = student.attendance.filter(a => a.status === 'absent').length;
                      
                      return (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900 text-sm">{student.name} {student.surname}</div>
                            <div className="text-xs text-gray-400">{student.email}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 font-medium">{student.class_name}</td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-emerald-600">{avg}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`font-bold ${absences > 5 ? 'text-red-600' : 'text-gray-600'}`}>{absences}</span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button 
                                onClick={() => setSelectedStudent(student)}
                                className="text-emerald-600 font-bold text-xs hover:underline"
                              >
                                Detajet
                              </button>
                              <div className="flex items-center space-x-1">
                                {absences > 10 ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                <span className="text-xs font-medium text-gray-500">{absences > 10 ? 'Kritike' : 'Rregullt'}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Regjistro Përdorues</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Emri</label>
                  <input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mbiemri</label>
                  <input required value={userForm.surname} onChange={e => setUserForm({...userForm, surname: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Fjalëkalimi</label>
                <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Roli</label>
                  <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as Role})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500">
                    <option value="student">Nxënës</option>
                    <option value="professor">Profesor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {userForm.role === 'student' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Klasa</label>
                    <select value={userForm.class_id} onChange={e => setUserForm({...userForm, class_id: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500">
                      <option value="">Zgjidh klasën</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all mt-4 shadow-lg shadow-emerald-100">
                Regjistro Përdoruesin
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shto Klasë të Re</h2>
              <button onClick={() => setShowClassModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Emri i Klasës (p.sh. 1-1)</label>
                <input required placeholder="p.sh. 1-1" value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Viti</label>
                <select value={classForm.year} onChange={e => setClassForm({...classForm, year: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500">
                  <option value="1">Viti 1</option>
                  <option value="2">Viti 2</option>
                  <option value="3">Viti 3</option>
                  <option value="4">Viti 4</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all mt-4 shadow-lg shadow-emerald-100">
                Krijo Klasën
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">
                  {selectedStudent.name[0]}{selectedStudent.surname[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name} {selectedStudent.surname}</h2>
                  <p className="text-gray-500 text-sm font-medium">Klasa {selectedStudent.class_name} • {selectedStudent.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-xl transition-all">
                <XCircle className="h-8 w-8" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Grades Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-emerald-600" /> Të gjitha Notat
                </h3>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lënda</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Periudha</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Nota</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedStudent.grades.length > 0 ? selectedStudent.grades.map(g => (
                        <tr key={g.id}>
                          <td className="p-4 text-sm font-bold text-gray-900">{g.subject_name}</td>
                          <td className="p-4 text-sm text-gray-600 text-center">
                            {g.section === 1 ? 'Tremujori I' : g.section === 2 ? 'Gjysmëvjetori' : g.section === 3 ? 'Tremujori II' : 'Përfundimtare'}
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                              {g.value}
                            </span>
                          </td>
                          <td className="p-4 text-right text-xs text-gray-400">
                            {new Date(g.created_at).toLocaleDateString('sq-AL')}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 text-sm italic">Nuk ka nota të regjistruara.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" /> Historia e Mungesave
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedStudent.attendance.map(a => (
                    <div key={a.id} className={`p-4 rounded-2xl border flex items-center justify-between ${
                      a.status === 'absent' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
                    }`}>
                      <div className="text-xs font-bold text-gray-600">{new Date(a.date).toLocaleDateString('sq-AL')}</div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        a.status === 'absent' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {a.status === 'absent' ? 'Mungesë' : 'Prezent'}
                      </span>
                    </div>
                  ))}
                  {selectedStudent.attendance.length === 0 && (
                    <div className="col-span-full p-8 text-center text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-2xl">
                      Nuk ka të dhëna për vijueshmërinë.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
