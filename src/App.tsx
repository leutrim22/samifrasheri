import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Staff from './pages/Staff';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <Navbar user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stafi" element={<Staff />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to={`/${user.role}`} /> : <Login onLogin={handleLogin} />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/student" 
              element={user?.role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/professor" 
              element={user?.role === 'professor' ? <ProfessorDashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
