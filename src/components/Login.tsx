import React, { useState } from 'react';
import { PerformerLogo } from './PerformerLogo';
import { supabase } from '../supabaseClient';

export const Login: React.FC<{ onSwitchToRegister: () => void, onSwitchToReset: () => void }> = ({ onSwitchToRegister, onSwitchToReset }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Intentamos iniciar sesión en Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // 2. Verificamos inmediatamente si el usuario sigue en la "Lista VIP" (perfiles)
      if (data?.user) {
        const { data: perfil, error: perfilError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('email', data.user.email)
          .single();

        // Si no se encuentra en perfiles (porque el admin lo borró), lo bloqueamos
        if (perfilError || !perfil) {
          await supabase.auth.signOut(); // Cerramos la sesión abierta
          throw new Error("Esta cuenta ha sido desactivada o eliminada por el administrador.");
        }
      }

      console.log('¡Sesión iniciada con éxito!', data);
      window.location.reload(); 

    } catch (err: any) {
      // 🔴 Mostramos cualquier error (credenciales mal o cuenta borrada) limpiamente en rojo
      setError(err.message || 'Credenciales incorrectas o cuenta desactivada.');
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
        
        <h2 className="text-2xl font-black text-center text-[#310052] mb-6">Iniciar Sesión</h2>
        
        {/* Cuadro de error en rojo estético */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Empresarial</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" disabled={loading} />
          </div>
          
          <div className="text-right">
            <button type="button" onClick={onSwitchToReset} className="text-xs text-slate-500 hover:text-[#310052] font-semibold">¿Olvidaste tu contraseña?</button>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer">
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <button onClick={onSwitchToRegister} className="w-full mt-6 text-sm text-[#310052] font-bold hover:underline cursor-pointer">¿No tienes cuenta? Regístrate aquí</button>
      </div>
    </div>
  );
};