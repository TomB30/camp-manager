<template>
  <div class="monthly-grid">
    <div class="monthly-grid-inner">
      <!-- Days of week header -->
      <div class="month-header">
        <div v-for="day in daysOfWeek" :key="day" class="day-name-header">
          {{ day }}
        </div>
      </div>

      <!-- Calendar days -->
      <div class="month-body">
        <div
          v-for="day in calendarDays"
          :key="day.date.toISOString()"
          class="day-cell"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-events': day.eventCount > 0
          }"
          @click="handleDayClick(day)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          
          <!-- Event list -->
          <div v-if="day.events.length > 0" class="event-list">
            <div
              v-for="event in getVisibleEvents(day.events)"
              :key="event.id"
              class="event-item"
              :style="{ backgroundColor: event.colorId ? colorsStore.getColorById(event.colorId)?.hexValue : '#3B82F6' }"
              :title="event.title"
              @click.stop="$emit('select-event', event)"
            >
              <span class="event-time">{{ formatEventTime(event.startTime) }}</span>
              <span class="event-title">{{ event.title }}</span>
            </div>
            <div v-if="day.events.length > maxEventsPerDay" class="more-events-text">
              +{{ day.events.length - maxEventsPerDay }} more events
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format 
} from 'date-fns';
import type { Event } from '@/types';
import { useColorsStore } from '@/stores';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  eventCount: number;
  events: Event[];
}

export default defineComponent({
  name: 'MonthlyCalendarView',
  props: {
    selectedDate: {
      type: Date,
      required: true,
    },
    events: {
      type: Array as PropType<Event[]>,
      required: true,
    },
  },
  emits: ['select-day', 'select-event'],
  data() {
    return {
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      maxEventsPerDay: 3, // Maximum events to show before displaying "+x more"
      colorsStore: useColorsStore(),
    };
  },
  computed: {
    calendarDays(): CalendarDay[] {
      const monthStart = startOfMonth(this.selectedDate);
      const monthEnd = endOfMonth(this.selectedDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      const today = new Date();
      
      return days.map(date => {
        const dayEvents = this.events.filter(event => {
          const eventDate = new Date(event.startTime);
          return isSameDay(eventDate, date);
        });
        
        return {
          date,
          dayNumber: date.getDate(),
          isCurrentMonth: isSameMonth(date, this.selectedDate),
          isToday: isSameDay(date, today),
          eventCount: dayEvents.length,
          events: dayEvents,
        };
      });
    },
  },
  methods: {
    handleDayClick(day: CalendarDay) {
      this.$emit('select-day', day.date);
    },
    formatEventTime(dateStr: string): string {
      return format(new Date(dateStr), 'h:mma');
    },
    getVisibleEvents(events: Event[]) {
      // Sort events by start time
      const sortedEvents = [...events].sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
      return sortedEvents.slice(0, this.maxEventsPerDay);
    },
  },
});
</script>

<style scoped>
.monthly-grid {
  grid-column: 1 / -1;
  grid-row: 4;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.monthly-grid-inner {
  display: flex;
  flex-direction: column;
  min-height: 700px;
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 2px solid var(--border-color);
  background: var(--surface-secondary);
}

.day-name-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-right: 1px solid var(--border-light);
}

.day-name-header:last-child {
  border-right: none;
}

.month-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  grid-auto-rows: minmax(100px, auto);
}

.day-cell {
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  padding: 0.5rem;
  background: var(--surface);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  position: relative;
  overflow: hidden;
}

.day-cell:hover {
  background: var(--background);
  /* transform: scale(1.02); */
  /* z-index: 10; */
  box-shadow: var(--shadow-md);
}

.day-cell.other-month {
  background: var(--background);
  opacity: 0.5;
}

.day-cell.other-month:hover {
  opacity: 0.7;
}

.day-cell.today {
  background: var(--primary-light);
}

/* .day-cell.today .day-number {
  background: var(--accent-color);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
} */

.day-number {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.day-cell.other-month .day-number {
  color: var(--text-secondary);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  overflow: hidden;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.375rem;
  border-radius: 3px;
  color: white;
  font-size: 0.75rem;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.15s ease;
  overflow: hidden;
  white-space: nowrap;
}

.event-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.event-time {
  font-weight: 600;
  flex-shrink: 0;
  font-size: 0.7rem;
}

.event-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-events-text {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 0.25rem 0.375rem;
  text-align: left;
}

.day-cell.has-events {
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .month-body {
    grid-auto-rows: minmax(80px, 1fr);
  }
  
  .day-cell {
    padding: 0.5rem;
  }
  
  .event-count {
    font-size: 1.25rem;
  }
  
  .event-label {
    font-size: 0.625rem;
  }
}
</style>

