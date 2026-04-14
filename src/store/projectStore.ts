import { create } from 'zustand';

interface ProjectState {
  projects: any[];
  isLoading: boolean;
  setProjects: (projects: any[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  setProjects: (projects) => set({ projects }),
  setLoading: (isLoading) => set({ isLoading }),
}));
