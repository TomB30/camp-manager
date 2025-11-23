<template>
  <div class="calendar-view view">
    <LoadingState v-if="loading" message="Loading calendar..." />
    <template v-else>
      <TabHeader
        title="Event Calendar"
        action-text="Event"
        @action="openNewEventModal"
      />

      <FilterBar
        :show-search="true"
        v-model:search-query="searchQuery"
        search-placeholder="Search events by title, room, program, camper, or staff"
        v-model:filter-room="filterRoom"
        v-model:filter-program="filterProgram"
        v-model:filter-staff="filterStaff"
        v-model:filter-group="filterGroup"
        :filters="eventFilters"
        :filtered-count="filteredEvents.length"
        :total-count="
          viewMode === 'daily'
            ? todayEvents.length
            : viewMode === 'weekly'
              ? weekEvents.length
              : monthEvents.length
        "
        :show-count="true"
        @clear="clearEventFilters"
      >
        <template #prepend>
          <div class="calendar-view-toggle">
            <button
              class="btn btn-sm"
              :class="viewMode === 'daily' ? 'btn-primary' : 'btn-secondary'"
              @click="viewMode = 'daily'"
            >
              Daily
            </button>
            <button
              class="btn btn-sm"
              :class="viewMode === 'weekly' ? 'btn-primary' : 'btn-secondary'"
              @click="viewMode = 'weekly'"
            >
              Weekly
            </button>
            <button
              class="btn btn-sm"
              :class="viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'"
              @click="viewMode = 'monthly'"
            >
              Monthly
            </button>
          </div>
        </template>
      </FilterBar>

      <div class="date-navigation">
        <div class="date-display">
          <h3 v-if="viewMode === 'daily'">{{ formatDate(selectedDate) }}</h3>
          <h3 v-else-if="viewMode === 'weekly'">
            {{ formatWeekRange(selectedDate) }}
          </h3>
          <h3 v-else>{{ formatMonthYear(selectedDate) }}</h3>
        </div>
        <div class="date-controls">
          <button class="btn btn-secondary" @click="changeDate(-1)">←</button>
          <button class="btn btn-secondary" @click="goToToday">Today</button>
          <button class="btn btn-secondary" @click="changeDate(1)">→</button>
        </div>
      </div>

      <DailyCalendarView
        v-if="viewMode === 'daily'"
        :events="filteredTodayEvents"
        :rooms="locationsStore.locations"
        :current-date="selectedDate"
        @select-event="selectEvent"
        @create-event="createEventAtHour"
      />

      <WeeklyCalendarView
        v-else-if="viewMode === 'weekly'"
        :week-days="weekDays"
        :events="filteredEvents"
        :rooms="locationsStore.locations"
        @select-event="selectEvent"
        @select-day="selectDay"
        @create-event="createEventAtDateAndHour"
      />

      <MonthlyCalendarView
        v-else
        :selected-date="selectedDate"
        :events="filteredEvents"
        @select-day="selectDay"
        @select-event="selectEvent"
      />
    </template>

    <EventDetailModal
      v-if="!!selectedEventId"
      :event="selectedEvent"
      @close="selectedEventId = null"
      @edit="editEvent"
      @delete="deleteEventConfirm"
    />

    <EventFormModal
      v-if="showEventModal"
      :event-id="editingEventId || undefined"
      :default-event-date="defaultEventDate"
      @close="closeEventModal"
    />

    <EventDeleteModal
      v-if="showDeleteModal"
      :event="eventToDelete"
      @confirm="handleDeleteConfirm"
      @cancel="handleCancelDelete"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useEventsStore,
  useStaffMembersStore,
  useLocationsStore,
  useGroupsStore,
  useProgramsStore,
  useColorsStore,
} from "@/stores";
import { format, addDays, startOfWeek, addWeeks, addMonths } from "date-fns";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import EventDetailModal from "@/components/modals/EventDetailModal.vue";
import EventFormModal from "@/components/modals/EventFormModal.vue";
import EventDeleteModal from "@/components/modals/EventDeleteModal.vue";
import DailyCalendarView from "@/components/DailyCalendarView.vue";
import WeeklyCalendarView from "@/components/WeeklyCalendarView.vue";
import MonthlyCalendarView from "@/components/MonthlyCalendarView.vue";
import type { Event } from "@/generated/api";
import TabHeader from "@/components/settings/TabHeader.vue";
import Icon from "@/components/Icon.vue";
import LoadingState from "@/components/LoadingState.vue";
export default defineComponent({
  name: "Calendar",
  components: {
    FilterBar,
    EventDetailModal,
    EventFormModal,
    EventDeleteModal,
    DailyCalendarView,
    WeeklyCalendarView,
    MonthlyCalendarView,
    TabHeader,
    Icon,
    LoadingState,
  },
  data() {
    return {
      loading: false,
      selectedDate: new Date(),
      selectedEventId: null as string | null,
      editingEventId: null as string | null,
      showEventModal: false,
      viewMode: "daily" as "daily" | "weekly" | "monthly",
      showDeleteModal: false,
      eventToDelete: null as Event | null,
      searchQuery: "",
      filterRoom: "",
      filterProgram: "",
      filterStaff: "",
      filterGroup: "",
      defaultEventDate: new Date(),
    };
  },
  async created() {
    this.loading = true;
    try {
      await Promise.all([
        this.eventsStore.loadEvents(),
        this.staffMembersStore.loadStaffMembers(),
        this.locationsStore.loadLocations(),
        this.groupsStore.loadGroups(),
        this.programsStore.loadPrograms(),
        this.colorsStore.loadColors(),
      ]);
    } finally {
      this.loading = false;
    }
  },
  mounted() {
    this.handleEventIdFromQuery();
  },
  watch: {
    "$route.query.eventId": {
      handler() {
        this.handleEventIdFromQuery();
      },
    },
  },
  computed: {
    eventsStore() {
      return useEventsStore();
    },
    staffMembersStore() {
      return useStaffMembersStore();
    },
    locationsStore() {
      return useLocationsStore();
    },
    groupsStore() {
      return useGroupsStore();
    },
    programsStore() {
      return useProgramsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    weekDays() {
      const start = startOfWeek(this.selectedDate);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    },
    weekEvents() {
      return this.weekDays.flatMap((day) =>
        this.eventsStore.eventsForDate(day),
      );
    },
    monthEvents() {
      const start = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth(),
        1,
      );
      const end = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth() + 1,
        0,
      );

      return this.eventsStore.events.filter((event) => {
        const eventDate = new Date(event.spec.startDate);
        return eventDate >= start && eventDate <= end;
      });
    },
    eventFilters(): Filter[] {
      return [
        {
          model: "filterProgram",
          value: this.filterProgram,
          placeholder: "Filter by Program",
          options: this.programsStore.programs.map((program) => ({
            label: program.meta.name,
            value: program.meta.id,
          })),
        },
        {
          model: "filterRoom",
          value: this.filterRoom,
          placeholder: "Filter by Room",
          options: this.locationsStore.locations.map((room) => ({
            label: room.meta.name,
            value: room.meta.id,
          })),
        },
        {
          model: "filterGroup",
          value: this.filterGroup,
          placeholder: "Filter by Group",
          options: [
            ...this.groupsStore.groups.map((group) => ({
              label: `${group.meta.name} (Camper Group)`,
              value: group.meta.id,
            })),
          ],
        },
        {
          model: "filterStaff",
          value: this.filterStaff,
          placeholder: "Filter by Staff",
          options: this.staffMembersStore.staffMembers
            .sort((a, b) => a.meta.name.localeCompare(b.meta.name))
            .map((staff) => ({
              label: `${staff.meta.name}`,
              value: staff.meta.id,
            })),
        },
      ];
    },
    todayEvents() {
      return this.eventsStore.eventsForDate(this.selectedDate);
    },
    // Memoized lookup maps for efficient filtering (O(1) lookups instead of O(n))
    roomLookupMap() {
      return new Map(
        this.locationsStore.locations.map((r) => [
          r.meta.id,
          r.meta.name.toLowerCase(),
        ]),
      );
    },
    programLookupMap() {
      return new Map(
        this.programsStore.programs.map((p) => [
          p.meta.id,
          p.meta.name.toLowerCase(),
        ]),
      );
    },
    staffLookupMap() {
      return new Map(
        this.staffMembersStore.staffMembers.map((s) => [
          s.meta.id,
          s.meta.name.toLowerCase(),
        ]),
      );
    },
    filteredEvents() {
      // Get base events depending on view mode
      const events =
        this.viewMode === "daily"
          ? this.todayEvents
          : this.viewMode === "weekly"
            ? this.weekEvents
            : this.monthEvents;

      // Early return if no filters are active
      if (
        !this.searchQuery &&
        !this.filterProgram &&
        !this.filterRoom &&
        !this.filterStaff &&
        !this.filterGroup
      ) {
        return events;
      }

      // Use memoized lookup maps for O(1) access
      const roomMap = this.roomLookupMap;
      const programMap = this.programLookupMap;
      const staffMap = this.staffLookupMap;

      // Pre-process search query
      const searchQuery = this.searchQuery
        ? this.searchQuery.toLowerCase()
        : "";

      // Single pass filter combining all conditions
      return events.filter((event) => {
        // Simple filters first (fastest to check)
        if (this.filterProgram && event.spec.programId !== this.filterProgram)
          return false;
        if (this.filterRoom && event.spec.locationId !== this.filterRoom)
          return false;

        if (this.filterGroup) {
          if (
            !event.spec.groupIds ||
            !event.spec.groupIds.includes(this.filterGroup)
          ) {
            return false;
          }
        }

        if (this.filterStaff) {
          const eventStaffIds = this.eventsStore.getEventStaffIds(
            event.meta.id,
          );
          if (!eventStaffIds.includes(this.filterStaff)) {
            return false;
          }
        }

        // Search filter (most expensive, check last)
        if (searchQuery) {
          // Search in event title
          if (event.meta.name.toLowerCase().includes(searchQuery)) return true;

          // Search in room name (using memoized map for O(1) lookup)
          const roomName = roomMap.get(event.spec.locationId || "");
          if (roomName && roomName.includes(searchQuery)) return true;

          // Search in program name (using memoized map for O(1) lookup)
          if (event.spec.programId) {
            const programName = programMap.get(event.spec.programId);
            if (programName && programName.includes(searchQuery)) return true;
          }

          // Search in assigned staff names (using memoized map for O(1) lookup)
          const eventStaffIds = this.eventsStore.getEventStaffIds(
            event.meta.id,
          );
          if (eventStaffIds.length > 0) {
            const hasMatchingStaff = eventStaffIds.some((staffId) => {
              const staffName = staffMap.get(staffId);
              return staffName && staffName.includes(searchQuery);
            });
            if (hasMatchingStaff) return true;
          }

          // No match found in search
          return false;
        }

        // All filters passed
        return true;
      });
    },
    filteredTodayEvents() {
      // For daily view, use filteredEvents directly since it's already filtered by day
      return this.filteredEvents;
    },
    selectedEvent() {
      if (!this.selectedEventId) return null;
      return this.eventsStore.getEventById(this.selectedEventId);
    },
  },
  methods: {
    handleEventIdFromQuery() {
      const eventId = this.$route.query.eventId as string | undefined;
      if (eventId) {
        const event = this.eventsStore.getEventById(eventId);
        if (event) {
          // Set the selected date to the event's date
          this.selectedDate = new Date(event.spec.startDate);
          // Select the event to open the detail modal
          this.selectedEventId = eventId;
          // Clear the query parameter to avoid reopening on page refresh
          this.$router.replace({ query: {} });
        }
      }
    },
    clearEventFilters() {
      this.searchQuery = "";
      this.filterProgram = "";
      this.filterRoom = "";
      this.filterStaff = "";
      this.filterGroup = "";
    },
    formatDate(date: Date): string {
      return format(date, "EEEE, MMMM d, yyyy");
    },
    formatWeekRange(date: Date): string {
      const start = startOfWeek(date);
      const end = addDays(start, 6);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    },
    formatMonthYear(date: Date): string {
      return format(date, "MMMM yyyy");
    },
    changeDate(increment: number) {
      if (this.viewMode === "daily") {
        this.selectedDate = addDays(this.selectedDate, increment);
      } else if (this.viewMode === "weekly") {
        this.selectedDate = addWeeks(this.selectedDate, increment);
      } else {
        this.selectedDate = addMonths(this.selectedDate, increment);
      }
    },
    selectDay(date: Date) {
      this.selectedDate = date;
      this.viewMode = "daily";
    },
    goToToday() {
      this.selectedDate = new Date();
    },
    selectEvent(event: Event) {
      this.selectedEventId = event.meta.id;
    },
    editEvent() {
      this.editingEventId = this.selectedEventId;
      this.showEventModal = true;
    },
    openNewEventModal() {
      this.showEventModal = true;
    },
    createEventAtHour(hour: number) {
      // Set the default event date to the selected date and the selected hour
      const eventDate = new Date(this.selectedDate);
      eventDate.setHours(hour, 0, 0, 0);
      this.defaultEventDate = eventDate;
      this.showEventModal = true;
    },
    createEventAtDateAndHour({ date, hour }: { date: Date; hour: number }) {
      // Set the default event date to the specific date and hour
      const eventDate = new Date(date);
      eventDate.setHours(hour, 0, 0, 0);
      this.defaultEventDate = eventDate;
      this.showEventModal = true;
    },
    closeEventModal() {
      this.showEventModal = false;
      this.editingEventId = null;
      this.defaultEventDate = new Date();
      this.eventsStore.loadEvents();
    },
    deleteEventConfirm() {
      if (!this.selectedEventId) return;
      const event = this.eventsStore.getEventById(this.selectedEventId);
      if (!event) return;
      
      this.eventToDelete = event;
      this.showDeleteModal = true;
    },
    async handleDeleteConfirm(deleteScope: "single" | "future" | "all") {
      if (!this.eventToDelete) return;

      await this.eventsStore.deleteEvent(this.eventToDelete.meta.id, deleteScope);
      this.selectedEventId = null;
      this.showDeleteModal = false;
      this.eventToDelete = null;
    },
    handleCancelDelete() {
      this.showDeleteModal = false;
      this.eventToDelete = null;
    },
  },
});
</script>

<style lang="scss" scoped>
.calendar-view {
  .view {
    margin: 0 0;
  }
}
/* Calendar View Toggle */
.calendar-view-toggle {
  display: flex;
  gap: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 2px;
  background: var(--background);
}

.calendar-view-toggle .btn {
  padding: 0.5rem 1rem;
  border-radius: calc(var(--radius) - 2px);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
}

/* Date Navigation Bar */
.date-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  margin-bottom: 0.5rem;
  box-shadow: var(--shadow);
  .date-display h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .date-controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    .btn {
      @media (max-width: 768px) {
        padding: 0.5rem;
      }
    }
  }
}
</style>
