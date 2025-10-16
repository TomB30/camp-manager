<template>
  <div class="weekly-grid">
    <div class="weekly-grid-inner">
      <!-- Days headers -->
      <div class="week-header">
        <div class="time-col-header">Time</div>
        <div v-for="day in weekDays" :key="day.toISOString()" class="day-header">
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
          >
            <!-- Events for this hour and day -->
            <div 
              v-for="event in getEventsForDayAndHour(day, hour)"
              :key="event.id"
              class="week-event"
              :style="getWeekEventStyle(event, day)"
              @click="$emit('select-event', event)"
            >
              <div class="week-event-title">{{ event.title }}</div>
              <div class="week-event-details">
                <div class="week-event-room text-xs">
                  {{ getLocationName(event.locationId) }}
                </div>
                <div class="week-event-capacity text-xs">
                  {{ event.enrolledCamperIds?.length || 0 }}/{{ event.capacity }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { format } from 'date-fns';
import { filterEventsByDateAndHour } from '@/utils/dateUtils';
import type { Event, Location } from '@/types';

export default defineComponent({
  name: 'WeeklyCalendarView',
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
  emits: ['select-event'],
  data() {
    return {
      hours: Array.from({ length: 14 }, (_, i) => i + 7),
    };
  },
  methods: {
    formatHour(hour: number): string {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:00 ${ampm}`;
    },
    formatDayName(date: Date): string {
      return format(date, 'EEEE');
    },
    formatDayDate(date: Date): string {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      return isToday ? `${format(date, 'MMM d')} (Today)` : format(date, 'MMM d');
    },
    getLocationName(locationId: string): string {
      const location = this.rooms.find(r => r.id === locationId);
      return location?.name || 'Unknown Location';
    },
    getEventsForDayAndHour(day: Date, hour: number) {
      return filterEventsByDateAndHour(this.events, day, hour);
    },
    getWeekEventStyle(event: Event, _day: Date) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const durationMinutes = endMinutes - startMinutes;
      
      // Calculate height based on duration (80px per hour)
      const heightPx = (durationMinutes / 60) * 80 - 4; // Subtract 4px for spacing
      
      // Find overlapping events for the same day
      const eventDate = start.toISOString().split('T')[0];
      const dayEvents = this.events.filter(e => {
        const eDate = new Date(e.startTime).toISOString().split('T')[0];
        return eDate === eventDate;
      });
      
      const overlappingEvents = dayEvents.filter(otherEvent => {
        if (otherEvent.id === event.id) return false;
        
        const otherStart = new Date(otherEvent.startTime);
        const otherEnd = new Date(otherEvent.endTime);
        const otherStartMinutes = otherStart.getHours() * 60 + otherStart.getMinutes();
        const otherEndMinutes = otherEnd.getHours() * 60 + otherEnd.getMinutes();
        
        // Check if they're in the same hour block
        const eventHour = start.getHours();
        const otherHour = otherStart.getHours();
        
        // Check if events overlap
        return eventHour === otherHour || (
          startMinutes < otherEndMinutes && endMinutes > otherStartMinutes
        );
      });
      
      // Sort all overlapping events
      const allOverlapping = [event, ...overlappingEvents].sort((a, b) => {
        const aStart = new Date(a.startTime).getTime();
        const bStart = new Date(b.startTime).getTime();
        if (aStart !== bStart) return aStart - bStart;
        return a.id.localeCompare(b.id);
      });
      
      const eventIndex = allOverlapping.findIndex(e => e.id === event.id);
      const totalOverlapping = allOverlapping.length;
      
      // Calculate width and position for overlapping events
      const width = totalOverlapping > 1 ? `${98 / totalOverlapping}%` : 'calc(100% - 4px)';
      const left = totalOverlapping > 1 ? `${(eventIndex * 98) / totalOverlapping}%` : '2px';
      
      return {
        background: event.color || '#3B82F6',
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
</style>

