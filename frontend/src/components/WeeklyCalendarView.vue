<template>
  <div class="weekly-grid">
    <div class="weekly-grid-inner">
      <!-- Days headers -->
      <div class="week-header">
        <div class="time-col-header">Time</div>
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="day-header clickable"
          @click="handleDateHeaderClick(day)"
        >
          <div class="day-name">{{ formatDayName(day) }}</div>
          <div class="day-date">{{ formatDayDate(day) }}</div>
        </div>
      </div>

      <!-- Time rows -->
      <div class="week-body">
        <div v-for="hour in hours" :key="hour" class="week-row">
          <div class="time-col">{{ formatHour(hour) }}</div>
          <div
            v-for="day in weekDays"
            :key="`${hour}-${day.toISOString()}`"
            class="day-col"
            @click="handleCellClick(day, hour)"
          >
            <!-- Events for this hour and day -->
            <div
              v-for="event in getEventsForDayAndHour(day, hour)"
              :key="event.meta.id"
              class="week-event"
              :class="{ 'multi-day-event': isMultiDayEvent(event) }"
              :style="getWeekEventStyle(event, day)"
              @click.stop="$emit('select-event', event)"
            >
              <q-tooltip v-if="isMultiDayEvent(event)" :delay="300">
                Multi-day event: {{ formatDate(event.spec.startDate) }} to {{ formatDate(event.spec.endDate) }}
              </q-tooltip>
              <div class="week-event-title">
                {{ event.meta.name }}
                <span v-if="isMultiDayEvent(event)" class="multi-day-indicator">
                  {{ getMultiDayIndicator(event, day) }}
                </span>
              </div>
              <div class="week-event-details">
                <div class="week-event-room text-xs">
                  {{ getLocationName(event.spec.locationId || "") }}
                </div>
                <div
                  class="week-event-capacity text-xs"
                  v-if="event.spec.capacity"
                >
                  {{ getEnrolledCount(event.meta.id) }}/{{
                    event.spec.capacity
                  }}
                </div>
              </div>
              <div
                class="event-groups text-xs"
                v-if="event.spec.groupIds && event.spec.groupIds.length > 0"
              >
                <span
                  v-for="(groupId, idx) in event.spec.groupIds"
                  :key="groupId"
                >
                  {{ groupNamesById[groupId]
                  }}<span v-if="idx < event.spec.groupIds.length - 1">, </span>
                </span>
              </div>
            </div>
          </div>
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
  name: "WeeklyCalendarView",
  props: {
    weekDays: {
      type: Array as PropType<Date[]>,
      required: true,
    },
    events: {
      type: Array as PropType<Event[]>,
      required: true,
    },
    rooms: {
      type: Array as PropType<Location[]>,
      required: true,
    },
  },
  emits: ["select-event", "select-day", "create-event"],
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
    formatDayName(date: Date): string {
      return format(date, "EEEE");
    },
    formatDayDate(date: Date): string {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      return isToday
        ? `${format(date, "MMM d")} (Today)`
        : format(date, "MMM d");
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    },
    handleDateHeaderClick(day: Date) {
      this.$emit("select-day", day);
    },
    handleCellClick(day: Date, hour: number) {
      this.$emit("create-event", { date: day, hour });
    },
    getLocationName(locationId: string): string {
      const location = this.rooms.find((r) => r.meta.id === locationId);
      return location?.meta.name || "Unknown Location";
    },
    getEnrolledCount(eventId: string): number {
      return this.eventsStore.getEventCamperIds(eventId).length;
    },
    getEventsForDayAndHour(day: Date, hour: number): Event[] {
      // Show events that are active on this day, but only once per day at the earliest visible hour
      const targetYear = day.getFullYear();
      const targetMonth = day.getMonth();
      const targetDay = day.getDate();
      
      return this.events.filter((event) => {
        const eventStart = new Date(event.spec.startDate);
        const eventEnd = new Date(event.spec.endDate);
        
        // Create day start/end for comparison
        const dayStart = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);
        const dayEnd = new Date(targetYear, targetMonth, targetDay, 23, 59, 59);
        
        // Check if event is active on this day
        const isActiveOnDay = eventStart <= dayEnd && eventEnd >= dayStart;
        
        if (!isActiveOnDay) return false;
        
        // For single-day events, show them in their starting hour
        const isSingleDay =
          eventStart.getDate() === eventEnd.getDate() &&
          eventStart.getMonth() === eventEnd.getMonth() &&
          eventStart.getFullYear() === eventEnd.getFullYear();
        
        if (isSingleDay) {
          // Show in the hour it starts
          return eventStart.getHours() === hour;
        }
        
        // For multi-day events:
        // - If it starts on this day, show in its starting hour
        // - If it started before this day, show at the earliest visible hour (7 AM)
        const startsOnDay =
          eventStart.getFullYear() === targetYear &&
          eventStart.getMonth() === targetMonth &&
          eventStart.getDate() === targetDay;
        
        if (startsOnDay) {
          return eventStart.getHours() === hour;
        } else {
          // Starts before this day, show at 7 AM
          return hour === 7;
        }
      });
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
    getMultiDayIndicator(event: Event, day: Date): string {
      const start = new Date(event.spec.startDate);
      const end = new Date(event.spec.endDate);
      
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      
      const eventStartDay = new Date(start);
      eventStartDay.setHours(0, 0, 0, 0);
      
      const eventEndDay = new Date(end);
      eventEndDay.setHours(0, 0, 0, 0);
      
      const isFirstDay = eventStartDay.getTime() === dayStart.getTime();
      const isLastDay = eventEndDay.getTime() === dayStart.getTime();
      
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
    getWeekEventStyle(event: Event, day: Date) {
      const start = new Date(event.spec.startDate);
      const end = new Date(event.spec.endDate);

      // Check if this is a multi-day event
      const isMultiDay =
        start.getDate() !== end.getDate() ||
        start.getMonth() !== end.getMonth() ||
        start.getFullYear() !== end.getFullYear();

      let startMinutes = start.getHours() * 60 + start.getMinutes();
      let endMinutes = end.getHours() * 60 + end.getMinutes();

      // For multi-day events, adjust times based on which day we're rendering
      if (isMultiDay) {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        
        const eventStartDay = new Date(start);
        eventStartDay.setHours(0, 0, 0, 0);
        
        const eventEndDay = new Date(end);
        eventEndDay.setHours(0, 0, 0, 0);
        
        // If event started before this day, start from beginning (7 AM visible start)
        if (eventStartDay < dayStart) {
          startMinutes = 7 * 60;
        }
        
        // If event continues past this day, extend to end (9 PM visible end)
        if (eventEndDay > dayStart) {
          endMinutes = 21 * 60;
        }
      }

      const duration = endMinutes - startMinutes;

      // Calculate height based on duration (80px per hour)
      const heightPx = (duration / 60) * 80 - 4; // Subtract 4px for spacing

      // Find overlapping events for the same day
      const eventDate = start.toISOString().split("T")[0];
      const dayEvents = this.events.filter((e) => {
        const eDate = new Date(e.spec.startDate).toISOString().split("T")[0];
        return eDate === eventDate;
      });

      const overlappingEvents = dayEvents.filter((otherEvent) => {
        if (otherEvent.meta.id === event.meta.id) return false;

        const otherStart = new Date(otherEvent.spec.startDate);
        const otherEnd = new Date(otherEvent.spec.endDate);
        let otherStartMinutes =
          otherStart.getHours() * 60 + otherStart.getMinutes();
        let otherEndMinutes =
          otherEnd.getHours() * 60 + otherEnd.getMinutes();

        // Check if other event is multi-day
        const otherIsMultiDay =
          otherStart.getDate() !== otherEnd.getDate() ||
          otherStart.getMonth() !== otherEnd.getMonth() ||
          otherStart.getFullYear() !== otherEnd.getFullYear();

        // For multi-day events, extend to end of visible day
        if (otherIsMultiDay) {
          otherEndMinutes = 21 * 60;
        }

        // Check if events overlap in time
        return (
          startMinutes < otherEndMinutes && endMinutes > otherStartMinutes
        );
      });

      // Sort all overlapping events
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

      // Calculate width and position for overlapping events
      const width =
        totalOverlapping > 1 ? `${98 / totalOverlapping}%` : "calc(100% - 4px)";
      const left =
        totalOverlapping > 1
          ? `${(eventIndex * 98) / totalOverlapping}%`
          : "2px";

      return {
        background: event.spec.colorId
          ? this.colorsStore.getColorById(event.spec.colorId)?.spec.hexValue
          : "#3B82F6",
        width,
        left,
        height: `${heightPx}px`,
      };
    },
  },
});
</script>

<style scoped>
.weekly-grid {
  grid-column: 1 / -1;
  grid-row: 4;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow-x: auto;
  overflow-y: visible !important;
  border: 1px solid var(--border-light);
}

.weekly-grid-inner {
  min-width: 1200px;
  overflow: visible;
}

.week-header {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  border-bottom: 2px solid var(--border-color);
  background: var(--surface-secondary);
}

.time-col-header {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  border-right: 1px solid var(--border-light);
  position: sticky;
  left: 0;
  z-index: 30;
  background: var(--surface-secondary);
}

.day-header {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.day-header:hover {
  background: var(--surface-secondary);
}

.day-name {
  font-size: 0.9375rem;
  color: var(--text-primary);
  font-weight: 600;
}

.day-date {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.week-body {
  position: relative;
  overflow: visible;
}

.week-row {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  border-bottom: 1px solid var(--border-light);
  min-height: 80px;
  height: 80px;
  overflow: visible !important;
  contain: none;
}

.time-col {
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  border-right: 1px solid var(--border-light);
  background: var(--surface-secondary);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.75rem;
  position: sticky;
  left: 0;
  z-index: 200;
}

.day-col {
  border-right: 1px solid var(--border-light);
  padding: 0;
  position: relative;
  min-height: 80px;
  height: 80px;
  background: var(--surface);
  overflow: visible !important;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.day-col:hover {
  background: var(--background);
}

.week-event {
  padding: 0.5rem;
  border-radius: var(--radius);
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--shadow);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: absolute;
  top: 2px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 0.75rem;
  pointer-events: auto;
}

.week-event:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  z-index: 200;
}

.week-event-title {
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.week-event-details {
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
}

.week-event-room,
.week-event-capacity {
  opacity: 0.95;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.multi-day-event {
  border-left: 3px solid rgba(255, 255, 255, 0.9);
  border-bottom: 2px dashed rgba(255, 255, 255, 0.5);
}

.multi-day-indicator {
  margin-left: 0.25rem;
  font-weight: bold;
  opacity: 0.95;
  font-size: 0.9rem;
}
</style>
