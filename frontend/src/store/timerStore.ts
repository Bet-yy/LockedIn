import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setDurations: (durations: { workDuration: number; shortBreak: number; longBreak: number }) => void;
  setSessionsCompleted: (value: number) => void;
  tick: () => void;
  reset: () => void;
  skipToNextMode: () => void;
}

const defaultWorkDuration = 25 * 60;
const defaultShortBreak = 5 * 60;
const defaultLongBreak = 15 * 60;

function getDurationForMode(mode: TimerMode, state: Pick<TimerStoreState, 'workDuration' | 'shortBreak' | 'longBreak'>) {
  if (mode === 'short_break') {
    return state.shortBreak;
  }
  if (mode === 'long_break') {
    return state.longBreak;
  }
  return state.workDuration;
}

function getNextMode(mode: TimerMode, sessionsCompleted: number): TimerMode {
  if (mode === 'work') {
    return (sessionsCompleted + 1) % 4 === 0 ? 'long_break' : 'short_break';
  }
  return 'work';
}

export const useTimerStore = create<TimerStoreState>()(
  persist(
    (set) => ({
      mode: 'work',
      secondsLeft: defaultWorkDuration,
      isRunning: false,
      sessionsCompleted: 0,
      workDuration: defaultWorkDuration,
      shortBreak: defaultShortBreak,
      longBreak: defaultLongBreak,
      setRunning: (value) => set({ isRunning: value }),
      setMode: (mode) =>
        set((state) => ({
          mode,
          secondsLeft: getDurationForMode(mode, state),
        })),
      setSecondsLeft: (seconds) => set({ secondsLeft: seconds }),
      setDurations: ({ workDuration, shortBreak, longBreak }) =>
        set((state) => {
          const nextState = { ...state, workDuration, shortBreak, longBreak };
          return {
            workDuration,
            shortBreak,
            longBreak,
            secondsLeft: getDurationForMode(state.mode, nextState),
          };
        }),
      setSessionsCompleted: (value) => set({ sessionsCompleted: value }),
      tick: () =>
        set((state) => {
          if (!state.isRunning) {
            return state;
          }

          if (state.secondsLeft > 1) {
            return { secondsLeft: state.secondsLeft - 1 };
          }

          const completedWorkSessions = state.mode === 'work' ? state.sessionsCompleted + 1 : state.sessionsCompleted;
          const nextMode = getNextMode(state.mode, state.sessionsCompleted);

          return {
            isRunning: false,
            mode: nextMode,
            sessionsCompleted: completedWorkSessions,
            secondsLeft: getDurationForMode(nextMode, state),
          };
        }),
      reset: () =>
        set((state) => ({
          isRunning: false,
          secondsLeft: getDurationForMode(state.mode, state),
        })),
      skipToNextMode: () =>
        set((state) => {
          const completedWorkSessions = state.mode === 'work' ? state.sessionsCompleted + 1 : state.sessionsCompleted;
          const nextMode = getNextMode(state.mode, state.sessionsCompleted);
          return {
            isRunning: false,
            mode: nextMode,
            sessionsCompleted: completedWorkSessions,
            secondsLeft: getDurationForMode(nextMode, state),
          };
        }),
    }),
    {
      name: 'lockedin_timer_store',
      partialize: (state) => ({
        mode: state.mode,
        secondsLeft: state.secondsLeft,
        isRunning: false,
        sessionsCompleted: state.sessionsCompleted,
        workDuration: state.workDuration,
        shortBreak: state.shortBreak,
        longBreak: state.longBreak,
      }),
    },
  ),
);
