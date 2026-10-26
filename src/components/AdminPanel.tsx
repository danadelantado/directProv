import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { X, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { users, changeRole, user, deleteUser } = useAuth();
  
  // Estado para el modal de confirmación de borrado
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  if (user?.role !== 'admin') return null;

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setUserToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden relative">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 text-[#310052]">
            <ShieldCheck className="w-7 h-7" />
            <h2 className="text-xl font-black">Gestión de Usuarios</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        {/* Tabla */}
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Usuario</th>
                <th className="py-3 px-4 font-bold">Correo Empresarial</th>
                <th className="py-3 px-4 font-bold">Permisos / Rol</th>
                <th className="py-3 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#310052]/10 flex items-center justify-center text-[#310052] font-black text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600 font-medium">
                    {u.email}
                  </td>
                  <td className="py-4 px-4">
                    <select 
                      value={u.role} 
                      onChange={(e) => changeRole(u.email, e.target.value as UserRole)}
                      disabled={u.email === user.email} 
                      className={`text-xs font-bold border rounded-lg px-3 py-2 focus:outline-none cursor-pointer shadow-sm transition ${
                        u.role === 'admin' 
                          ? 'bg-[#310052] text-white border-[#310052]' 
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-[#310052]'
                      } ${u.email === user.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="visor">Solo Vista (Consultor)</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setUserToDelete(u.email)}
                      disabled={u.email === user.email} // Bloquea eliminar tu propia cuenta
                      className={`p-2 rounded-lg transition ${
                        u.email === user.email 
                          ? 'text-slate-300 cursor-not-allowed' 
                          : 'text-rose-500 hover:bg-rose-100 hover:text-rose-700 cursor-pointer'
                      }`}
                      title={u.email === user.email ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de Confirmación Interno */}
        {userToDelete && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
            <div className="bg-white border border-rose-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">¿Eliminar usuario?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Estás a punto de revocar permanentemente el acceso a <strong>{userToDelete}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition shadow-md cursor-pointer"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};