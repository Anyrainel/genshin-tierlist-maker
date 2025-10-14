import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TierAssignment, TierCustomization } from '../data/types';

interface TierListState {
  tierAssignments: TierAssignment;
  tierCustomization: TierCustomization;
  customTitle: string;

  // Actions
  setTierAssignments: (assignments: TierAssignment | ((prev: TierAssignment) => TierAssignment)) => void;
  setTierCustomization: (customization: TierCustomization) => void;
  setCustomTitle: (title: string) => void;
  resetTierList: () => void;
  loadTierListData: (data: {
    tierAssignments: TierAssignment;
    tierCustomization: TierCustomization;
    customTitle?: string;
  }) => void;
}

export const useTierListStore = create<TierListState>()(
  persist(
    (set) => ({
      // Initial state
      tierAssignments: {},
      tierCustomization: {},
      customTitle: '',

      // Actions
      setTierAssignments: (assignments) =>
        set((state) => ({
          tierAssignments: typeof assignments === 'function'
            ? assignments(state.tierAssignments)
            : assignments
        })),

      setTierCustomization: (customization) =>
        set({ tierCustomization: customization }),

      setCustomTitle: (title) =>
        set({ customTitle: title }),

      resetTierList: () =>
        set({
          tierAssignments: {},
          tierCustomization: {},
          customTitle: ''
        }),

      loadTierListData: (data) =>
        set({
          tierAssignments: data.tierAssignments,
          tierCustomization: data.tierCustomization,
          customTitle: data.customTitle || '',
        }),
    }),
    {
      name: 'tierlist-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        tierAssignments: state.tierAssignments,
        tierCustomization: state.tierCustomization,
        customTitle: state.customTitle,
      }),
    }
  )
);
