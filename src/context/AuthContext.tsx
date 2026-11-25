import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export type UserRole = 'admin' | 'visor';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  logout: () => void;
  changeRole: (email: string, newRole: UserRole) => void;
  deleteUser: (email: string) => void;
  
  // Funciones heredadas de UI
  login: (email: string, pass: string) => boolean;
  register: (email: string, name: string, pass: string) => boolean;
  resetPassword: (email: string, newPass: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Función maestra: Verifica si el usuario existe en la "Lista VIP" (perfiles)
  const checkAccess = async (sessionUser: any) => {
    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('email', sessionUser.email)
      .single();

    if (perfil) {
      setUser({
        email: perfil.email,
        name: perfil.name,
        role: perfil.role,
      });
    } else {
      await supabase.auth.signOut();
      setUser(null);
      throw new Error("Esta cuenta ha sido desactivada o eliminada por el administrador.");
    }
  };

  useEffect(() => {
    // 1. Revisar sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) checkAccess(session.user);
    });

    // 2. Escuchar cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkAccess(session.user);
      else setUser(null);
    });

    // 3. Cargar la lista completa de usuarios para tu AdminPanel
    const cargarUsuarios = async () => {
      const { data } = await supabase.from('perfiles').select('*');
      if (data) setUsers(data as User[]);
    };
    
    cargarUsuarios();

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Función real para cambiar roles desde el Admin Panel
  const changeRole = async (email: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('perfiles')
      .update({ role: newRole })
      .eq('email', email);

    if (!error) {
      setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
      if (user?.email === email) setUser({ ...user, role: newRole });
    } else {
      console.error("Error al cambiar rol:", error);
    }
  };

  // Función real para eliminar usuarios desde el Admin Panel
  const deleteUser = async (email: string) => {
    const confirmar = window.confirm(`¿Estás segura de eliminar permanentemente el acceso de ${email}?`);
    if (!confirmar) return;

    const { error } = await supabase
      .from('perfiles')
      .delete()
      .eq('email', email);

    if (!error) {
      setUsers((prev) => prev.filter((u) => u.email !== email));
      if (user?.email === email) logout();
    } else {
      console.error("Error al eliminar usuario:", error);
    }
  };

  const login = () => true;
  const register = () => true;
  const resetPassword = () => true;

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, changeRole, resetPassword, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};