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
        :key="event.id"
        class="event-block"
        :style="getEventStyle(event)"
        @click="$emit('select-event', event)"
      >
        <div class="event-title">{{ event.title }}</div>
        <div class="event-details">
          <div class="event-room text-xs">{{ getLocationName(event.locationId) }}</div>
          <div class="event-capacity text-xs">
            {{ event.enrolledCamperIds?.length || 0 }}/{{ event.capacity }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Event, Location } from '@/types';

export default defineComponent({
  name: 'DailyCalendarView',
  props: {
    events: {
      type: Array as PropType<Event[]>,
      required: true,
    },
    rooms: {
      type: Array as PropType<Location[]>,
      required: true,
    },
  },
  emits: ['select-event', 'create-event'],
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
    getLocationName(locationId: string): string {
      const location = this.rooms.find(r => r.id === locationId);
      return location?.name || 'Unknown Location';
    },
    handleTimeSlotClick(hour: number) {
      this.$emit('create-event', hour);
    },
    getEventStyle(event: Event) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const dayStartMinutes = 7 * 60; // 7 AM
      
      // Calculate position from top of grid (after header)
      const top = ((startMinutes - dayStartMinutes) / 60) * 80; // 80px per hour
      const height = ((endMinutes - startMinutes) / 60) * 80;
      
      // Find overlapping events
      const overlappingEvents = this.events.filter(otherEvent => {
        if (otherEvent.id === event.id) return false;
        
        const otherStart = new Date(otherEvent.startTime);
        const otherEnd = new Date(otherEvent.endTime);
        const otherStartMinutes = otherStart.getHours() * 60 + otherStart.getMinutes();
        const otherEndMinutes = otherEnd.getHours() * 60 + otherEnd.getMinutes();
        
        // Check if events overlap
        return (
          (startMinutes < otherEndMinutes && endMinutes > otherStartMinutes)
        );
      });
      
      // Sort all overlapping events (including current) by start time, then by id for consistency
      const allOverlapping = [event, ...overlappingEvents].sort((a, b) => {
        const aStart = new Date(a.startTime).getTime();
        const bStart = new Date(b.startTime).getTime();
        if (aStart !== bStart) return aStart - bStart;
        return a.id.localeCompare(b.id);
      });
      
      const eventIndex = allOverlapping.findIndex(e => e.id === event.id);
      const totalOverlapping = allOverlapping.length;
      
      // Calculate width and position - split the total single-event width among overlapping events
      const width = totalOverlapping > 1 
        ? `calc((100% - 32px) / ${totalOverlapping})` 
        : 'calc(100% - 32px)';
      const left = totalOverlapping > 1 
        ? `calc(16px + (100% - 32px) * ${eventIndex} / ${totalOverlapping})` 
        : '16px';
      
      return {
        top: `${top}px`,
        height: `${height}px`,
        width,
        left,
        background: event.color || '#3B82F6',
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
</style>

