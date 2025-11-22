<template>
  <div class="calendar-grid">
    <!-- Timeline sidebar -->
    <div class="timeline-sidebar">
      <div class="timeline-label">Time</div>
      <div v-for="hour in hours" :key="hour" class="timeline-hour">
        {{ formatHour(hour) }}
      </div>
    </div>

    <!-- Events grid -->
    <div class="events-grid">
      <!-- Time grid background -->
      <div class="grid-lines">
        <div
          v-for="hour in hours"
          :key="hour"
          class="grid-line"
          @click="handleTimeSlotClick(hour)"
        ></div>
      </div>

      <!-- Events -->
      <div
        v-for="event in events"
        :key="event.meta.id"
        class="event-block"
        :class="{ 'multi-day-event': isMultiDayEvent(event) }"
        :style="getEventStyle(event)"
        @click="$emit('select-event', event)"
      >
        <q-tooltip v-if="isMultiDayEvent(event)" :delay="300">
          Multi-day event: {{ formatDate(event.spec.startDate) }} to
          {{ formatDate(event.spec.endDate) }}
        </q-tooltip>
        <div class="event-title">
          {{ event.meta.name }}
          <span v-if="isMultiDayEvent(event)" class="multi-day-indicator">
            {{ getMultiDayIndicator(event) }}
          </span>
        </div>
        <div class="event-details">
          <div class="event-room text-xs">
            {{ getLocationName(event.spec.locationId || "unknown") }}
          </div>
          <div class="event-capacity text-xs" v-if="event.spec.capacity">
            {{ getEnrolledCount(event.meta.id) }}/{{ event.spec.capacity }}
          </div>
        </div>
        <div
          class="event-groups text-xs"
          v-if="event.spec.groupIds && event.spec.groupIds.length > 0"
        >
          <span v-for="(groupId, idx) in event.spec.groupIds" :key="groupId">
            {{ groupNamesById[groupId]
            }}<span v-if="idx < event.spec.groupIds.length - 1">, </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { format } from "date-fns";
import { useColorsStore, useEventsStore, useGroupsStore } from "@/stores";
import type { Event, Group, Location } from "@/generated/api";

export default defineComponent({
  name: "DailyCalendarView",
  props: {
    events: {
      type: Array as PropType<Event[]>,
      required: true,
    },
    rooms: {
      type: Array as PropType<Location[]>,
      required: true,
    },
    currentDate: {
      type: Date,
      required: true,
    },
  },
  emits: ["select-event", "create-event"],
  setup() {
    const eventsStore = useEventsStore();
    const colorsStore = useColorsStore();
    const groupsStore = useGroupsStore();
    return { eventsStore, colorsStore, groupsStore };
  },
  data() {
    return {
      hours: Array.from({ length: 14 }, (_, i) => i + 7),
    };
  },
  computed: {
    groupNamesById(): Record<string, string> {
      return this.groupsStore.groups.reduce(
        (acc: Record<string, string>, group: Group) => {
          acc[group.meta.id] = group.meta.name;
          return acc;
        },
        {} as Record<string, string>,
      );
    },
  },
  methods: {
    formatHour(hour: number): string {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:00 ${ampm}`;
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    },
    getLocationName(locationId: string): string {
      const location = this.rooms.find((r) => r.meta.id === locationId);
      return location?.meta.name || "Unknown Location";
    },
    getEnrolledCount(eventId: string): number {
      return this.eventsStore.getEventCamperIds(eventId).length;
    },
    handleTimeSlotClick(hour: number) {
      this.$emit("create-event", hour);
    },
    isMultiDayEvent(event: Event): boolean {
      const start = new Date(event.spec.startDate);
      const end = new Date(event.spec.endDate);
      return (
        start.getDate() !== end.getDate() ||
        start.getMonth() !== end.getMonth() ||
        start.getFullYear() !== end.getFullYear()
      );
    },
    getMultiDayIndicator(event: Event): string {
      const start = new Date(event.spec.startDate);
      const end = new Date(event.spec.endDate);

      const currentDayStart = new Date(this.currentDate);
      currentDayStart.setHours(0, 0, 0, 0);

      const eventStartDay = new Date(start);
      eventStartDay.setHours(0, 0, 0, 0);

      const eventEndDay = new Date(end);
      eventEndDay.setHours(0, 0, 0, 0);

      const isFirstDay = eventStartDay.getTime() === currentDayStart.getTime();
      const isLastDay = eventEndDay.getTime() === currentDayStart.getTime();

      if (isFirstDay && !isLastDay) {
        return "→"; // Starts here, continues
      } else if (isLastDay && !isFirstDay) {
        return "←"; // Ends here
      } else if (!isFirstDay && !isLastDay) {
        return "↔"; // Continues through
      } else {
        return "→"; // Default
      }
    },
    getEventStyle(event: Event) {
      const start = new Date(event.spec.startDate);
      const end = new Date(event.spec.endDate);

      // Check if event spans multiple days
      const isMultiDay =
        start.getDate() !== end.getDate() ||
        start.getMonth() !== end.getMonth() ||
        start.getFullYear() !== end.getFullYear();

      let startMinutes = start.getHours() * 60 + start.getMinutes();
      let endMinutes = end.getHours() * 60 + end.getMinutes();
      const dayStartMinutes = 7 * 60; // 7 AM
      const dayEndMinutes = 21 * 60; // 9 PM (end of visible hours)

      // For multi-day events, adjust to show only the portion visible on this day
      if (isMultiDay) {
        // Use the current date being displayed, not today
        const currentDayStart = new Date(this.currentDate);
        currentDayStart.setHours(0, 0, 0, 0);

        const eventStartDay = new Date(start);
        eventStartDay.setHours(0, 0, 0, 0);

        const eventEndDay = new Date(end);
        eventEndDay.setHours(0, 0, 0, 0);

        // If event started before the current displayed day, show from beginning of visible hours
        if (eventStartDay < currentDayStart) {
          startMinutes = dayStartMinutes;
        }

        // If event continues past the current displayed day, extend to end of visible hours
        const nextDay = new Date(currentDayStart);
        nextDay.setDate(nextDay.getDate() + 1);

        if (eventEndDay >= nextDay) {
          endMinutes = dayEndMinutes;
        }
      }

      // Calculate position from top of grid (after header)
      const top = ((startMinutes - dayStartMinutes) / 60) * 80; // 80px per hour
      const height = ((endMinutes - startMinutes) / 60) * 80;

      // Find overlapping events
      const overlappingEvents = this.events.filter((otherEvent) => {
        if (otherEvent.meta.id === event.meta.id) return false;

        const otherStart = new Date(otherEvent.spec.startDate);
        const otherEnd = new Date(otherEvent.spec.endDate);
        let otherStartMinutes =
          otherStart.getHours() * 60 + otherStart.getMinutes();
        let otherEndMinutes = otherEnd.getHours() * 60 + otherEnd.getMinutes();

        // Check if other event is multi-day
        const otherIsMultiDay =
          otherStart.getDate() !== otherEnd.getDate() ||
          otherStart.getMonth() !== otherEnd.getMonth() ||
          otherStart.getFullYear() !== otherEnd.getFullYear();

        // For multi-day events, adjust times based on current displayed day
        if (otherIsMultiDay) {
          const currentDayStart = new Date(this.currentDate);
          currentDayStart.setHours(0, 0, 0, 0);

          const otherStartDay = new Date(otherStart);
          otherStartDay.setHours(0, 0, 0, 0);

          const otherEndDay = new Date(otherEnd);
          otherEndDay.setHours(0, 0, 0, 0);

          if (otherStartDay < currentDayStart) {
            otherStartMinutes = dayStartMinutes;
          }

          const nextDay = new Date(currentDayStart);
          nextDay.setDate(nextDay.getDate() + 1);

          if (otherEndDay >= nextDay) {
            otherEndMinutes = dayEndMinutes;
          }
        }

        // Check if events overlap
        return startMinutes < otherEndMinutes && endMinutes > otherStartMinutes;
      });

      // Sort all overlapping events (including current) by start time, then by id for consistency
      const allOverlapping = [event, ...overlappingEvents].sort((a, b) => {
        const aStart = new Date(a.spec.startDate).getTime();
        const bStart = new Date(b.spec.startDate).getTime();
        if (aStart !== bStart) return aStart - bStart;
        return a.meta.id.localeCompare(b.meta.id);
      });

      const eventIndex = allOverlapping.findIndex(
        (e) => e.meta.id === event.meta.id,
      );
      const totalOverlapping = allOverlapping.length;

      // Calculate width and position - split the total single-event width among overlapping events
      const width =
        totalOverlapping > 1
          ? `calc((100% - 32px) / ${totalOverlapping})`
          : "calc(100% - 32px)";
      const left =
        totalOverlapping > 1
          ? `calc(16px + (100% - 32px) * ${eventIndex} / ${totalOverlapping})`
          : "16px";

      return {
        top: `${top}px`,
        height: `${height}px`,
        width,
        left,
        background: event.spec.colorId
          ? this.colorsStore.getColorById(event.spec.colorId)?.spec.hexValue
          : "#3B82F6",
      };
    },
  },
});
</script>

<style scoped>
.calendar-grid {
  grid-column: 1 / -1;
  grid-row: 4;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  min-height: 900px;
  border: 1px solid var(--border-light);
}

.timeline-sidebar {
  border-right: 1px solid var(--border-color);
  background: var(--surface-secondary);
}

.timeline-label {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.timeline-hour {
  height: 80px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
}

.events-grid {
  position: relative;
  padding-top: 50px;
  min-height: 1120px; /* 14 hours * 80px */
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 50px;
}

.grid-line {
  height: 80px;
  border-bottom: 1px solid var(--border-light);
  background: var(--surface);
  cursor: pointer;
  transition: background 0.15s ease;
}

.grid-line:hover {
  background: var(--surface-secondary);
}

.event-block {
  position: absolute;
  border-radius: var(--radius-lg);
  padding: 6px;
  color: white;
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.15s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-top: 50px; /* Account for header */
}

.event-block:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
  z-index: 100 !important;
  border-color: rgba(255, 255, 255, 0.6);
}

.event-title {
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 2px;
  line-height: 1.3;
}

.event-details {
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
}

.event-room,
.event-capacity {
  opacity: 0.95;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.multi-day-event {
  border-left: 4px solid rgba(255, 255, 255, 0.9);
  border-bottom: 2px dashed rgba(255, 255, 255, 0.5);
}

.multi-day-indicator {
  margin-left: 0.25rem;
  font-weight: bold;
  opacity: 0.95;
  font-size: 0.9rem;
}
</style>
