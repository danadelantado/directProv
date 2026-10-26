import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PerformerLogo } from './PerformerLogo';

export const Login: React.FC<{ onSwitchToRegister: () => void, onSwitchToReset: () => void }> = ({ onSwitchToRegister, onSwitchToReset }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) setError('Credenciales incorrectas.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-[#310052] p-4 rounded-xl"><PerformerLogo size="lg" variant="light" /></div>
        </div>
        
        <h2 className="text-2xl font-black text-center text-[#310052] mb-6">Iniciar Sesión</h2>
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm text-center font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Empresarial</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
          </div>
          
          <div className="text-right">
            <button type="button" onClick={onSwitchToReset} className="text-xs text-slate-500 hover:text-[#310052] font-semibold">¿Olvidaste tu contraseña?</button>
          </div>

          <button type="submit" className="w-full py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md">Entrar</button>
        </form>

        <button onClick={onSwitchToRegister} className="w-full mt-6 text-sm text-[#310052] font-bold hover:underline">¿No tienes cuenta? Regístrate aquí</button>
      </div>
    </div>
  );
};