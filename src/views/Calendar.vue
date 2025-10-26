<template>
  <div class="container">
    <div class="calendar-view">
      <ViewHeader title="Event Calendar">
        <template #actions>
          <BaseButton
            color="primary"
            @click="openNewEventModal"
            icon="add"
            label="Event"
          />
        </template>
      </ViewHeader>

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
        @select-event="selectEvent"
        @create-event="createEventAtHour"
      />

      <WeeklyCalendarView
        v-else-if="viewMode === 'weekly'"
        :week-days="weekDays"
        :events="filteredEvents"
        :rooms="locationsStore.locations"
        @select-event="selectEvent"
      />

      <MonthlyCalendarView
        v-else
        :selected-date="selectedDate"
        :events="filteredEvents"
        @select-day="selectDay"
        @select-event="selectEvent"
      />
    </div>

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
      :default-event-date="selectedDate"
      @close="closeEventModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      title="Delete Event"
      :message="`Are you sure you want to delete the event '${confirmAction?.data.eventName}'?`"
      details="This action cannot be undone. All assigned groups will be removed from this event."
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
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
} from "@/stores";
import { format, addDays, startOfWeek, addWeeks, addMonths } from "date-fns";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import ViewHeader from "@/components/ViewHeader.vue";
import EventDetailModal from "@/components/modals/EventDetailModal.vue";
import EventFormModal from "@/components/modals/EventFormModal.vue";
import DailyCalendarView from "@/components/DailyCalendarView.vue";
import WeeklyCalendarView from "@/components/WeeklyCalendarView.vue";
import MonthlyCalendarView from "@/components/MonthlyCalendarView.vue";
import type { Event } from "@/types";

export default defineComponent({
  name: "Calendar",
  components: {
    ConfirmModal,
    FilterBar,
    ViewHeader,
    EventDetailModal,
    EventFormModal,
    DailyCalendarView,
    WeeklyCalendarView,
    MonthlyCalendarView,
  },
  data() {
    return {
      selectedDate: new Date(),
      selectedEventId: null as string | null,
      editingEventId: null as string | null,
      showEventModal: false,
      viewMode: "daily" as "daily" | "weekly" | "monthly",
      showConfirmModal: false,
      confirmAction: null as {
        type: "deleteEvent";
        data?: any;
      } | null,
      searchQuery: "",
      filterRoom: "",
      filterProgram: "",
      filterStaff: "",
      filterGroup: "",
      defaultEventDate: new Date(),
    };
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
        const eventDate = new Date(event.startDate);
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
            label: program.name,
            value: program.id,
          })),
        },
        {
          model: "filterRoom",
          value: this.filterRoom,
          placeholder: "Filter by Room",
          options: this.locationsStore.locations.map((room) => ({
            label: room.name,
            value: room.id,
          })),
        },
        {
          model: "filterGroup",
          value: this.filterGroup,
          placeholder: "Filter by Group",
          options: [
            ...this.groupsStore.groups.map((group) => ({
              label: `${group.name} (Camper Group)`,
              value: group.id,
            })),
          ],
        },
        {
          model: "filterStaff",
          value: this.filterStaff,
          placeholder: "Filter by Staff",
          options: this.staffMembersStore.staffMembers
            .sort((a, b) =>
              `${a.firstName} ${a.lastName}`.localeCompare(
                `${b.firstName} ${b.lastName}`,
              ),
            )
            .map((staff) => ({
              label: `${staff.firstName} ${staff.lastName}`,
              value: staff.id,
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
        this.locationsStore.locations.map((r) => [r.id, r.name.toLowerCase()]),
      );
    },
    programLookupMap() {
      return new Map(
        this.programsStore.programs.map((p) => [p.id, p.name.toLowerCase()]),
      );
    },
    staffLookupMap() {
      return new Map(
        this.staffMembersStore.staffMembers.map((s) => [
          s.id,
          `${s.firstName} ${s.lastName}`.toLowerCase(),
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
        if (this.filterProgram && event.programId !== this.filterProgram)
          return false;
        if (this.filterRoom && event.locationId !== this.filterRoom)
          return false;

        if (this.filterGroup) {
          if (!event.groupIds || !event.groupIds.includes(this.filterGroup)) {
            return false;
          }
        }

        if (this.filterStaff) {
          const eventStaffIds = this.eventsStore.getEventStaffIds(event.id);
          if (!eventStaffIds.includes(this.filterStaff)) {
            return false;
          }
        }

        // Search filter (most expensive, check last)
        if (searchQuery) {
          // Search in event title
          if (event.title.toLowerCase().includes(searchQuery)) return true;

          // Search in room name (using memoized map for O(1) lookup)
          const roomName = roomMap.get(event.locationId || "");
          if (roomName && roomName.includes(searchQuery)) return true;

          // Search in program name (using memoized map for O(1) lookup)
          if (event.programId) {
            const programName = programMap.get(event.programId);
            if (programName && programName.includes(searchQuery)) return true;
          }

          // Search in assigned staff names (using memoized map for O(1) lookup)
          const eventStaffIds = this.eventsStore.getEventStaffIds(event.id);
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
          this.selectedDate = new Date(event.startDate);
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
      this.selectedEventId = event.id;
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
      this.defaultEventDate = this.selectedDate;
      this.defaultEventDate.setHours(hour, 0, 0, 0);
      this.showEventModal = true;
    },
    closeEventModal() {
      this.showEventModal = false;
      this.editingEventId = null;
      this.defaultEventDate = new Date();
    },
    deleteEventConfirm() {
      if (!this.selectedEventId) return;
      const event = this.eventsStore.getEventById(this.selectedEventId);
      this.confirmAction = {
        type: "deleteEvent",
        data: { eventId: this.selectedEventId, eventName: event?.title },
      };
      this.showConfirmModal = true;
    },
    async handleConfirmAction() {
      if (!this.confirmAction) return;

      if (this.confirmAction.type === "deleteEvent") {
        await this.eventsStore.deleteEvent(this.confirmAction.data.eventId);
        this.selectedEventId = null;
      }

      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    handleCancelConfirm() {
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
  },
});
</script>

<style scoped>
.calendar-view {
  max-width: 1400px;
  margin: 0 auto;
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
}

/* Date Navigation Bar */
.date-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.date-display h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.date-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .date-navigation {
    flex-direction: column;
    text-align: center;
  }

  .date-controls {
    justify-content: center;
    width: 100%;
  }
}
</style>
