<template>
  <div class="camp-settings-container">
    <div class="settings-header">
      <div class="header-content">
        <div class="header-title">
          <Icon name="Settings" :size="32" class="header-icon" />
          <div>
            <h1>Camp Settings</h1>
            <p class="header-description">
              Configure your camp's core settings and infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Tab Navigation -->
    <div class="tabs-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{
          active:
            tab.type === 'regular'
              ? activeTab === tab.id
              : activeCategory === tab.id,
        }"
        @click="handleTabClick(tab)"
      >
        <Icon :name="tab.icon" :size="20" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Main Tab Navigation -->
    <div v-if="hasSubTabs && currentCategory" class="sub-tabs-navigation">
      <button
        v-for="subTab in currentCategory.subTabs"
        :key="subTab.id"
        class="tab-button"
        :class="{
          active: activeTab === subTab.id,
        }"
        @click="handleSubTabClick(subTab)"
      >
        <Icon :name="subTab.icon" :size="20" />
        <span>{{ subTab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <Transition name="fade" mode="out-in">
        <SessionsTab v-if="activeTab === 'sessions'" key="sessions" />
        <DurationPresetsTab
          v-else-if="activeTab === 'duration-presets'"
          key="duration-presets"
        />
        <AreasTab v-else-if="activeTab === 'areas'" key="areas" />
        <LocationsTab v-else-if="activeTab === 'locations'" key="locations" />
        <HousingTab v-else-if="activeTab === 'cabins'" key="cabins" />
        <CertificationsTab
          v-else-if="activeTab === 'certifications'"
          key="certifications"
        />
        <RolesTab v-else-if="activeTab === 'roles'" key="roles" />
        <ColorsTab v-else-if="activeTab === 'colors'" key="colors" />
      </Transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useColorsStore,
  useSessionsStore,
  useAreasStore,
  useHousingRoomsStore,
  useCertificationsStore,
  useLocationsStore,
  useLabelsStore,
  useRolesStore,
  useDurationPresetsStore,
} from "@/stores";
import Icon from "@/components/Icon.vue";

import ColorsTab from "@/components/settings/ColorsTab.vue";
import SessionsTab from "@/components/settings/SessionsTab.vue";
import DurationPresetsTab from "@/components/settings/DurationPresetsTab.vue";
import AreasTab from "@/components/settings/AreasTab.vue";
import HousingTab from "@/components/settings/HousingTab.vue";
import CertificationsTab from "@/components/settings/CertificationsTab.vue";
import LocationsTab from "@/components/settings/LocationsTab.vue";
import LabelsTab from "@/components/settings/LabelsTab.vue";
import RolesTab from "@/components/settings/RolesTab.vue";

export default defineComponent({
  name: "CampSettings",
  components: {
    Icon,
    ColorsTab,
    SessionsTab,
    DurationPresetsTab,
    AreasTab,
    HousingTab,
    CertificationsTab,
    LocationsTab,
    LabelsTab,
    RolesTab,
  },
  setup() {
    const colorsStore = useColorsStore();
    const sessionsStore = useSessionsStore();
    const areasStore = useAreasStore();
    const housingRoomsStore = useHousingRoomsStore();
    const certificationsStore = useCertificationsStore();
    const locationsStore = useLocationsStore();
    const labelsStore = useLabelsStore();
    const rolesStore = useRolesStore();
    const durationPresetsStore = useDurationPresetsStore();
    return {
      colorsStore,
      sessionsStore,
      areasStore,
      housingRoomsStore,
      certificationsStore,
      locationsStore,
      labelsStore,
      rolesStore,
      durationPresetsStore,
    };
  },
  data(): {
    activeTab:
      | "colors"
      | "sessions"
      | "duration-presets"
      | "areas"
      | "locations"
      | "cabins"
      | "certifications"
      | "roles"
      | "labels";
    activeCategory: string | null;
  } {
    return {
      activeTab: "sessions",
      activeCategory: "date-times",
    };
  },
  computed: {
    tabs(): Array<{
      id: string;
      label: string;
      icon: any;
      count: number;
      type: "regular" | "category";
      subTabs?: Array<{
        id:
          | "sessions"
          | "duration-presets"
          | "areas"
          | "locations"
          | "cabins"
          | "certifications"
          | "roles";
        label: string;
        icon: any;
        count: number;
      }>;
    }> {
      return [
        {
          id: "date-times",
          type: "category" as const,
          label: "Date & Times",
          icon: "Clock",
          count:
            this.sessionsStore.sessions.length +
            this.durationPresetsStore.durationPresets.length,
          subTabs: [
            {
              id: "sessions" as const,
              label: "Sessions",
              icon: "CalendarDays",
              count: this.sessionsStore.sessions.length,
            },
            {
              id: "duration-presets" as const,
              label: "Duration Presets",
              icon: "Timer",
              count: this.durationPresetsStore.durationPresets.length,
            },
          ],
        },
        {
          id: "areas-locations",
          type: "category" as const,
          label: "Areas & Locations",
          icon: "Map",
          count:
            this.areasStore.areas.length +
            this.locationsStore.locations.length +
            this.housingRoomsStore.housingRooms.length,
          subTabs: [
            {
              id: "areas" as const,
              label: "Areas",
              icon: "Map",
              count: this.areasStore.areas.length,
            },
            {
              id: "locations" as const,
              label: "Locations",
              icon: "MapPin",
              count: this.locationsStore.locations.length,
            },
            {
              id: "cabins" as const,
              label: "Housing",
              icon: "Bed",
              count: this.housingRoomsStore.housingRooms.length,
            },
          ],
        },
        {
          id: "roles-certifications",
          type: "category" as const,
          label: "Roles & Certifications",
          icon: "Shield",
          count:
            this.rolesStore.roles.length +
            this.certificationsStore.certifications.length,
          subTabs: [
            {
              id: "roles" as const,
              label: "Roles",
              icon: "Shield",
              count: this.rolesStore.roles.length,
            },
            {
              id: "certifications" as const,
              label: "Certifications",
              icon: "Award",
              count: this.certificationsStore.certifications.length,
            },
          ],
        },
        {
          id: "colors",
          type: "regular" as const,
          label: "Colors",
          icon: "Palette",
          count: this.colorsStore.colors.length,
        },
      ];
    },
    currentCategory() {
      if (!this.activeCategory) return null;
      return this.tabs.find((tab) => tab.id === this.activeCategory) || null;
    },
    hasSubTabs(): boolean {
      return (
        this.currentCategory !== null &&
        this.currentCategory.type === "category" &&
        !!this.currentCategory.subTabs
      );
    },
  },
  methods: {
    handleTabClick(tab: any) {
      if (tab.type === "category" && tab.subTabs && tab.subTabs.length > 0) {
        // Set category and show first sub-tab
        this.activeCategory = tab.id;
        this.activeTab = tab.subTabs[0].id;
      } else {
        // Regular tab
        this.activeCategory = null;
        this.activeTab = tab.id;
      }
    },
    handleSubTabClick(subTab: any) {
      this.activeTab = subTab.id;
    },
  },
});
</script>

<style scoped>
.camp-settings-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.settings-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 0.5rem;
  box-shadow: var(--shadow-lg);
}

.header-content {
  max-width: 100%;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.settings-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-description {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.9;
}

.tabs-navigation,
.sub-tabs-navigation {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid lightgray;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  flex-wrap: wrap;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--text-primary);
  background: var(--surface-secondary);
  border-radius: var(--radius) var(--radius) 0 0;
}

.tab-button.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: var(--surface-secondary);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.tab-button.active .tab-count {
  background: var(--accent-color);
  color: white;
}

.content-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.content-layout.has-sidebar {
  gap: 1.5rem;
}

.sidebar-navigation {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0;
  border-right: 1px solid lightgray;
}

.sidebar-tab-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.sidebar-tab-button:hover {
  color: var(--text-primary);
  background: var(--surface-secondary);
}

.sidebar-tab-button.active {
  color: var(--accent-color);
  background: #eff6ff;
}

.sidebar-tab-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.sidebar-tab-label {
  font-weight: 400;
  line-height: 1.3;
}

.sidebar-tab-count {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-weight: 400;
}

.sidebar-tab-button.active .sidebar-tab-count {
  color: var(--accent-color);
}

.tab-content {
  margin-top: 1rem;
  flex: 1;
  min-width: 0;
  animation: fadeIn 0.3s ease;
}

.tab-content-wrapper {
  margin: 0.5rem;
  display: flex;
  flex-direction: column;
}

.tab-content-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-light);
}

.tab-content-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 968px) {
  .content-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-navigation {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 0.5rem 0;
    gap: 0.5rem;
  }

  .sidebar-tab-button {
    min-width: max-content;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 768px) {
  .settings-header {
    padding: 1.5rem;
  }

  .header-title {
    gap: 1rem;
  }

  .header-icon {
    width: 28px;
    height: 28px;
  }

  .settings-header h1 {
    font-size: 1.5rem;
  }

  .header-description {
    font-size: 0.875rem;
  }

  .tabs-navigation {
    gap: 0.25rem;
    padding: 0;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .sidebar-tab-button {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .tab-content-header h2 {
    font-size: 1.25rem;
  }
}
</style>
