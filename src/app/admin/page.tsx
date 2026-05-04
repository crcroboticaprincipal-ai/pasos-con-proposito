'use client';

import { useState } from 'react';
import AdminPanel from '@/components/AdminPanel';
import { Lock, ChevronRight } from 'lucide-react';

import { verifyPassword } from './actions';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    
    const isValid = await verifyPassword(password);
    
    if (isValid) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
    setIsVerifying(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Acceso Administrativo</h1>
          <p className="text-white/60 text-center mb-8 text-sm">Ingresa la contraseña para gestionar las inscripciones.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña" 
                className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={isVerifying}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? 'Verificando...' : 'Ingresar'}
              {!isVerifying && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-xs text-white/40 text-center mt-6">
            Contraseña por defecto: <strong>admin123</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="text-white/60">Gestiona las inscripciones y configuraciones del evento.</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <AdminPanel />
      </div>
    </div>
  );
}
