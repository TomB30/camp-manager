import { defineStore } from 'pinia';
import type { Conflict } from '@/types';
import { conflictDetector } from '@/services';
import { useCampersStore } from './campersStore';
import { useStaffMembersStore } from './staffMembersStore';
import { useEventsStore } from './eventsStore';
import { useLocationsStore } from './locationsStore';
import { useHousingRoomsStore } from './housingRoomsStore';
import { useGroupsStore } from './groupsStore';
import { useProgramsStore } from './programsStore';
import { useActivitiesStore } from './activitiesStore';
import { useAreasStore } from './areasStore';
import { useCertificationsStore } from './certificationsStore';
import { useColorsStore } from './colorsStore';
import { useSessionsStore } from './sessionsStore';
import { useLabelsStore } from './labelsStore';

/**
 * Main Store
 * Coordinates all entity stores and handles cross-cutting concerns like conflicts
 */
export const useMainStore = defineStore('main', {
  state: () => ({
    conflicts: [] as Conflict[],
    loading: false,
  }),

  actions: {
    /**
     * Load all data from all stores
     */
    async loadAll(): Promise<void> {
      this.loading = true;
      try {
        const campersStore = useCampersStore();
        const staffMembersStore = useStaffMembersStore();
        const eventsStore = useEventsStore();
        const locationsStore = useLocationsStore();
        const housingRoomsStore = useHousingRoomsStore();
        const groupsStore = useGroupsStore();
        const programsStore = useProgramsStore();
        const activitiesStore = useActivitiesStore();
        const areasStore = useAreasStore();
        const certificationsStore = useCertificationsStore();
        const colorsStore = useColorsStore();
        const sessionsStore = useSessionsStore();
        const labelsStore = useLabelsStore();

        await Promise.all([
          campersStore.loadCampers(),
          staffMembersStore.loadStaffMembers(),
          eventsStore.loadEvents(),
          locationsStore.loadLocations(),
          housingRoomsStore.loadHousingRooms(),
          groupsStore.loadGroups(),
          programsStore.loadPrograms(),
          activitiesStore.loadActivities(),
          areasStore.loadAreas(),
          certificationsStore.loadCertifications(),
          colorsStore.loadColors(),
          sessionsStore.loadSessions(),
          labelsStore.loadLabels(),
        ]);

        this.updateConflicts();
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update conflicts based on current data
     */
    updateConflicts(): void {
      const eventsStore = useEventsStore();
      const campersStore = useCampersStore();
      const staffMembersStore = useStaffMembersStore();
      const locationsStore = useLocationsStore();
      const certificationsStore = useCertificationsStore();

      this.conflicts = conflictDetector.detectConflicts(
        eventsStore.events,
        campersStore.campers,
        staffMembersStore.staffMembers,
        locationsStore.locations,
        certificationsStore.certifications
      );
    },
  }
});

