import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PerformerLogo } from './PerformerLogo';

const CORPORATE_DOMAINS = ['@performerlogistics.com.mx', '@looper.com.mx'];

export const ResetPassword: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');
  
  const { resetPassword, users } = useAuth();

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const userExists = users.some(u => u.email === email);
    if (!userExists) {
      setError('No existe una cuenta con este correo.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setStep(2);
    alert(`SIMULACIÓN DE CORREO (Restablecer Contraseña)\n\nPara: ${email}\nCódigo de recuperación: ${code}`);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode !== generatedCode) {
      setError('Código incorrecto.');
      return;
    }
    setStep(3);
    setError('');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    resetPassword(email, newPassword);
    alert('Contraseña actualizada con éxito. Inicia sesión con tus nuevas credenciales.');
    onSwitchToLogin();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-[#310052] p-4 rounded-xl"><PerformerLogo size="lg" variant="light" /></div>
        </div>
        
        <h2 className="text-xl font-black text-center text-[#310052] mb-6">
          {step === 1 ? 'Recuperar Contraseña' : step === 2 ? 'Verificar Código' : 'Nueva Contraseña'}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm text-center font-bold">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Empresarial</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
            </div>
            <button type="submit" className="w-full mt-4 py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md">Enviar código</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-slate-600 text-center">Código enviado a <strong>{email}</strong></p>
            <input type="text" required maxLength={4} value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} className="w-full px-4 py-3 text-center text-2xl font-black bg-slate-50 border rounded-xl" placeholder="0000" />
            <button type="submit" className="w-full py-3 bg-[#D2E603] text-[#310052] font-black rounded-xl shadow-md">Verificar</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nueva Contraseña</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
            </div>
            <button type="submit" className="w-full py-3 bg-[#310052] text-white font-bold rounded-xl shadow-md">Guardar y Entrar</button>
          </form>
        )}

        <button onClick={onSwitchToLogin} className="w-full mt-6 text-sm text-[#310052] font-bold hover:underline">Volver a Iniciar Sesión</button>
      </div>
    </div>
  );
};