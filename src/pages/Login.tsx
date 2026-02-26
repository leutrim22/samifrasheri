import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
        if (data.role === 'student') navigate('/student');
        else if (data.role === 'professor') navigate('/professor');
        else if (data.role === 'admin') navigate('/admin');
      } else {
        setError(data.error || 'Dështoi kyçja');
      }
    } catch (err) {
      setError('Gabim në server');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    let demoEmail = '';
    let demoPassword = '';

    if (role === 'admin') {
      demoEmail = 'admin@school.edu';
      demoPassword = 'admin123';
    } else if (role === 'professor') {
      demoEmail = 'prof@school.edu';
      demoPassword = 'prof123';
    } else if (role === 'student') {
      demoEmail = 'student@school.edu';
      demoPassword = 'student123';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    
    // We can't easily trigger the form submit event manually with the right context here, 
    // so we'll just call the login logic directly.
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
        if (data.role === 'student') navigate('/student');
        else if (data.role === 'professor') navigate('/professor');
        else if (data.role === 'admin') navigate('/admin');
      } else {
        setError(data.error || 'Dështoi kyçja');
      }
    } catch (err) {
      setError('Gabim në server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-600 p-3 rounded-2xl mb-4 shadow-lg shadow-emerald-200">
              <School className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Mirësevini përsëri</h1>
            <p className="text-gray-500 text-sm mt-1">Kyçuni në llogarinë tuaj të EduPortal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="emri@school.edu"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Fjalëkalimi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Kyçu'}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-bold tracking-wider">Llogaritë Demo</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="flex flex-col items-center p-3 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
              >
                <div className="bg-purple-100 p-2 rounded-xl mb-2 group-hover:bg-purple-200 transition-colors">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-600 uppercase">Admin</span>
              </button>
              <button
                onClick={() => handleDemoLogin('professor')}
                className="flex flex-col items-center p-3 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
              >
                <div className="bg-emerald-100 p-2 rounded-xl mb-2 group-hover:bg-emerald-200 transition-colors">
                  <School className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-600 uppercase">Profesor</span>
              </button>
              <button
                onClick={() => handleDemoLogin('student')}
                className="flex flex-col items-center p-3 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
              >
                <div className="bg-amber-100 p-2 rounded-xl mb-2 group-hover:bg-amber-200 transition-colors">
                  <Mail className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-600 uppercase">Nxënës</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400">
              Nëse keni harruar fjalëkalimin, ju lutem kontaktoni administratorin e shkollës.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
