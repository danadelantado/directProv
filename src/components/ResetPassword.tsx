import React, { useState } from 'react';
import { PerformerLogo } from './PerformerLogo';
import { supabase } from '../supabaseClient';

export const ResetPassword: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Pedimos a Supabase que mande el correo de recuperación real
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirige de vuelta a tu app al hacer clic en el correo
      });

      if (resetError) throw resetError;

      setSuccessMessage('¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el correo de recuperación. Verifica el correo e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-[#310052] p-4 rounded-xl"><PerformerLogo size="lg" variant="light" /></div>
        </div>
        
        <h2 className="text-xl font-black text-center text-[#310052] mb-6">
          Recuperar Contraseña
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Empresarial</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]" 
              placeholder="tu.correo@performerlogistics.com.mx"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md hover:bg-[#431366] transition cursor-pointer disabled:opacity-50 text-xs"
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones al correo'}
          </button>
        </form>

        <button 
          onClick={onSwitchToLogin} 
          className="w-full mt-6 text-sm text-[#310052] font-bold hover:underline cursor-pointer text-center block"
        >
          Volver a Iniciar Sesión
        </button>
      </div>
    </div>
  );
};