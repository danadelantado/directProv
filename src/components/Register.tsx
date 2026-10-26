import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PerformerLogo } from './PerformerLogo';

const CORPORATE_DOMAINS = ['@performerlogistics.com.mx', '@looper.com.mx'];

export const Register: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleRequestCode = (e: React.FormEvent) => {
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

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setStep(2);
    alert(`SIMULACIÓN DE CORREO (Registro)\n\nPara: ${email}\nCódigo de verificación: ${code}`);
  };

  const handleVerifyAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode !== generatedCode) {
      setError('El código es incorrecto.');
      return;
    }

    const success = register(email, name, password);
    if (!success) {
      setError('Este correo ya está registrado.');
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-[#310052] p-4 rounded-xl"><PerformerLogo size="lg" variant="light" /></div>
        </div>
        
        <h2 className="text-2xl font-black text-center text-[#310052] mb-6">
          {step === 1 ? 'Crear Cuenta' : 'Verificar Correo'}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm text-center font-bold">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre Completo</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Empresarial</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
            </div>
            <button type="submit" className="w-full mt-6 py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md">Enviar código de verificación</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <p className="text-sm text-slate-600 text-center">Código enviado a <strong>{email}</strong></p>
            <input type="text" required maxLength={4} value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} className="w-full px-4 py-3 text-center text-2xl font-black bg-slate-50 border rounded-xl" placeholder="0000" />
            <button type="submit" className="w-full mt-6 py-3 bg-[#D2E603] text-[#310052] font-black rounded-xl shadow-md">Verificar y Registrarme</button>
          </form>
        )}

        {step === 1 && (
          <button onClick={onSwitchToLogin} className="w-full mt-6 text-sm text-[#310052] font-bold hover:underline">¿Ya tienes cuenta? Inicia sesión aquí</button>
        )}
      </div>
    </div>
  );
};