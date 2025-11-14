import { defineStore } from "pinia";

export type SidebarMode = "main" | "settings";

interface UIState {
  sidebarMode: SidebarMode;
}

export const useUIStore = defineStore("ui", {
  state: (): UIState => ({
    sidebarMode: "main",
  }),

  actions: {
    setSidebarMode(mode: SidebarMode) {
      this.sidebarMode = mode;
    },

    toggleToSettings() {
      this.sidebarMode = "settings";
    },

    toggleToMain() {
      this.sidebarMode = "main";
    },
  },
});
