<template>
  <div class="container">
    <div class="calendar-view">
      <div class="calendar-header">
        <h2>Event Calendar</h2>
      </div>

      <!-- Date Navigation -->
      <div class="calendar-controls card p-2">
        <!-- Date Display -->
        <div class="calendar-date">
            <h3 v-if="viewMode === 'daily'">{{ formatDate(selectedDate) }}</h3>
            <h3 v-else>{{ formatWeekRange(selectedDate) }}</h3>
          </div>
        <div class="flex gap-2 items-center justify-center flex-wrap">
          <!-- View Toggle -->
          <div class="view-toggle">
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
          </div>

          <!-- Navigation -->
          <button class="btn btn-secondary" @click="changeDate(-1)">
            ← Previous {{ viewMode === 'daily' ? 'Day' : 'Week' }}
          </button>
          <button class="btn btn-secondary" @click="goToToday">Today</button>
          <button class="btn btn-secondary" @click="changeDate(1)">
            Next {{ viewMode === 'daily' ? 'Day' : 'Week' }} →
          </button>
          <button class="btn btn-primary" @click="showEventModal = true">+ New Event</button>
        </div>
      </div>
      
      <!-- Event Filters -->
      <div class="filter-section">
        <FilterBar
          :show-search="false"
          v-model:filterEventType="filterEventType"
          v-model:filterRoom="filterRoom"
          :filters="eventFilters"
          :filtered-count="viewMode === 'daily' ? filteredTodayEvents.length : 0"
          :total-count="viewMode === 'daily' ? todayEvents.length : 0"
          :show-count="viewMode === 'daily'"
          @clear="clearEventFilters"
        />
      </div>


      <!-- Daily View -->
      <div v-if="viewMode === 'daily'" class="calendar-grid">
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
            <div v-for="hour in hours" :key="hour" class="grid-line"></div>
          </div>

          <!-- Events -->
          <div 
            v-for="event in filteredTodayEvents"
            :key="event.id"
            class="event-block"
            :style="getEventStyle(event)"
            @click="selectEvent(event)"
          >
            <div class="event-title">{{ event.title }}</div>
            <div class="event-details">
              <div class="event-room text-xs">{{ getRoomName(event.roomId) }}</div>
              <div class="event-capacity text-xs">
                {{ event.enrolledChildrenIds?.length || 0 }}/{{ event.capacity }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly View -->
      <div v-else class="weekly-grid">
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
                  :style="getWeekEventStyle(event)"
                  @click="selectEvent(event)"
                >
                  <div class="week-event-title">{{ event.title }}</div>
                  <div class="week-event-details">
                    <div class="week-event-room text-xs">
                      {{ getRoomName(event.roomId) }}
                    </div>
                    <div class="week-event-capacity text-xs">
                      {{ event.enrolledChildrenIds?.length || 0 }}/{{ event.capacity }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Event Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedEventId" class="modal-overlay" @click.self="selectedEventId = null">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ selectedEvent?.title }}</h3>
            <button class="btn btn-icon btn-secondary" @click="selectedEventId = null">✕</button>
          </div>
          <div class="modal-body">
            <div v-if="selectedEvent">
              <div class="mb-3">
                <div class="text-sm text-secondary mb-1">Time</div>
                <div>{{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}</div>
              </div>

              <div class="mb-3">
                <div class="text-sm text-secondary mb-1">Room</div>
                <div>{{ getRoomName(selectedEvent.roomId) }}</div>
              </div>

              <div class="mb-3">
                <div class="text-sm text-secondary mb-1">Capacity</div>
                <div>
                  {{ selectedEvent.enrolledChildrenIds?.length || 0 }}/{{ selectedEvent.capacity }}
                  <span 
                    v-if="(selectedEvent.enrolledChildrenIds?.length || 0) >= selectedEvent.capacity"
                    class="badge badge-error ml-2"
                  >
                    Full
                  </span>
                </div>
              </div>

              <div class="mb-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm text-secondary">Enrolled Children</div>
                </div>
                <div 
                  class="enrolled-children drop-zone"
                  :class="{ 'drag-over': isDragOver }"
                  @drop="onDrop($event, selectedEvent.id)"
                  @dragover.prevent="isDragOver = true"
                  @dragleave="isDragOver = false"
                >
                  <div
                    v-for="childId in selectedEvent.enrolledChildrenIds"
                    :key="childId"
                    class="enrolled-child draggable"
                    :draggable="true"
                    @dragstart="onDragStart($event, childId, selectedEvent.id)"
                    @dragend="onDragEnd"
                  >
                    <div class="child-info">
                      <div class="font-medium">
                        {{ getChildName(childId) }}
                      </div>
                    </div>
                    <button 
                      class="btn btn-sm btn-error"
                      @click="unenrollChildFromEvent(selectedEvent.id, childId)"
                    >
                      Remove
                    </button>
                  </div>
                  <div v-if="!selectedEvent.enrolledChildrenIds?.length" class="empty-state">
                    <p class="text-secondary text-sm">No children enrolled. Drag and drop to enroll.</p>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="text-sm text-secondary mb-1">Assigned Staff</div>
                <div v-if="selectedEvent.assignedStaffIds?.length" class="flex flex-col gap-1">
                  <span v-for="staffId in selectedEvent.assignedStaffIds" :key="staffId" class="badge badge-primary">
                    {{ getStaffName(staffId) }}
                  </span>
                </div>
                <div v-else class="text-secondary">No staff assigned</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-error" @click="deleteEventConfirm">Delete Event</button>
            <button class="btn btn-secondary" @click="selectedEventId = null">Close</button>
          </div>
        </div>
      </div>

      <!-- Create Event Modal -->
      <div v-if="showEventModal" class="modal-overlay" @click.self="showEventModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Create New Event</h3>
            <button class="btn btn-icon btn-secondary" @click="showEventModal = false">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createEvent">
              <div class="form-group">
                <label class="form-label">Title</label>
                <input v-model="newEvent.title" type="text" class="form-input" required />
              </div>

              <div class="grid grid-cols-2">
                <div class="form-group">
                  <label class="form-label">Start Time</label>
                  <input v-model="newEvent.startTime" type="time" class="form-input" required />
                </div>

                <div class="form-group">
                  <label class="form-label">End Time</label>
                  <input v-model="newEvent.endTime" type="time" class="form-input" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Room</label>
                <select v-model="newEvent.roomId" class="form-select" required>
                  <option value="">Select a room</option>
                  <option v-for="room in store.rooms" :key="room.id" :value="room.id">
                    {{ room.name }} ({{ room.type }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Capacity</label>
                <input v-model.number="newEvent.capacity" type="number" min="1" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Type</label>
                <select v-model="newEvent.type" class="form-select">
                  <option value="activity">Activity</option>
                  <option value="sports">Sports</option>
                  <option value="arts">Arts</option>
                  <option value="education">Education</option>
                  <option value="meal">Meal</option>
                  <option value="free-time">Free Time</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Color</label>
                <input v-model="newEvent.color" type="color" class="form-input" />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showEventModal = false">Cancel</button>
            <button class="btn btn-primary" @click="createEvent">Create Event</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirmation Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      :title="confirmAction?.type === 'deleteEvent' ? 'Delete Event' : 'Remove Child from Event'"
      :message="confirmAction?.type === 'deleteEvent' 
        ? `Are you sure you want to delete the event '${confirmAction.data.eventName}'?` 
        : `Are you sure you want to remove ${confirmAction?.data.childName} from '${confirmAction?.data.eventName}'?`"
      :details="confirmAction?.type === 'deleteEvent' 
        ? 'This action cannot be undone. All enrolled children will be removed from this event.' 
        : 'The child will no longer be enrolled in this event.'"
      :confirm-text="confirmAction?.type === 'deleteEvent' ? 'Delete' : 'Remove'"
      :danger-mode="true"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import { filterEventsByDateAndHour } from '@/utils/dateUtils';
import type { Event } from '@/types/api';

const store = useCampStore();
const selectedDate = ref(new Date());
const selectedEventId = ref<string | null>(null);
const showEventModal = ref(false);
const isDragOver = ref(false);
const draggedChildId = ref<string | null>(null);
const draggedFromEventId = ref<string | null>(null);
const viewMode = ref<'daily' | 'weekly'>('daily');

// Confirmation modal state
const showConfirmModal = ref(false);
const confirmAction = ref<{
  type: 'deleteEvent' | 'removeChild';
  data?: any;
} | null>(null);

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

// Week days (Sunday - Saturday)
const weekDays = computed(() => {
  const start = startOfWeek(selectedDate.value);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
});

const newEvent = ref({
  title: '',
  startTime: '09:00',
  endTime: '10:00',
  roomId: '',
  capacity: 20,
  type: 'activity' as Event['type'],
  color: '#3B82F6',
});

// Event filters
const filterEventType = ref('');
const filterRoom = ref('');

const eventFilters = computed<Filter[]>(() => [
  {
    model: 'filterEventType',
    value: filterEventType.value,
    placeholder: 'All Types',
    options: [
      { label: 'Activity', value: 'activity' },
      { label: 'Sports', value: 'sports' },
      { label: 'Meal', value: 'meal' },
      { label: 'Assembly', value: 'assembly' },
      { label: 'Quiet Time', value: 'quiet-time' },
    ],
  },
  {
    model: 'filterRoom',
    value: filterRoom.value,
    placeholder: 'All Rooms',
    options: store.rooms.map(room => ({
      label: room.name,
      value: room.id,
    })),
  },
]);

const todayEvents = computed(() => {
  return store.eventsForDate(selectedDate.value);
});

const filteredTodayEvents = computed(() => {
  let events = todayEvents.value;

  // Type filter
  if (filterEventType.value) {
    events = events.filter(event => event.type === filterEventType.value);
  }

  // Room filter
  if (filterRoom.value) {
    events = events.filter(event => event.roomId === filterRoom.value);
  }

  return events;
});

const clearEventFilters = () => {
  filterEventType.value = '';
  filterRoom.value = '';
};

const selectedEvent = computed(() => {
  if (!selectedEventId.value) return null;
  return store.getEventById(selectedEventId.value);
});

const formatDate = (date: Date) => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

const formatWeekRange = (date: Date) => {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
};

const formatDayName = (date: Date) => {
  return format(date, 'EEEE');
};

const formatDayDate = (date: Date) => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return isToday ? `${format(date, 'MMM d')} (Today)` : format(date, 'MMM d');
};

const formatHour = (hour: number) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${ampm}`;
};

const formatTime = (dateStr: string) => {
  return format(new Date(dateStr), 'h:mm a');
};

const getRoomName = (roomId: string) => {
  const room = store.getRoomById(roomId);
  return room?.name || 'Unknown Room';
};

const getChildName = (childId: string) => {
  const child = store.getChildById(childId);
  return child ? `${child.firstName} ${child.lastName}` : 'Unknown';
};

const getStaffName = (staffId: string) => {
  const staff = store.getTeamMemberById(staffId);
  return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
};

const getEventStyle = (event: Event) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const dayStartMinutes = 7 * 60; // 7 AM
  
  // Calculate position from top of grid (after header)
  const top = ((startMinutes - dayStartMinutes) / 60) * 80; // 80px per hour
  const height = ((endMinutes - startMinutes) / 60) * 80;
  
  // Find overlapping events
  const overlappingEvents = filteredTodayEvents.value.filter(otherEvent => {
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
};

const getWeekEventStyle = (event: Event) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const durationMinutes = endMinutes - startMinutes;
  
  // Calculate height based on duration (80px per hour)
  const heightPx = (durationMinutes / 60) * 80 - 4; // Subtract 4px for spacing
  
  // Debug logging
  if (durationMinutes > 60) {
    console.log(`Event: ${event.title}, Duration: ${durationMinutes}min, Height: ${heightPx}px`);
  }
  
  // Find overlapping events for the same day
  const eventDate = start.toISOString().split('T')[0];
  const dayEvents = store.events.filter(e => {
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
};

const getEventsForDayAndHour = (day: Date, hour: number) => {
  return filterEventsByDateAndHour(store.events, day, hour);
};

const changeDate = (increment: number) => {
  if (viewMode.value === 'daily') {
    selectedDate.value = addDays(selectedDate.value, increment);
  } else {
    selectedDate.value = addWeeks(selectedDate.value, increment);
  }
};

const goToToday = () => {
  selectedDate.value = new Date();
};

const selectEvent = (event: Event) => {
  selectedEventId.value = event.id;
};

const createEvent = async () => {
  const [startHour, startMinute] = newEvent.value.startTime.split(':').map(Number);
  const [endHour, endMinute] = newEvent.value.endTime.split(':').map(Number);
  
  const startTime = new Date(selectedDate.value);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(selectedDate.value);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const event: Event = {
    id: `event-${Date.now()}`,
    title: newEvent.value.title,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    roomId: newEvent.value.roomId,
    capacity: newEvent.value.capacity,
    type: newEvent.value.type,
    color: newEvent.value.color,
    enrolledChildrenIds: [],
    assignedStaffIds: [],
  };
  
  await store.addEvent(event);
  showEventModal.value = false;
  
  // Reset form
  newEvent.value = {
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    roomId: '',
    capacity: 20,
    type: 'activity',
    color: '#3B82F6',
  };
};

const deleteEventConfirm = () => {
  if (!selectedEventId.value) return;
  const event = store.getEventById(selectedEventId.value);
  confirmAction.value = {
    type: 'deleteEvent',
    data: { eventId: selectedEventId.value, eventName: event?.title }
  };
  showConfirmModal.value = true;
};

const handleConfirmAction = async () => {
  if (!confirmAction.value) return;

  if (confirmAction.value.type === 'deleteEvent') {
    await store.deleteEvent(confirmAction.value.data.eventId);
    selectedEventId.value = null;
  } else if (confirmAction.value.type === 'removeChild') {
    await store.unenrollChild(confirmAction.value.data.eventId, confirmAction.value.data.childId);
  }

  showConfirmModal.value = false;
  confirmAction.value = null;
};

const handleCancelConfirm = () => {
  showConfirmModal.value = false;
  confirmAction.value = null;
};

const onDragStart = (event: DragEvent, childId: string, fromEventId: string | null) => {
  draggedChildId.value = childId;
  draggedFromEventId.value = fromEventId;
  event.dataTransfer!.effectAllowed = 'move';
};

const onDragEnd = () => {
  draggedChildId.value = null;
  draggedFromEventId.value = null;
  isDragOver.value = false;
};

const onDrop = async (event: DragEvent, toEventId: string) => {
  event.preventDefault();
  isDragOver.value = false;
  
  if (!draggedChildId.value) return;
  
  try {
    if (draggedFromEventId.value) {
      // Moving from one event to another
      await store.moveChild(draggedFromEventId.value, toEventId, draggedChildId.value);
    } else {
      // Enrolling from the children list
      await store.enrollChild(toEventId, draggedChildId.value);
    }
  } catch (error: any) {
    alert(error.message);
  }
  
  draggedChildId.value = null;
  draggedFromEventId.value = null;
};

const unenrollChildFromEvent = (eventId: string, childId: string) => {
  const child = store.getChildById(childId);
  const event = store.getEventById(eventId);
  confirmAction.value = {
    type: 'removeChild',
    data: { eventId, childId, childName: `${child?.firstName} ${child?.lastName}`, eventName: event?.title }
  };
  showConfirmModal.value = true;
};
</script>

<style scoped>
.calendar-view {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  grid-template-rows: auto auto auto 1fr;
}

.calendar-header {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}

.calendar-header h2 {
  text-align: left;
}

.filter-section {
  grid-column: 1 / -1;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-column: 1 / -1;
}

.calendar-date {
  text-align: center;
}

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

.event-room,
.event-capacity {
  opacity: 0.95;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.enrolled-children {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100px;
  padding: 1rem;
  background: var(--background);
  border-radius: var(--radius);
  border: 2px dashed transparent;
  transition: all 0.15s ease;
}

.enrolled-children.drag-over {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.enrolled-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface);
  border-radius: var(--radius);
  cursor: move;
  transition: all 0.15s ease;
}

.enrolled-child:hover {
  background: var(--primary-light);
}

.drop-zone {
  min-height: 100px;
}

/* Weekly View Styles */
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

.time-col-header,
.day-header {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  border-right: 1px solid var(--border-light);
}

.day-header {
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

.event-details {
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
}

.week-event-meta,
.week-event-capacity {
  opacity: 0.95;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.view-toggle {
  display: flex;
  gap: 0;
  background: var(--background);
  border-radius: var(--radius);
  padding: 0.25rem;
}

.view-toggle .btn {
  border-radius: var(--radius-sm);
}

@media (max-width: 1024px) {
  .calendar-view {
    grid-template-columns: 1fr;
  }

  .calendar-controls .flex {
    justify-content: center;
  }
}
</style>

