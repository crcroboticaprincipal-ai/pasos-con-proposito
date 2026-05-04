'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, ChevronRight, User, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function RegistrationForm() {
  const [formType, setFormType] = useState<'individual' | 'familiar'>('individual');
  const [modality, setModality] = useState<'carrera' | 'caminata'>('carrera');
  const [participantType, setParticipantType] = useState<'estudiante' | 'general'>('estudiante');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<BankSettings>(DEFAULT_SETTINGS);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('id', 'bank_data')
      .single()
      .then(({ data }) => {
        if (data?.value) setSettings(data.value as BankSettings);
      });
  }, []);

  const calculateTotal = useCallback(() => {
    if (formType === 'familiar') return settings.precio_familiar;
    return participantType === 'estudiante' ? settings.precio_estudiante : settings.precio_general;
  }, [formType, participantType, settings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const name = (formData.get('name') as string).trim();
      const cedula = (formData.get('cedula') as string).trim();
      const email = (formData.get('email') as string).trim();
      const ref = (formData.get('reference') as string).trim();
      const institution = (formData.get('institution') as string | null)?.trim() || null;

      if (!name || !cedula || !email || !ref) {
        setError('Por favor completa todos los campos obligatorios.');
        return;
      }

      // Upload receipt image
      let receiptUrl = '';
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile, { upsert: false, contentType: receiptFile.type });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setError(`Error subiendo el comprobante: ${uploadError.message}`);
          return;
        }

        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
        receiptUrl = urlData.publicUrl;
      }

      // Insert into DB
      const { error: dbError } = await supabase.from('registrations').insert([{
        type: formType,
        modality,
        participant_type: formType === 'familiar' ? 'familiar' : participantType,
        name,
        cedula,
        email,
        reference: ref,
        institution,
        receipt_url: receiptUrl,
        amount: calculateTotal(),
        status: 'pending',
      }]);

      if (dbError) {
        console.error('DB error:', dbError);
        setError(`Error guardando la inscripción: ${dbError.message}`);
        return;
      }

      // Send notification email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, type: 'registration' }),
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl text-center text-white"
      >
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold mb-3">¡Inscripción Recibida!</h3>
        <p className="text-white/80 leading-relaxed">
          Hemos recibido tu solicitud. Tu pago está en proceso de verificación.
          Pronto recibirás noticias en <span className="text-blue-300 font-medium">tu correo electrónico</span>.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl text-white">
      <h3 className="text-2xl font-bold mb-6 text-center">Formulario de Inscripción</h3>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'individual', icon: User, label: 'Individual' },
            { value: 'familiar', icon: Users, label: 'Familiar (6 pers.)' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormType(value as any)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                formType === value ? 'bg-blue-600/50 border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>

        {/* Modality */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Modalidad</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'carrera', label: '🏃 Carrera 4K' },
              { value: 'caminata', label: '🚶 Caminata 4K' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setModality(value as any)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  modality === value ? 'bg-indigo-600/50 border-indigo-400' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic participant fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={formType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {formType === 'individual' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">Tipo de Participante</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'estudiante', label: '🎓 Estudiante', price: settings.precio_estudiante },
                      { value: 'general', label: '👤 Público General', price: settings.precio_general },
                    ].map(({ value, label, price }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setParticipantType(value as any)}
                        className={`p-3 rounded-xl border text-sm transition-all ${
                          participantType === value ? 'bg-blue-600/40 border-blue-400' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-medium">{label}</div>
                        <div className="text-blue-300 font-bold mt-1">{price.toLocaleString()} Bs</div>
                      </button>
                    ))}
                  </div>
                </div>
                {participantType === 'estudiante' && (
                  <input
                    required
                    name="institution"
                    placeholder="Institución Educativa *"
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
                  />
                )}
              </div>
            )}

            <input
              required
              name="name"
              placeholder={formType === 'familiar' ? 'Nombre del Capitán del Grupo *' : 'Nombre Completo *'}
              className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="cedula"
                placeholder="Cédula de Identidad *"
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
              />
              <input
                required
                type="email"
                name="email"
                placeholder="Correo Electrónico *"
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
              />
            </div>

            {formType === 'familiar' && (
              <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white/80 block">Nombres de Acompañantes</label>
                {[1, 2, 3, 4, 5].map(num => (
                  <input
                    key={num}
                    name={`companion_${num}`}
                    placeholder={`Acompañante ${num}`}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-white/30"
                  />
                ))}
                <p className="text-xs text-blue-300 mt-1">Precio familiar: {settings.precio_familiar.toLocaleString()} Bs (6 personas)</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Payment Section */}
        <div className="mt-2 pt-6 border-t border-white/20 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total a Pagar:</span>
            <span className="text-3xl font-extrabold text-blue-400">{calculateTotal().toLocaleString()} Bs</span>
          </div>

          {/* Bank Info from DB */}
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-4 rounded-xl border border-blue-500/20 text-sm space-y-1 text-white/80">
            <p className="font-semibold text-white text-base mb-3 flex items-center gap-2">
              🏦 Datos para Transferencia Bancaria
            </p>
            <p><span className="text-white/50">Banco:</span> <strong className="text-white">{settings.banco} ({settings.codigo_banco})</strong></p>
            <p><span className="text-white/50">Número de Cuenta:</span> <strong className="text-white font-mono">{settings.cuenta}</strong></p>
            <p><span className="text-white/50">Titular:</span> <strong className="text-white">{settings.titular}</strong></p>
            <p><span className="text-white/50">RIF:</span> <strong className="text-white">{settings.rif}</strong></p>

            <div className="border-t border-white/10 mt-3 pt-3">
              <p className="font-semibold text-white text-base mb-2 flex items-center gap-2">
                📱 Pago Móvil
              </p>
              <p><span className="text-white/50">Banco:</span> <strong className="text-white">{settings.pago_movil_banco}</strong></p>
              <p><span className="text-white/50">Teléfono:</span> <strong className="text-white font-mono">{settings.pago_movil_telefono}</strong></p>
              <p><span className="text-white/50">RIF/CI:</span> <strong className="text-white">{settings.rif}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              name="reference"
              placeholder="Últimos 6 dígitos de referencia *"
              maxLength={6}
              pattern="\d{4,6}"
              title="Ingresa los últimos 4 a 6 dígitos de la referencia"
              className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/40"
            />

            <div>
              <input
                type="file"
                id="receipt"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="receipt"
                className={`w-full h-full min-h-[48px] flex items-center justify-center gap-2 border border-dashed rounded-xl p-3 cursor-pointer transition-colors text-sm ${
                  receiptFile ? 'bg-green-500/10 border-green-400 text-green-300' : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{receiptFile ? `✓ ${receiptFile.name}` : 'Subir Comprobante de Pago'}</span>
              </label>
            </div>
          </div>

          {receiptPreview && (
            <div className="rounded-xl overflow-hidden border border-white/20">
              <img src={receiptPreview} alt="Vista previa del comprobante" className="w-full max-h-48 object-cover" />
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Inscribirme Ahora
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}
