'use client';

import RegistrationForm from '@/components/RegistrationForm';
import { Activity, Heart, Users, Medal, Calendar, MapPin, Clock } from 'lucide-react';

export default function Home() {
  const eventDate = new Date('2026-05-22T08:00:00');
  const now = new Date();
  const msLeft = eventDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
        
        {/* Left Column: Hero & Info */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-300 font-medium text-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Colegio Rafael Castillo
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 tracking-tight leading-tight">
              Pasos con Propósito: <br />
              <span className="text-white">4K de Solidaridad</span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              Únete a nuestra carrera-caminata benéfica. Más que una competencia, es un movimiento de esperanza. Corre, camina o trota por una buena causa, fomentando la actividad física en familia y apoyando el desarrollo de nuestra institución.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Heart, title: "Impacto Benéfico", desc: "Todo lo recaudado será destinado a mejoras institucionales y donaciones." },
              { icon: Activity, title: "Salud y Deporte", desc: "Fomentamos el bienestar físico y mental en nuestra comunidad." },
              { icon: Users, title: "Unión Familiar", desc: "Un evento diseñado para disfrutar en familia y crear recuerdos." },
              { icon: Medal, title: "Premios y Sorpresas", desc: "Reconocimientos a los primeros lugares y medallas para participantes." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl flex flex-col gap-3 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Mock image area using glassmorphism */}
          <div className="h-64 w-full rounded-3xl overflow-hidden relative border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            {/* In a real app we would use an actual image of runners. We use a placeholder here. */}
            <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center">
              <span className="text-white/40 font-medium">Imágenes del Evento</span>
            </div>
            <div className="absolute bottom-6 left-6 z-20">
              <p className="text-white font-bold text-xl">Viernes, 22 de Mayo de 2026</p>
              <p className="text-blue-300 font-medium">Salida: Sede Principal del Colegio Rafael Castillo</p>
            </div>
          </div>

          {/* Event Details Bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: 'Fecha', value: '22 Mayo 2026' },
              { icon: Clock, label: 'Hora', value: '8:00 AM' },
              { icon: MapPin, label: 'Lugar', value: 'Sede Principal' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1 text-center">
                <Icon className="w-5 h-5 text-blue-400" />
                <p className="text-white/50 text-xs">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-4 text-center">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Faltan</p>
            <p className="text-4xl font-extrabold text-white">{daysLeft}</p>
            <p className="text-blue-300 text-sm font-medium">días para el evento</p>
          </div>

        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:sticky lg:top-12">
          <RegistrationForm />
        </div>

      </div>
    </main>
  );
}
