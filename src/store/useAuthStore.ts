import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { authService } from '../lib/websocket/auth.service';

interface AuthState {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  users: Omit<User, 'password'>[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  getUsers: () => Omit<User, 'password'>[];
  setUsers: (users: Omit<User, 'password'>[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [],
      
      login: async (email: string, password: string) => {
        try {
          const user = await authService.emitAuthEvent('login', { email, password });
          if (!user) throw new Error('Erro ao fazer login');
          set({ user, isAuthenticated: true });
        } catch (error) {
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, role: UserRole) => {
        try {
          const user = await authService.emitAuthEvent('register', {
            name,
            email,
            password,
            role,
          });
          if (!user) throw new Error('Erro ao registrar usuário');
          set({ user, isAuthenticated: true });
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.emitAuthEvent('logout', {});
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
          set({ user: null, isAuthenticated: false });
        }
      },

      getUsers: () => get().users,
      setUsers: (users) => set({ users }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Listen for user updates
authService.onUserUpdate((users) => {
  useAuthStore.getState().setUsers(users);
});