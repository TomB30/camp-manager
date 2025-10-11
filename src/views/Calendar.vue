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
                {{ event.enrolledCamperIds?.length || 0 }}/{{ event.capacity }}
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
                      {{ event.enrolledCamperIds?.length || 0 }}/{{ event.capacity }}
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
    <EventDetailModal
      :show="!!selectedEventId"
      :event="selectedEvent"
      @close="selectedEventId = null"
      @delete="deleteEventConfirm"
    >
      <template #time>
        <div v-if="selectedEvent">{{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}</div>
      </template>
      <template #room>
        <div v-if="selectedEvent">{{ getRoomName(selectedEvent.roomId) }}</div>
      </template>
      <template #capacity>
        <div v-if="selectedEvent">
          {{ selectedEvent.enrolledCamperIds?.length || 0 }}/{{ selectedEvent.capacity }}
          <span 
            v-if="(selectedEvent.enrolledCamperIds?.length || 0) >= selectedEvent.capacity"
            class="badge badge-error ml-2"
          >
            Full
          </span>
        </div>
      </template>
      <template #quick-assign-group>
        <div class="mb-3 p-3 bg-background rounded border border-primary">
          <div class="text-sm font-medium mb-2">Quick Assign Camper Group</div>
          <div class="flex gap-2">
            <Autocomplete
              v-model="groupToAssign"
              :options="groupAssignOptions"
              placeholder="Select a group..."
              class="flex-1"
            />
            <button 
              class="btn btn-sm btn-primary"
              @click="assignGroup"
              :disabled="!groupToAssign"
            >
              Assign
            </button>
          </div>
          <div v-if="store.camperGroups.length === 0" class="text-xs text-secondary mt-2">
            No groups available. Create groups in the Groups section.
          </div>
        </div>
      </template>
      <template #enrolled-campers>
        <div 
          v-if="selectedEvent"
          class="enrolled-campers drop-zone"
          :class="{ 'drag-over': isDragOver }"
          @drop="onDrop($event, selectedEvent.id)"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
        >
          <div
            v-for="camperId in selectedEvent.enrolledCamperIds"
            :key="camperId"
            class="enrolled-camper draggable"
            :draggable="true"
            @dragstart="onDragStart($event, camperId, selectedEvent.id)"
            @dragend="onDragEnd"
          >
            <div class="camper-info">
              <div class="font-medium">
                {{ getCamperName(camperId) }}
              </div>
            </div>
            <button 
              class="btn btn-sm btn-error"
              @click="unenrollCamperFromEvent(selectedEvent.id, camperId)"
            >
              Remove
            </button>
          </div>
          <div v-if="!selectedEvent.enrolledCamperIds?.length" class="empty-state">
            <p class="text-secondary text-sm">No campers enrolled. Drag and drop to enroll.</p>
          </div>
        </div>
      </template>
      <template #assigned-staff>
        <div v-if="selectedEvent && selectedEvent.assignedStaffIds?.length" class="flex flex-col gap-1">
          <span v-for="staffId in selectedEvent.assignedStaffIds" :key="staffId" class="badge badge-primary">
            {{ getStaffName(staffId) }}
          </span>
        </div>
        <div v-else class="text-secondary">No staff assigned</div>
      </template>
    </EventDetailModal>

    <!-- Create Event Modal -->
    <EventFormModal
      :show="showEventModal"
      :form-data="newEvent"
      @close="showEventModal = false"
      @save="createEvent"
    >
      <template #room-select>
        <Autocomplete
          v-model="newEvent.roomId"
          :options="roomOptions"
          placeholder="Select a room"
          :required="true"
        />
      </template>
      <template #type-select>
        <Autocomplete
          v-model="newEvent.type"
          :options="eventTypeOptions"
          placeholder="Select event type"
        />
      </template>
      <template #color-picker>
        <ColorPicker v-model="newEvent.color" />
      </template>
      <template #camper-groups-selection>
        <div class="sleeping-room-selector">
          <div v-for="group in store.camperGroups" :key="group.id" class="checkbox-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                :value="group.id" 
                v-model="newEvent.camperGroupIds"
                class="checkbox-input"
              />
              <span 
                class="group-label" 
                :style="{ borderLeft: `3px solid ${group.color || '#6366F1'}` }"
              >
                {{ group.name }} ({{ getGroupCamperCount(group.id) }} campers)
              </span>
            </label>
          </div>
          <div v-if="store.camperGroups.length === 0" class="text-secondary text-sm">
            No camper groups available. Create groups in the Groups section.
          </div>
        </div>
      </template>
      <template #camper-groups-preview>
        <div v-if="newEvent.camperGroupIds.length > 0" class="text-xs text-secondary mt-1">
          This will automatically enroll {{ getTotalCampersFromGroups(newEvent.camperGroupIds) }} campers when the event is created.
        </div>
      </template>
    </EventFormModal>

    <!-- Confirmation Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      :title="confirmAction?.type === 'deleteEvent' ? 'Delete Event' : 'Remove Camper from Event'"
      :message="confirmAction?.type === 'deleteEvent' 
        ? `Are you sure you want to delete the event '${confirmAction.data.eventName}'?` 
        : `Are you sure you want to remove ${confirmAction?.data.camperName} from '${confirmAction?.data.eventName}'?`"
      :details="confirmAction?.type === 'deleteEvent' 
        ? 'This action cannot be undone. All enrolled campers will be removed from this event.' 
        : 'The camper will no longer be enrolled in this event.'"
      :confirm-text="confirmAction?.type === 'deleteEvent' ? 'Delete' : 'Remove'"
      :danger-mode="true"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { useToastStore } from '@/stores/toastStore';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import Autocomplete from '@/components/Autocomplete.vue';
import EventDetailModal from '@/components/modals/EventDetailModal.vue';
import EventFormModal from '@/components/modals/EventFormModal.vue';
import { filterEventsByDateAndHour } from '@/utils/dateUtils';
import type { Event } from '@/types/api';

export default defineComponent({
  name: 'Calendar',
  components: {
    ConfirmModal,
    FilterBar,
    ColorPicker,
    Autocomplete,
    EventDetailModal,
    EventFormModal,
  },
  data() {
    return {
      selectedDate: new Date(),
      selectedEventId: null as string | null,
      showEventModal: false,
      isDragOver: false,
      draggedCamperId: null as string | null,
      draggedFromEventId: null as string | null,
      viewMode: 'daily' as 'daily' | 'weekly',
      showConfirmModal: false,
      confirmAction: null as {
        type: 'deleteEvent' | 'removeCamper';
        data?: any;
      } | null,
      hours: Array.from({ length: 14 }, (_, i) => i + 7),
      newEvent: {
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        roomId: '',
        capacity: 20,
        type: 'activity' as Event['type'],
        color: '#3B82F6',
        camperGroupIds: [] as string[],
      },
      filterEventType: '',
      filterRoom: '',
      sleepingRoomToAssign: '',
      groupToAssign: ''
    };
  },
  computed: {
    store() {
      return useCampStore();
    },
    toast() {
      return useToastStore();
    },
    weekDays() {
      const start = startOfWeek(this.selectedDate);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    },
    groupAssignOptions() {
      return this.store.camperGroups.map(group => ({
        label: `${group.name} (${this.getGroupCamperCount(group.id)} campers)`,
        value: group.id
      }));
    },
    roomOptions() {
      return this.store.rooms.map(room => ({
        label: `${room.name} (${room.type})`,
        value: room.id
      }));
    },
    eventTypeOptions() {
      return [
        { label: 'Activity', value: 'activity' },
        { label: 'Sports', value: 'sports' },
        { label: 'Arts', value: 'arts' },
        { label: 'Education', value: 'education' },
        { label: 'Meal', value: 'meal' },
        { label: 'Free Time', value: 'free-time' }
      ];
    },
    eventFilters(): Filter[] {
      return [
        {
          model: 'filterEventType',
          value: this.filterEventType,
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
          value: this.filterRoom,
          placeholder: 'All Rooms',
          options: this.store.rooms.map(room => ({
            label: room.name,
            value: room.id,
          })),
        },
      ];
    },
    todayEvents() {
      return this.store.eventsForDate(this.selectedDate);
    },
    filteredTodayEvents() {
      let events = this.todayEvents;

      // Type filter
      if (this.filterEventType) {
        events = events.filter(event => event.type === this.filterEventType);
      }

      // Room filter
      if (this.filterRoom) {
        events = events.filter(event => event.roomId === this.filterRoom);
      }

      return events;
    },
    selectedEvent() {
      if (!this.selectedEventId) return null;
      return this.store.getEventById(this.selectedEventId);
    }
  },
  methods: {
    clearEventFilters() {
      this.filterEventType = '';
      this.filterRoom = '';
    },
    formatDate(date: Date): string {
      return format(date, 'EEEE, MMMM d, yyyy');
    },
    formatWeekRange(date: Date): string {
      const start = startOfWeek(date);
      const end = addDays(start, 6);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    },
    formatDayName(date: Date): string {
      return format(date, 'EEEE');
    },
    formatDayDate(date: Date): string {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      return isToday ? `${format(date, 'MMM d')} (Today)` : format(date, 'MMM d');
    },
    formatHour(hour: number): string {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:00 ${ampm}`;
    },
    formatTime(dateStr: string): string {
      return format(new Date(dateStr), 'h:mm a');
    },
    getRoomName(roomId: string): string {
      const room = this.store.getRoomById(roomId);
      return room?.name || 'Unknown Room';
    },
    getCamperName(camperId: string): string {
      const camper = this.store.getCamperById(camperId);
      return camper ? `${camper.firstName} ${camper.lastName}` : 'Unknown';
    },
    getStaffName(staffId: string): string {
      const staff = this.store.getStaffMemberById(staffId);
      return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
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
      const overlappingEvents = this.filteredTodayEvents.filter(otherEvent => {
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
    getWeekEventStyle(event: Event) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const durationMinutes = endMinutes - startMinutes;
      
      // Calculate height based on duration (80px per hour)
      const heightPx = (durationMinutes / 60) * 80 - 4; // Subtract 4px for spacing
      
      // Find overlapping events for the same day
      const eventDate = start.toISOString().split('T')[0];
      const dayEvents = this.store.events.filter(e => {
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
    getEventsForDayAndHour(day: Date, hour: number) {
      return filterEventsByDateAndHour(this.store.events, day, hour);
    },
    changeDate(increment: number) {
      if (this.viewMode === 'daily') {
        this.selectedDate = addDays(this.selectedDate, increment);
      } else {
        this.selectedDate = addWeeks(this.selectedDate, increment);
      }
    },
    goToToday() {
      this.selectedDate = new Date();
    },
    selectEvent(event: Event) {
      this.selectedEventId = event.id;
    },
    async createEvent() {
      const [startHour, startMinute] = this.newEvent.startTime.split(':').map(Number);
      const [endHour, endMinute] = this.newEvent.endTime.split(':').map(Number);
      
      const startTime = new Date(this.selectedDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(this.selectedDate);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      const event: Event = {
        id: `event-${Date.now()}`,
        title: this.newEvent.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        roomId: this.newEvent.roomId,
        capacity: this.newEvent.capacity,
        type: this.newEvent.type,
        color: this.newEvent.color,
        enrolledCamperIds: [],
        assignedStaffIds: [],
      };
      
      await this.store.addEvent(event);
      
      // Enroll camper groups if any were selected
      if (this.newEvent.camperGroupIds.length > 0) {
        const messages: string[] = [];
        
        // Enroll camper groups
        for (const groupId of this.newEvent.camperGroupIds) {
          try {
            const result = await this.store.enrollCamperGroup(event.id, groupId);
            if (result.errors.length > 0) {
              messages.push(result.message);
            }
          } catch (error: any) {
            messages.push(error.message);
          }
        }
        
        if (messages.length > 0) {
          this.toast.warning(
            'Event created with some enrollment issues',
            messages.join('\n')
          );
        } else {
          this.toast.success('Event created successfully');
        }
      }
      
      this.showEventModal = false;
      
      // Reset form
      this.newEvent = {
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        roomId: '',
        capacity: 20,
        type: 'activity',
        color: '#3B82F6',
        camperGroupIds: [],
      };
    },
    deleteEventConfirm() {
      if (!this.selectedEventId) return;
      const event = this.store.getEventById(this.selectedEventId);
      this.confirmAction = {
        type: 'deleteEvent',
        data: { eventId: this.selectedEventId, eventName: event?.title }
      };
      this.showConfirmModal = true;
    },
    async handleConfirmAction() {
      if (!this.confirmAction) return;

      if (this.confirmAction.type === 'deleteEvent') {
        await this.store.deleteEvent(this.confirmAction.data.eventId);
        this.selectedEventId = null;
      } else if (this.confirmAction.type === 'removeCamper') {
        await this.store.unenrollCamper(this.confirmAction.data.eventId, this.confirmAction.data.camperId);
      }

      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    handleCancelConfirm() {
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    onDragStart(event: DragEvent, camperId: string, fromEventId: string | null) {
      this.draggedCamperId = camperId;
      this.draggedFromEventId = fromEventId;
      event.dataTransfer!.effectAllowed = 'move';
    },
    onDragEnd() {
      this.draggedCamperId = null;
      this.draggedFromEventId = null;
      this.isDragOver = false;
    },
    async onDrop(event: DragEvent, toEventId: string) {
      event.preventDefault();
      this.isDragOver = false;
      
      if (!this.draggedCamperId) return;
      
      try {
        if (this.draggedFromEventId) {
          // Moving from one event to another
          await this.store.moveCamper(this.draggedFromEventId, toEventId, this.draggedCamperId);
        } else {
          // Enrolling from the campers list
          await this.store.enrollCamper(toEventId, this.draggedCamperId);
        }
      } catch (error: any) {
        this.toast.error('Failed to move camper', error.message);
      }
      
      this.draggedCamperId = null;
      this.draggedFromEventId = null;
    },
    unenrollCamperFromEvent(eventId: string, camperId: string) {
      const camper = this.store.getCamperById(camperId);
      const event = this.store.getEventById(eventId);
      this.confirmAction = {
        type: 'removeCamper',
        data: { eventId, camperId, camperName: `${camper?.firstName} ${camper?.lastName}`, eventName: event?.title }
      };
      this.showConfirmModal = true;
    },
    getTotalCampersFromGroups(groupIds: string[]): number {
      return groupIds.reduce((total, groupId) => {
        return total + this.getGroupCamperCount(groupId);
      }, 0);
    },
    getGroupCamperCount(groupId: string): number {
      return this.store.getCampersInGroup(groupId).length;
    },
    async assignGroup() {
      if (!this.groupToAssign || !this.selectedEventId) return;
      
      try {
        const result = await this.store.enrollCamperGroup(this.selectedEventId, this.groupToAssign);
        
        if (result.errors.length > 0) {
          // Show detailed message about conflicts
          this.toast.warning(
            result.message,
            'Conflicts:\n' + result.errors.join('\n'),
            7000
          );
        } else {
          // Show success message
          this.toast.success(result.message);
        }
        
        this.groupToAssign = '';
      } catch (error: any) {
        this.toast.error('Error assigning group', error.message);
      }
    }
  }
});
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

.enrolled-campers {
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

.enrolled-campers.drag-over {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.enrolled-camper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface);
  border-radius: var(--radius);
  cursor: move;
  transition: all 0.15s ease;
}

.enrolled-camper:hover {
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
  z-index: 20;
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

.sleeping-room-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-item {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: background-color 0.15s ease;
  width: 100%;
}

.checkbox-label:hover {
  background: var(--surface);
}

.checkbox-input {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.group-label {
  padding-left: 0.5rem;
  display: inline-block;
}

.bg-background {
  background: var(--background);
}
</style>

