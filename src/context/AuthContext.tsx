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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Verifica que el usuario autenticado tenga fila en 'perfiles'
  const checkAccess = async (sessionUser: { id: string }) => {
    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle();

    // Error técnico: no es lo mismo que "cuenta eliminada"
    if (error) {
      console.error('Error al consultar perfil en Supabase:', error);
      return;
    }

    if (perfil) {
      setUser({
        email: perfil.email,
        name: perfil.name,
        role: perfil.role,
      });
    } else {
      // Consulta correcta pero sin fila: cuenta eliminada o desactivada
      await supabase.auth.signOut({ scope: 'local' });
      setUser(null);
    }
  };

  // 1. Escuchar la sesión (incluye el evento inicial, no hace falta getSession)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sessionUser = session.user;
        // setTimeout evita bloquear el callback de auth con llamadas a Supabase
        setTimeout(() => {
          checkAccess(sessionUser);
        }, 0);
      } else {
        setUser(null);
        setUsers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Cargar la lista de usuarios solo cuando hay un admin con sesión
  useEffect(() => {
    if (user?.role !== 'admin') {
      setUsers([]);
      return;
    }

    const cargarUsuarios = async () => {
      const { data, error } = await supabase.from('perfiles').select('*');
      if (error) console.error('Error al cargar usuarios:', error);
      else if (data) setUsers(data as User[]);
    };

    cargarUsuarios();
  }, [user?.role]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Cambiar roles desde el Admin Panel
  const changeRole = async (email: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('perfiles')
      .update({ role: newRole })
      .eq('email', email);

    if (!error) {
      setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
      if (user?.email === email) setUser({ ...user, role: newRole });
    } else {
      console.error('Error al cambiar rol:', error);
    }
  };

  // Eliminar usuarios desde el Admin Panel
  const deleteUser = async (email: string) => {
    const confirmar = window.confirm(
      `¿Estás segura de eliminar permanentemente el acceso de ${email}?`
    );
    if (!confirmar) return;

    const { error } = await supabase.from('perfiles').delete().eq('email', email);

    if (!error) {
      setUsers((prev) => prev.filter((u) => u.email !== email));
      if (user?.email === email) logout();
    } else {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const login = () => true;
  const register = () => true;
  const resetPassword = () => true;

  return (
    <AuthContext.Provider
      value={{ user, users, login, register, logout, changeRole, resetPassword, deleteUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};