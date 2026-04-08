import { create } from 'zustand';

interface AuthState {
  // 状态
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // 操作
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 初始状态
  isAuthenticated: false,
  user: null,
  token: null,

  // 登录
  login: async (email: string, _password: string) => {
    try {
      // TODO: 调用实际的 API
      // const response = await fetch('http://localhost:3000/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password: _password }),
      // });
      // const data = await response.json();

      // 模拟登录
      const mockUser: User = {
        id: '1',
        name: '开发者',
        email: email,
      };
      const mockToken = 'mock-jwt-token';

      set({
        isAuthenticated: true,
        user: mockUser,
        token: mockToken,
      });
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 登出
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },

  // 设置用户信息
  setUser: (user: User) => {
    set({ user });
  },

  // 设置 Token
  setToken: (token: string) => {
    set({ token, isAuthenticated: !!token });
  },
}));
