import { create } from 'zustand';

interface CounterState {
  // 状态
  count: number;

  // 操作
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

// 简单的计数器 Store 示例
export const useCounterStore = create<CounterState>((set) => ({
  // 初始状态
  count: 0,

  // 增加
  increment: () => set((state) => ({ count: state.count + 1 })),

  // 减少
  decrement: () => set((state) => ({ count: state.count - 1 })),

  // 重置
  reset: () => set({ count: 0 }),

  // 设置特定值
  setCount: (count: number) => set({ count }),
}));
