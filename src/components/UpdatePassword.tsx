import React, { useState } from 'react';
import { PerformerLogo } from './PerformerLogo';
import { supabase } from '../supabaseClient';

export const UpdatePassword: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      alert('¡Contraseña actualizada con éxito!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
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
        <h2 className="text-xl font-black text-center text-[#310052] mb-6">Establecer Nueva Contraseña</h2>
        
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold text-center">{error}</div>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nueva Contraseña (mínimo 6 caracteres)</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl" 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md cursor-pointer">
            {loading ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};