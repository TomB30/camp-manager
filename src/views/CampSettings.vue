<template>
  <div class="camp-settings-container">
    <div class="settings-header">
      <div class="header-content">
        <div class="header-title">
          <Settings :size="32" class="header-icon" />
          <div>
            <h1>Camp Settings</h1>
            <p class="header-description">Configure your camp's core settings and infrastructure</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ 'active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" :size="20" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <Transition name="fade" mode="out-in">
        <SessionsTab v-if="activeTab === 'sessions'" key="sessions" />
        <LocationsTab v-else-if="activeTab === 'rooms'" key="rooms" />
        <AreasTab v-else-if="activeTab === 'locations'" key="locations" />
        <HousingTab v-else-if="activeTab === 'cabins'" key="cabins" />
        <CertificationsTab v-else-if="activeTab === 'certifications'" key="certifications" />
        <ColorsTab v-else-if="activeTab === 'colors'" key="colors" />
        <LabelsTab v-else-if="activeTab === 'labels'" key="labels" />
      </Transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useColorsStore, useSessionsStore, useAreasStore, useHousingRoomsStore, useCertificationsStore, useLocationsStore, useLabelsStore } from '@/stores';
import { Settings, Palette, CalendarDays, Map, Bed, Award, MapPin, Tag } from 'lucide-vue-next';
import ColorsTab from '@/components/settings/ColorsTab.vue';
import SessionsTab from '@/components/settings/SessionsTab.vue';
import AreasTab from '@/components/settings/AreasTab.vue';
import HousingTab from '@/components/settings/HousingTab.vue';
import CertificationsTab from '@/components/settings/CertificationsTab.vue';
import LocationsTab from '@/components/settings/LocationsTab.vue';
import LabelsTab from '@/components/settings/LabelsTab.vue';

export default defineComponent({
  name: 'CampSettings',
  components: {
    Settings,
    ColorsTab,
    SessionsTab,
    AreasTab,
    HousingTab,
    CertificationsTab,
    LocationsTab,
    LabelsTab,
  },
  setup() {
    const colorsStore = useColorsStore();
    const sessionsStore = useSessionsStore();
    const areasStore = useAreasStore();
    const housingRoomsStore = useHousingRoomsStore();
    const certificationsStore = useCertificationsStore();
    const locationsStore = useLocationsStore();
    const labelsStore = useLabelsStore();
    return { colorsStore, sessionsStore, areasStore, housingRoomsStore, certificationsStore, locationsStore, labelsStore };
  },
  data(): { activeTab: 'colors' | 'sessions' | 'locations' | 'cabins' | 'certifications' | 'rooms' | 'labels' } {
    return {
      activeTab: 'sessions',
    };
  },
  computed: {
    tabs(): Array<{
      id: 'colors' | 'sessions' | 'locations' | 'cabins' | 'certifications' | 'rooms' | 'labels';
      label: string;
      icon: any;
      count: number;
    }> {
      return [
        {
          id: 'sessions' as const,
          label: 'Sessions',
          icon: CalendarDays,
          count: this.sessionsStore.sessions.length,
        },
        {
          id: 'locations' as const,
          label: 'Areas',
          icon: Map,
          count: this.areasStore.areas.length,
        },
        {
          id: 'rooms' as const,
          label: 'Locations',
          icon: MapPin,
          count: this.locationsStore.locations.length,
        },
        {
          id: 'cabins' as const,
          label: 'Housing',
          icon: Bed,
          count: this.housingRoomsStore.housingRooms.length,
        },
        {
          id: 'certifications' as const,
          label: 'Certifications',
          icon: Award,
          count: this.certificationsStore.certifications.length,
        },
        {
          id: 'colors' as const,
          label: 'Colors',
          icon: Palette,
          count: this.colorsStore.colors.length,
        },
        {
          id: 'labels' as const,
          label: 'Labels',
          icon: Tag,
          count: this.labelsStore.labels.length,
        },
      ];
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
  margin-bottom: 2rem;
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

.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--border-light);
  margin-bottom: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 0.25rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
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

.tab-content {
  animation: fadeIn 0.3s ease;
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
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }
}
</style>

