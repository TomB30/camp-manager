<template>
  <div class="events-by-date">
    <div v-if="events.length > 0" class="events-list">
      <div 
        v-for="(dateEvents, dateKey) in groupedEvents"
        :key="dateKey"
        class="event-date-group"
      >
        <div class="event-date-header">{{ formatDateHeader(dateKey) }}</div>
        <div class="event-date-items">
          <div 
            v-for="event in dateEvents"
            :key="event.id"
            class="event-item"
            :style="{ borderLeftColor: event.color || '#2196F3' }"
            @click="$emit('event-click', event)"
          >
            <div class="event-item-title">{{ event.title }}</div>
            <div class="event-item-details">
              <div class="event-item-time">
                {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
              </div>
              <div v-if="showLocation && event.locationId" class="event-item-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                {{ getLocationName(event.locationId) }}
              </div>
              <div v-if="showEnrollment" class="event-item-enrollment">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {{ getEnrolledCount(event) }}/{{ event.capacity }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-secondary">{{ emptyMessage }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format } from 'date-fns';
import type { Event } from '@/types';
import { useEventsStore } from '@/stores';

export default defineComponent({
  name: 'EventsByDate',
  props: {
    events: {
      type: Array as PropType<Event[]>,
      required: true
    },
    emptyMessage: {
      type: String,
      default: 'No events'
    },
    showLocation: {
      type: Boolean,
      default: false
    },
    showEnrollment: {
      type: Boolean,
      default: false
    },
    getLocationName: {
      type: Function as PropType<(locationId: string) => string>,
      default: () => () => 'Unknown Location'
    }
  },
  emits: ['event-click'],
  setup() {
    const eventsStore = useEventsStore();
    return { eventsStore };
  },
  computed: {
    groupedEvents(): Record<string, Event[]> {
      // Sort events by start time
      const sortedEvents = [...this.events].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      
      // Group by date
      const grouped: Record<string, Event[]> = {};
      
      sortedEvents.forEach(event => {
        const eventDate = new Date(event.startTime);
        const dateKey = format(eventDate, 'yyyy-MM-dd');
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      });
      
      return grouped;
    }
  },
  methods: {
    formatDateHeader(dateKey: string): string {
      const date = new Date(dateKey);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return `Today, ${format(date, 'EEEE, MMMM d')}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${format(date, 'EEEE, MMMM d')}`;
      } else {
        return format(date, 'EEEE, MMMM d, yyyy');
      }
    },
    formatTime(dateStr: string): string {
      return format(new Date(dateStr), 'h:mm a');
    },
    getEnrolledCount(event: Event): number {
      return this.eventsStore.getEventCamperIds(event.id).length;
    }
  }
});
</script>

<style scoped>
.events-by-date {
  width: 100%;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-date-group {
  margin-bottom: 1.5rem;
}

.event-date-group:last-child {
  margin-bottom: 0;
}

.event-date-header {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
  text-transform: capitalize;
}

.event-date-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
  transition: all 0.15s ease;
  cursor: pointer;
}

.event-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow);
}

.event-item-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.event-item-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.event-item-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.event-item-room {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-item-room svg {
  flex-shrink: 0;
}

.event-item-enrollment {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.event-item-enrollment svg {
  flex-shrink: 0;
}

.text-secondary {
  color: var(--text-secondary);
  font-style: italic;
}
</style>

