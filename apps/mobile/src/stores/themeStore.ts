import { create } from 'zustand';
import { ColorSchemeName } from 'react-native';

interface ThemeState {
  // 状态
  colorScheme: ColorSchemeName;
  isDark: boolean;

  // 操作
  setColorScheme: (scheme: ColorSchemeName) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // 初始状态
  colorScheme: 'light',
  isDark: false,

  // 设置主题
  setColorScheme: (scheme: ColorSchemeName) => {
    set({
      colorScheme: scheme,
      isDark: scheme === 'dark',
    });
  },

  // 切换主题
  toggleTheme: () => {
    const currentScheme = get().colorScheme;
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
    set({
      colorScheme: newScheme,
      isDark: newScheme === 'dark',
    });
  },
}));
