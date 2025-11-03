<template>
  <div class="container">
    <div class="view">
      <ViewHeader title="Dashboard" />

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #3b82f6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Campers</div>
            <div class="stat-value">{{ campersStore.campers.length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #10b981">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Staff Members</div>
            <div class="stat-value">
              {{ staffMembersStore.staffMembers.length }}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f3e8ff; color: #9333ea">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Locations</div>
            <div class="stat-value">{{ locationsStore.locations.length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #d97706">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Today's Events</div>
            <div class="stat-value">{{ todayEvents.length }}</div>
          </div>
        </div>
      </div>

      <!-- Conflicts Alert -->
      <!-- <div
        v-if="mainStore.conflicts.length > 0"
        class="conflicts-section"
        style="border-left: 4px solid var(--error-color)"
      >
        <div class="card-header">
          <h3>⚠️ Scheduling Conflicts ({{ mainStore.conflicts.length }})</h3>
        </div>
        <div class="conflicts-list">
          <div
            v-for="conflict in mainStore.conflicts"
            :key="conflict.entityId"
            class="conflict-item"
            @click="() => {}"
          >
            <span class="badge badge-error">{{
              formatConflictType(conflict.type)
            }}</span>
            <span class="conflict-message">{{ conflict.message }}</span>
            <span class="conflict-action">View Event →</span>
          </div>
        </div>
      </div> -->

      <!-- Today's Schedule -->
      <div class="schedule-section">
        <div class="card-header">
          <h3>Today's Schedule</h3>
        </div>
        <div v-if="todayEvents.length === 0" class="empty-state">
          <p>No events scheduled for today</p>
        </div>
        <div v-else class="events-timeline">
          <div
            v-for="event in sortedTodayEvents"
            :key="event.meta.id"
            class="timeline-event"
            :style="{
              borderLeftColor: event.spec.colorId
                ? colorsStore.getColorById(event.spec.colorId)?.spec.hexValue
                : '#2196F3',
            }"
          >
            <div class="timeline-time">
              {{ formatTime(event.spec.startDate) }} -
              {{ formatTime(event.spec.endDate) }}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">{{ event.meta.name }}</div>
              <div class="timeline-meta">
                <span class="badge badge-primary">
                  {{ getLocationName(event.spec.locationId || "") }}
                </span>
                <span class="text-sm">
                  {{ eventsStore.getEventCamperIds(event.meta.id).length }}/{{
                    event.spec.capacity
                  }}
                  campers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Birthdays -->
      <div class="birthdays-section">
        <div class="card-header">
          <h3>🎂 Upcoming Birthdays</h3>
        </div>
        <div v-if="upcomingBirthdays.length === 0" class="empty-state">
          <p>No birthdays in the next 7 days</p>
        </div>
        <div v-else class="birthdays-list">
          <div
            v-for="birthday in upcomingBirthdays"
            :key="`${birthday.type}-${birthday.id}`"
            class="birthday-item"
            :class="{ 'birthday-today': birthday.isToday }"
          >
            <div class="birthday-icon">
              <Icon
                :name="birthday.type === 'camper' ? 'Users' : 'UsersRound'"
                :size="20"
              />
            </div>
            <div class="birthday-content">
              <div class="birthday-name">
                {{ birthday.name }}
                <span v-if="birthday.isToday" class="badge badge-success ml-2"
                  >Today!</span
                >
              </div>
              <div class="birthday-meta">
                <span class="birthday-date">{{ birthday.dateFormatted }}</span>
                <span class="birthday-age"
                  >Turning {{ birthday.upcomingAge }}</span
                >
                <span
                  class="badge badge-primary badge-sm"
                  :class="{
                    'badge-info': birthday.type === 'staff',
                  }"
                >
                  {{ birthday.type === "camper" ? "Camper" : "Staff" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-grid">
        <div class="card">
          <h4 class="mb-2">Quick Actions</h4>
          <div class="flex flex-col gap-2">
            <button class="btn btn-primary" @click="$router.push('/calendar')">
              <Icon name="Calendar" :size="18" />
              View Calendar
            </button>
            <button class="btn btn-secondary" @click="$router.push('/campers')">
              <Icon name="Users" :size="18" />
              Manage Campers
            </button>
            <button class="btn btn-secondary" @click="$router.push('/staff')">
              <Icon name="UsersRound" :size="18" />
              Manage Staff
            </button>
          </div>
        </div>

        <div class="card">
          <h4 class="mb-2">Recent Enrollments</h4>
          <div class="recent-list">
            <div
              v-for="camper in recentCampers"
              :key="camper.meta.id"
              class="recent-item"
            >
              <span class="font-medium">{{ camper.meta.name }}</span>
              <span class="text-xs"
                >Age {{ calculateAge(camper.spec.birthday) }}</span
              >
            </div>
          </div>
        </div>

        <div class="card">
          <h4 class="mb-2">Room Capacity</h4>
          <div class="capacity-list">
            <div
              v-for="room in locationsStore.locations.slice(0, 5)"
              :key="room.meta.id"
              class="capacity-item"
            >
              <div class="capacity-name">{{ room.meta.name }}</div>
              <div class="capacity-bar">
                <div
                  class="capacity-fill"
                  :style="{
                    width: `${getRoomUsage(room.meta.id)}%`,
                    background:
                      getRoomUsage(room.meta.id) > 80
                        ? 'var(--error-color)'
                        : 'var(--success-color)',
                  }"
                ></div>
              </div>
              <div class="capacity-text text-xs">
                {{ getRoomUsage(room.meta.id).toFixed(0) }}% used
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useCampersStore,
  useStaffMembersStore,
  useLocationsStore,
  useEventsStore,
  useMainStore,
  useAreasStore,
  useColorsStore,
} from "@/stores";
import { format } from "date-fns";
import Icon from "@/components/Icon.vue";
import ViewHeader from "@/components/ViewHeader.vue";
import type { Event, Camper } from "@/generated/api";
import { dateUtils } from "@/utils/dateUtils";

interface BirthdayPerson {
  id: string;
  name: string;
  type: "camper" | "staff";
  birthday: string;
  upcomingAge: number;
  dateFormatted: string;
  isToday: boolean;
  daysUntil: number;
}

export default defineComponent({
  name: "Dashboard",
  components: {
    Icon,
    ViewHeader,
  },
  computed: {
    campersStore() {
      return useCampersStore();
    },
    staffMembersStore() {
      return useStaffMembersStore();
    },
    locationsStore() {
      return useLocationsStore();
    },
    eventsStore() {
      return useEventsStore();
    },
    mainStore() {
      return useMainStore();
    },
    areasStore() {
      return useAreasStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    todayEvents(): Event[] {
      const today = new Date();
      return this.eventsStore.eventsForDate(today);
    },
    sortedTodayEvents(): Event[] {
      return [...this.todayEvents].sort(
        (a, b) =>
          new Date(a.spec.startDate).getTime() -
          new Date(b.spec.startDate).getTime(),
      );
    },
    recentCampers(): Camper[] {
      return [...this.campersStore.campers]
        .sort((a, b) => {
          const dateA = a.spec.registrationDate
            ? new Date(a.spec.registrationDate).getTime()
            : 0;
          const dateB = b.spec.registrationDate
            ? new Date(b.spec.registrationDate).getTime()
            : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
    },
    upcomingBirthdays(): BirthdayPerson[] {
      const today = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
      );
      const daysToCheck = 7; // Show birthdays for the next 7 days
      const birthdays: BirthdayPerson[] = [];

      // Helper function to check if a birthday is within the next N days
      const getBirthdayInfo = (
        birthday: string,
        name: string,
        id: string,
        type: "camper" | "staff",
      ) => {
        if (!birthday) return null;

        const birthDate = new Date(birthday);
        const currentYear = today.getFullYear();

        // Get this year's birthday
        const thisYearBirthday = new Date(
          currentYear,
          birthDate.getMonth(),
          birthDate.getDate(),
        );

        // Get next year's birthday in case we've passed this year's
        const nextYearBirthday = new Date(
          currentYear + 1,
          birthDate.getMonth(),
          birthDate.getDate(),
        );

        // Determine which birthday to use
        const upcomingBirthday =
          thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;

        // Calculate days until birthday
        const diffTime = upcomingBirthday.getTime() - today.getTime();

        const daysUntil = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Only include if within the next N days
        if (daysUntil < 0 || daysUntil > daysToCheck) return null;

        // Calculate upcoming age
        const upcomingAge =
          upcomingBirthday.getFullYear() - birthDate.getFullYear();

        // Format the date
        let dateFormatted: string;
        if (daysUntil === 0) {
          dateFormatted = "Today";
        } else if (daysUntil === 1) {
          dateFormatted = "Tomorrow";
        } else {
          dateFormatted = format(upcomingBirthday, "MMM d");
        }

        return {
          id,
          name,
          type,
          birthday,
          upcomingAge,
          dateFormatted,
          isToday: daysUntil === 0,
          daysUntil,
        };
      };

      // Check campers
      this.campersStore.campers.forEach((camper) => {
        const info = getBirthdayInfo(
          camper.spec.birthday,
          camper.meta.name,
          camper.meta.id,
          "camper",
        );
        if (info) birthdays.push(info);
      });

      // Check staff members
      this.staffMembersStore.staffMembers.forEach((staff) => {
        const info = getBirthdayInfo(
          staff.spec.birthday || "",
          staff.meta.name,
          staff.meta.id,
          "staff",
        );

        if (info) birthdays.push(info);
      });

      // Sort by days until birthday (today first, then upcoming)
      return birthdays.sort((a, b) => a.daysUntil - b.daysUntil);
    },
  },
  methods: {
    calculateAge(birthday: string): number {
      return dateUtils.calculateAge(birthday);
    },
    formatTime(dateStr: string): string {
      return format(new Date(dateStr), "h:mm a");
    },
    formatConflictType(type?: string): string {
      if (!type) return "Unknown";
      return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getLocationName(locationId: string): string | null | undefined {
      const location = this.areasStore.getAreaById(locationId);
      return location?.meta.name || "Unknown Location";
    },
    getRoomUsage(locationId: string): number {
      const roomEvents = this.eventsStore.locationEvents(locationId);
      if (roomEvents.length === 0) return 0;

      const room = this.areasStore.getAreaById(locationId);
      if (!room || !room.spec.capacity) return 0;

      // Calculate average capacity usage
      const totalUsage = roomEvents.reduce((sum, event) => {
        return (
          sum +
          (this.eventsStore.getEventCamperIds(event.meta.id).length /
            room.spec.capacity!) *
            100
        );
      }, 0);

      return totalUsage / roomEvents.length;
    },
    // goToConflictEvent(conflict: Conflict): void {
    //   // Determine which event ID to use based on conflict type
    //   let eventId: string | undefined;

    //   if (
    //     conflict.type === "event_overcapacity" ||
    //     conflict.type === "missing_certification"
    //   ) {
    //     // For event-specific conflicts, entityId is the event ID
    //     eventId = conflict.entityId;
    //   } else if (
    //     conflict.conflictingIds &&
    //     conflict.conflictingIds.length > 0
    //   ) {
    //     // For other conflicts (camper/staff double booking, room overcapacity), use first conflicting event
    //     eventId = conflict.conflictingIds[0];
    //   }

    //   if (!eventId) return;

    //   // Get the event to determine its date
    //   const event = this.eventsStore.getEventById(eventId);
    //   if (!event) return;

    //   // Navigate to calendar with event ID as query parameter
    //   this.$router.push({
    //     path: "/calendar",
    //     query: { eventId },
    //   });
    // },
  },
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  transition: all 0.15s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Sections with consistent spacing */
.conflicts-section,
.schedule-section,
.birthdays-section {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.conflicts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.conflict-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.conflict-item:hover {
  background: var(--surface);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.conflict-message {
  font-size: 0.875rem;
  color: var(--text-primary);
  flex: 1;
}

.conflict-action {
  font-size: 0.875rem;
  color: var(--error-color);
  font-weight: 500;
  opacity: 0.7;
  transition: opacity 0.15s ease;
  white-space: nowrap;
}

.conflict-item:hover .conflict-action {
  opacity: 1;
}

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-event {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: var(--background);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  border-left: 3px solid var(--accent-color);
  transition: all 0.15s ease;
}

.timeline-event:hover {
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.timeline-time {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 140px;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.timeline-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.empty-state {
  padding: 3rem;
  text-align: center;
}

/* Birthdays Section */
.birthdays-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.birthday-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--background);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  transition: all 0.15s ease;
}

.birthday-item:hover {
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.birthday-item.birthday-today {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 193, 7, 0.05) 100%
  );
  border-color: rgba(255, 215, 0, 0.3);
}

.birthday-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.birthday-content {
  flex: 1;
  min-width: 0;
}

.birthday-name {
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.birthday-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.birthday-date {
  font-weight: 500;
  color: var(--text-primary);
}

.birthday-age {
  color: var(--text-secondary);
}

.ml-2 {
  margin-left: 0.5rem;
}

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.quick-actions-grid .card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.quick-actions-grid .card h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.recent-list,
.capacity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--background);
  border-radius: var(--radius);
}

.capacity-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.capacity-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.capacity-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  transition:
    width 0.3s,
    background 0.3s;
}

.capacity-text {
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .timeline-event {
    flex-direction: column;
    gap: 0.75rem;
  }

  .timeline-time {
    min-width: auto;
  }
}
</style>
