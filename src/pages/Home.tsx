import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, Info, ArrowRight, Award, Users, BookOpen } from 'lucide-react';
import { NewsItem } from '../types';
import { motion } from 'framer-motion';

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setNews(data));
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://samifrasheri.edu.mk/wp-content/uploads/2019/10/sami-frasheri.jpg" 
            alt="School Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/school/1920/1080";
            }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            SHMK Gjimnazi "Sami Frashëri"
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto"
          >
            Shkollë bashkëkohore me vizion që të gjithve të ju ofroj mundësi të njëjta që të përfaqësoj personalitete të cilët do të jenë të përgatitur për jetë në shekullin 21.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a href="#about" className="inline-flex items-center bg-white text-emerald-900 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-colors">
              Mëso më shumë <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Demo Mode Banner */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-100 p-3 rounded-2xl">
              <Award className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Mënyra Demo Aktive</h3>
              <p className="text-sm text-gray-500">Testoni platformën si Nxënës, Profesor ose Admin pa pasur nevojë për llogari reale.</p>
            </div>
          </div>
          <Link to="/login" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 whitespace-nowrap">
            Provo Demo Tani
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Nxënës', value: '850+', icon: Users },
            { label: 'Profesorë', value: '65', icon: Award },
            { label: 'Lëndë', value: '12+', icon: BookOpen },
            { label: 'Vite Përvojë', value: '50+', icon: Calendar },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
              <div className="inline-flex p-3 bg-emerald-50 rounded-xl text-emerald-600 mb-4">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About & Mission */}
      <section id="about" className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Rreth Shkollës Sonë</h2>
          <p className="text-gray-600 leading-relaxed">
            SHMK Gjimnazi "Sami Frashëri" në Kumanovë është një institucion arsimor me traditë, i përkushtuar në zhvillimin e nxënësve si personalitete të përgatitura për jetë në shekullin 21.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-emerald-100 p-1 rounded">
                <Info className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Kontakti</h4>
                <p className="text-sm text-gray-600">Adresa: III-ta Makedonska Udarna Brigada Kumanovë, 1300</p>
                <p className="text-sm text-gray-600">Tel: 031 412 244</p>
                <p className="text-sm text-gray-600">Email: sougimnazija-samifrasheri-kumanovo@schools.mk</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-emerald-100 p-1 rounded">
                <Award className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Karakteristikat</h4>
                <p className="text-sm text-gray-600">Udhëheqje efektive, profesorë të kualifikuar dhe arritje të larta të nxënësve në gara të ndryshme.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src="https://samifrasheri.edu.mk/wp-content/uploads/2019/10/sami-frasheri.jpg" 
            alt="Sami Frashëri" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/school/800/600";
            }}
          />
        </div>
      </section>

      {/* News & Announcements */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Lajmet e Fundit</h2>
              <p className="text-gray-500 mt-2">Qëndroni të informuar me ngjarjet e fundit në shkollë.</p>
            </div>
            <Bell className="h-8 w-8 text-emerald-600 opacity-20" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200">
                  <img 
                    src={`https://picsum.photos/seed/${item.id}/600/400`} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{item.category}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{item.content}</p>
                  <button className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 inline-flex items-center">
                    Lexo më shumë <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
