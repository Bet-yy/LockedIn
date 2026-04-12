import { create } from 'zustand';

type TimerMode = 'work' | 'short_break' | 'long_break';

interface TimerStoreState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  setRunning: (value: boolean) => void;
  setMode: (mode: TimerMode) => void;
  setSecondsLeft: (seconds: number) => void;
}

const defaultWorkDuration = 25 * 60;
const defaultShortBreak = 5 * 60;
const defaultLongBreak = 15 * 60;

export const useTimerStore = create<TimerStoreState>((set) => ({
  mode: 'work',
  secondsLeft: defaultWorkDuration,
  isRunning: false,
  sessionsCompleted: 0,
  workDuration: defaultWorkDuration,
  shortBreak: defaultShortBreak,
  longBreak: defaultLongBreak,
  setRunning: (value) => set({ isRunning: value }),
  setMode: (mode) => set({ mode }),
  setSecondsLeft: (seconds) => set({ secondsLeft: seconds }),
}));
