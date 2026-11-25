import React, { useState } from 'react';
import { PerformerLogo } from './PerformerLogo';
import { supabase } from '../supabaseClient'; 

const CORPORATE_DOMAINS = ['@performerlogistics.com.mx', '@looper.com.mx', '@gmail.com'];

export const Register: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); 
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isValidDomain = CORPORATE_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
    if (!isValidDomain) {
      setError(`Dominios permitidos: ${CORPORATE_DOMAINS.join(' o ')}`);
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError('Error al registrar: ' + error.message);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-[#310052] p-4 rounded-xl"><PerformerLogo size="lg" variant="light" /></div>
        </div>
        
        <h2 className="text-2xl font-black text-center text-[#310052] mb-6">Crear Cuenta</h2>
        
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm text-center font-bold">{error}</div>}
        
        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <h3 className="font-bold text-lg mb-2">¡Registro exitoso!</h3>
              <p className="text-sm">Hemos enviado un correo a <strong>{email}</strong>.</p>
              <p className="text-sm mt-2">Por favor, haz clic en el enlace del correo para verificar tu cuenta antes de iniciar sesión.</p>
            </div>
            <button onClick={onSwitchToLogin} className="w-full py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md">
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre Completo</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Empresarial</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" disabled={loading} />
            </div>
            <button type="submit" disabled={loading} className="w-full mt-6 py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md disabled:opacity-50">
              {loading ? 'Creando cuenta...' : 'Registrarme'}
            </button>
          </form>
        )}

        {!success && (
          <button onClick={onSwitchToLogin} className="w-full mt-6 text-sm text-[#310052] font-bold hover:underline">¿Ya tienes cuenta? Inicia sesión aquí</button>
        )}
      </div>
    </div>
  );
};