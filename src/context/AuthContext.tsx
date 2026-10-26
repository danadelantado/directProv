import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'visor';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, pass: string) => boolean;
  register: (email: string, name: string, pass: string) => boolean;
  logout: () => void;
  changeRole: (email: string, newRole: UserRole) => void;
  resetPassword: (email: string, newPass: string) => boolean;
  deleteUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('app_secure_users');
    if (storedUsers && JSON.parse(storedUsers).length > 0){
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultUsers = [
        {
          email: 'karla@performerlogistics.com.mx',
          name: 'Ana Karla',
          password: btoa('karper26'),
          role: 'admin'
        }
      ];
      localStorage.setItem('app_secure_users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers as any);
    }
  }, []);

  const login = (email: string, pass: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('app_secure_users') || '[]');
    const hashedPass = btoa(pass); 
    const foundUser = storedUsers.find((u: any) => u.email === email && u.password === hashedPass);
    
    if (foundUser) {
      setUser({ email: foundUser.email, name: foundUser.name, role: foundUser.role });
      return true;
    }
    return false;
  };

  const register = (email: string, name: string, pass: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('app_secure_users') || '[]');
    if (storedUsers.some((u: any) => u.email === email)) return false;

    const assignedRole: UserRole = storedUsers.length === 0 ? 'admin' : 'visor';
    const newUser = { email, name, password: btoa(pass), role: assignedRole };
    const updatedUsers = [...storedUsers, newUser];
    
    localStorage.setItem('app_secure_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setUser({ email, name, role: assignedRole });
    return true;
  };

  const changeRole = (email: string, newRole: UserRole) => {
    const storedUsers = JSON.parse(localStorage.getItem('app_secure_users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => u.email === email ? { ...u, role: newRole } : u);
    localStorage.setItem('app_secure_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    if (user?.email === email) setUser({ ...user, role: newRole });
  };

  const resetPassword = (email: string, newPass: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('app_secure_users') || '[]');
    const userExists = storedUsers.some((u: any) => u.email === email);
    
    if (!userExists) return false;

    const updatedUsers = storedUsers.map((u: any) => 
      u.email === email ? { ...u, password: btoa(newPass) } : u
    );
    localStorage.setItem('app_secure_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    return true;
  };

  const deleteUser = (email: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('app_secure_users') || '[]');
    const updatedUsers = storedUsers.filter((u: any) => u.email !== email);

    localStorage.setItem('app_secure_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    if (user?.email === email) logout();
  };

  const logout = () => setUser(null);

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