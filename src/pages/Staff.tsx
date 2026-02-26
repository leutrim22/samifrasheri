import React, { useEffect, useState } from 'react';
import { Mail, User as UserIcon, GraduationCap } from 'lucide-react';
import { User } from '../types';

export default function Staff() {
  const [staff, setStaff] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => setStaff(data));
  }, []);

  const directors = staff.filter(s => s.role === 'admin');
  const professors = staff.filter(s => s.role === 'professor');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Stafi i Shkollës</h1>
        <p className="text-gray-500">Njihuni me ekipin tonë të përkushtuar të edukatorëve dhe administratorëve.</p>
      </div>

      {/* Management Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserIcon className="mr-2 h-6 w-6 text-emerald-600" /> Drejtoria
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {directors.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{member.name} {member.surname}</h3>
                <p className="text-sm text-emerald-600 font-medium">Drejtor</p>
                <div className="flex items-center mt-2 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer">
                  <Mail className="h-3 w-3 mr-1" />
                  <span className="text-xs">{member.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professors Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <GraduationCap className="mr-2 h-6 w-6 text-emerald-600" /> Profesorët
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {professors.map((prof) => (
            <div key={prof.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900">{prof.name} {prof.surname}</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
                {prof.subjects || 'Profesor'}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-xs truncate">{prof.email}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
