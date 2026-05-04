'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle, XCircle, Settings, Users, Activity,
  FileImage, Save, RefreshCw, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Registration = {
  id: string;
  created_at: string;
  type: string;
  modality: string;
  participant_type: string;
  name: string;
  cedula: string;
  email: string;
  reference: string;
  institution: string;
  receipt_url: string;
  amount: number;
  status: 'pending' | 'verified';
};

type BankSettings = {
  banco: string;
  codigo_banco: string;
  cuenta: string;
  telefono: string;
  rif: string;
  titular: string;
  pago_movil_banco: string;
  pago_movil_telefono: string;
  precio_estudiante: number;
  precio_general: number;
  precio_familiar: number;
};

const DEFAULT_SETTINGS: BankSettings = {
  banco: 'Banesco',
  codigo_banco: '0134',
  cuenta: '0134-XXXX-XXXX-XXXX-XXXX',
  telefono: '0414-1234567',
  rif: 'J-12345678-9',
  titular: 'Colegio Rafael Castillo',
  pago_movil_banco: 'Banesco',
  pago_movil_telefono: '0414-1234567',
  precio_estudiante: 1500,
  precio_general: 2000,
  precio_familiar: 12000,
};

export default function AdminPanel() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<BankSettings>(DEFAULT_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchRegistrations(), fetchSettings()]);
    setLoading(false);
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setRegistrations(data as Registration[]);
    else console.error('Error fetching registrations:', error);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'bank_data')
      .single();
    if (data?.value) setSettings(data.value as BankSettings);
  };

  const handleVerify = async (reg: Registration) => {
    setVerifyingId(reg.id);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'verified' })
        .eq('id', reg.id);

      if (error) throw error;

      setRegistrations(prev =>
        prev.map(r => (r.id === reg.id ? { ...r, status: 'verified' } : r))
      );

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reg.email, name: reg.name, type: 'confirmation' }),
      });
    } catch (err: any) {
      alert(`Error al verificar: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsError(null);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'bank_data',
          value: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      setSettingsError(`Error guardando: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSetting = (key: keyof BankSettings, val: string | number) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    setSettingsSaved(false);
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    verified: registrations.filter(r => r.status === 'verified').length,
    revenue: registrations.filter(r => r.status === 'verified').reduce((s, r) => s + r.amount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/60">
        <div className="w-8 h-8 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin mr-3" />
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inscritos', value: stats.total, color: 'blue' },
          { label: 'Pendientes', value: stats.pending, color: 'yellow' },
          { label: 'Verificados', value: stats.verified, color: 'green' },
          { label: 'Recaudado (Verificado)', value: `${stats.revenue.toLocaleString()} Bs`, color: 'indigo' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-4 text-white backdrop-blur-sm`}>
            <p className="text-white/60 text-xs uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold text-${color}-400 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          {[
            { id: 'list', icon: Users, label: 'Inscripciones' },
            { id: 'settings', icon: Settings, label: 'Configuración' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 p-4 font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === id ? 'bg-white/10 text-white border-b-2 border-blue-400' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'list' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Lista de Inscripciones</h3>
                <button
                  onClick={fetchRegistrations}
                  className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white">
                  <thead className="text-xs text-white/70 uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3">Participante</th>
                      <th className="px-4 py-3">Cédula</th>
                      <th className="px-4 py-3">Tipo / Modalidad</th>
                      <th className="px-4 py-3">Referencia</th>
                      <th className="px-4 py-3">Monto</th>
                      <th className="px-4 py-3">Comprobante</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{reg.name}</div>
                          <div className="text-white/50 text-xs">{reg.email}</div>
                          {reg.institution && <div className="text-blue-300/70 text-xs">{reg.institution}</div>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{reg.cedula}</td>
                        <td className="px-4 py-3">
                          <div className="capitalize text-xs">{reg.type}</div>
                          <div className="text-white/50 text-xs capitalize">{reg.modality}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{reg.reference}</td>
                        <td className="px-4 py-3 font-bold text-blue-300">{reg.amount?.toLocaleString()} Bs</td>
                        <td className="px-4 py-3">
                          {reg.receipt_url ? (
                            <button
                              onClick={() => setSelectedImage(reg.receipt_url)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title="Ver comprobante"
                            >
                              <FileImage className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-white/30 text-xs">Sin imagen</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {reg.status === 'verified' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium whitespace-nowrap">
                              <CheckCircle className="w-3 h-3" /> Verificado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium whitespace-nowrap">
                              <Activity className="w-3 h-3" /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {reg.status === 'pending' && (
                            <button
                              onClick={() => handleVerify(reg)}
                              disabled={verifyingId === reg.id}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {verifyingId === reg.id ? '...' : 'Confirmar Pago'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {registrations.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-white/40">
                          No hay inscripciones registradas todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Settings Tab */
            <div className="max-w-2xl space-y-6 text-white">
              <div>
                <h3 className="text-xl font-bold">Configuración del Evento</h3>
                <p className="text-white/60 text-sm mt-1">Los cambios se guardan en la base de datos y se reflejan inmediatamente en el formulario público.</p>
              </div>

              {/* Prices */}
              <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/10">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">💰 Precios de Inscripción (Bs)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'precio_estudiante', label: 'Estudiante' },
                    { key: 'precio_general', label: 'General' },
                    { key: 'precio_familiar', label: 'Familiar (6 pers.)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-white/60 mb-1">{label}</label>
                      <input
                        type="number"
                        value={(settings as any)[key]}
                        onChange={e => updateSetting(key as keyof BankSettings, Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/10">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">🏦 Datos Bancarios (Transferencia)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'titular', label: 'Nombre del Titular' },
                    { key: 'banco', label: 'Banco' },
                    { key: 'codigo_banco', label: 'Código del Banco' },
                    { key: 'cuenta', label: 'Número de Cuenta' },
                    { key: 'rif', label: 'RIF / CI' },
                    { key: 'telefono', label: 'Teléfono de Contacto' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-white/60 mb-1">{label}</label>
                      <input
                        type="text"
                        value={(settings as any)[key]}
                        onChange={e => updateSetting(key as keyof BankSettings, e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Payment */}
              <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/10">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">📱 Pago Móvil</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'pago_movil_banco', label: 'Banco del Pago Móvil' },
                    { key: 'pago_movil_telefono', label: 'Número de Teléfono' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-white/60 mb-1">{label}</label>
                      <input
                        type="text"
                        value={(settings as any)[key]}
                        onChange={e => updateSetting(key as keyof BankSettings, e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/40">El RIF/CI del pago móvil es el mismo que el bancario.</p>
              </div>

              {settingsError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {settingsError}
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  settingsSaved
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500'
                } disabled:opacity-50`}
              >
                {savingSettings ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : settingsSaved ? (
                  <><CheckCircle className="w-5 h-5" /> ¡Cambios Guardados!</>
                ) : (
                  <><Save className="w-5 h-5" /> Guardar Cambios</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-white/70 bg-black/50 p-2 rounded-full transition-colors"
              >
                <XCircle className="w-8 h-8" />
              </button>
              <p className="text-white/60 text-sm text-center mb-3">Comprobante de Pago</p>
              <img
                src={selectedImage}
                alt="Comprobante de pago"
                className="w-full h-auto rounded-xl shadow-2xl border border-white/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
