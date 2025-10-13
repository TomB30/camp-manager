<template>
  <div class="container">
    <div class="calendar-view">
      <ViewHeader title="Event Calendar">
        <template #actions>
          <button class="btn btn-primary" @click="showEventModal = true">+ New Event</button>
        </template>
      </ViewHeader>

      <!-- Date Navigation and Filters -->
      <FilterBar
        :show-search="false"
        v-model:filter-event-type="filterEventType"
        v-model:filter-room="filterRoom"
        v-model:filter-program="filterProgram"
        :filters="eventFilters"
        :filtered-count="filteredEvents.length"
        :total-count="viewMode === 'daily' ? todayEvents.length : viewMode === 'weekly' ? weekEvents.length : monthEvents.length"
        :show-count="true"
        @clear="clearEventFilters"
      >
        <template #prepend>
          <!-- Calendar View Toggle -->
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

      <!-- Date Navigation Bar -->
      <div class="date-navigation">
        <div class="date-display">
          <h3 v-if="viewMode === 'daily'">{{ formatDate(selectedDate) }}</h3>
          <h3 v-else-if="viewMode === 'weekly'">{{ formatWeekRange(selectedDate) }}</h3>
          <h3 v-else>{{ formatMonthYear(selectedDate) }}</h3>
        </div>
        <div class="date-controls">
          <button class="btn btn-secondary" @click="changeDate(-1)">
            ← Previous {{ viewMode === 'daily' ? 'Day' : viewMode === 'weekly' ? 'Week' : 'Month' }}
          </button>
          <button class="btn btn-secondary" @click="goToToday">Today</button>
          <button class="btn btn-secondary" @click="changeDate(1)">
            Next {{ viewMode === 'daily' ? 'Day' : viewMode === 'weekly' ? 'Week' : 'Month' }} →
          </button>
        </div>
      </div>


      <!-- Daily View -->
      <DailyCalendarView 
        v-if="viewMode === 'daily'" 
        :events="filteredTodayEvents"
        :rooms="store.rooms"
        @select-event="selectEvent"
      />

      <!-- Weekly View -->
      <WeeklyCalendarView 
        v-else-if="viewMode === 'weekly'"
        :week-days="weekDays"
        :events="filteredEvents"
        :rooms="store.rooms"
        @select-event="selectEvent"
      />

      <!-- Monthly View -->
      <MonthlyCalendarView 
        v-else
        :selected-date="selectedDate"
        :events="filteredEvents"
        @select-day="selectDay"
        @select-event="selectEvent"
      />

    </div>

    <!-- Event Detail Modal -->
    <EventDetailModal
      :show="!!selectedEventId"
      :event="selectedEvent"
      @close="selectedEventId = null"
      @edit="editEvent"
      @delete="deleteEventConfirm"
      @unenroll="unenrollCamperFromEvent"
    />

    <!-- Create/Edit Event Modal -->
    <EventFormModal
      :show="showEventModal"
      :is-editing="!!editingEventId"
      :form-data="eventFormData"
      :rooms="store.rooms"
      :staff-members="store.staffMembers"
      :camper-groups="store.camperGroups"
      :campers="store.campers"
      @close="closeEventModal"
      @save="saveEvent"
    />

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
import { format, addDays, startOfWeek, addWeeks, addMonths } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import ViewHeader from '@/components/ViewHeader.vue';
import EventDetailModal from '@/components/modals/EventDetailModal.vue';
import EventFormModal from '@/components/modals/EventFormModal.vue';
import DailyCalendarView from '@/components/DailyCalendarView.vue';
import WeeklyCalendarView from '@/components/WeeklyCalendarView.vue';
import MonthlyCalendarView from '@/components/MonthlyCalendarView.vue';
import type { Event } from '@/types/api';

export default defineComponent({
  name: 'Calendar',
  components: {
    ConfirmModal,
    FilterBar,
    ColorPicker,
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
      viewMode: 'daily' as 'daily' | 'weekly' | 'monthly',
      showConfirmModal: false,
      confirmAction: null as {
        type: 'deleteEvent' | 'removeCamper';
        data?: any;
      } | null,
      eventFormData: {
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        roomId: '',
        capacity: 20,
        type: 'activity' as Event['type'],
        color: '#3B82F6',
        requiredCertifications: [] as string[],
        assignedStaffIds: [] as string[],
        camperGroupIds: [] as string[],
        programId: undefined as string | undefined,
        activityId: undefined as string | undefined,
      },
      filterEventType: '',
      filterRoom: '',
      filterProgram: '',
      sleepingRoomToAssign: ''
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
    weekEvents() {
      // Get all events for the current week
      return this.weekDays.flatMap(day => this.store.eventsForDate(day));
    },
    monthEvents() {
      // Get all events for the current month
      const start = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
      const end = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0);
      
      return this.store.events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= start && eventDate <= end;
      });
    },
    eventFilters(): Filter[] {
      return [
        {
          model: 'filterProgram',
          value: this.filterProgram,
          placeholder: 'All Programs',
          options: this.store.programs.map(program => ({
            label: program.name,
            value: program.id,
          })),
        },
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
    filteredEvents() {
      // Get base events depending on view mode
      let events = this.viewMode === 'daily' 
        ? this.todayEvents 
        : this.viewMode === 'weekly' 
          ? this.weekEvents 
          : this.monthEvents;

      // Program filter
      if (this.filterProgram) {
        events = events.filter(event => event.programId === this.filterProgram);
      }

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
    filteredTodayEvents() {
      // For daily view, use filteredEvents directly since it's already filtered by day
      return this.filteredEvents;
    },
    selectedEvent() {
      if (!this.selectedEventId) return null;
      return this.store.getEventById(this.selectedEventId);
    }
  },
  methods: {
    clearEventFilters() {
      this.filterProgram = '';
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
    formatMonthYear(date: Date): string {
      return format(date, 'MMMM yyyy');
    },
    changeDate(increment: number) {
      if (this.viewMode === 'daily') {
        this.selectedDate = addDays(this.selectedDate, increment);
      } else if (this.viewMode === 'weekly') {
        this.selectedDate = addWeeks(this.selectedDate, increment);
      } else {
        this.selectedDate = addMonths(this.selectedDate, increment);
      }
    },
    selectDay(date: Date) {
      this.selectedDate = date;
      this.viewMode = 'daily';
    },
    goToToday() {
      this.selectedDate = new Date();
    },
    selectEvent(event: Event) {
      this.selectedEventId = event.id;
    },
    editEvent() {
      if (!this.selectedEvent) return;
      
      // Extract time from ISO date strings
      const startTime = new Date(this.selectedEvent.startTime);
      const endTime = new Date(this.selectedEvent.endTime);
      
      this.editingEventId = this.selectedEvent.id;
      this.eventFormData = {
        title: this.selectedEvent.title,
        startTime: `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
        endTime: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`,
        roomId: this.selectedEvent.roomId,
        capacity: this.selectedEvent.capacity,
        type: this.selectedEvent.type,
        color: this.selectedEvent.color || '#3B82F6',
        requiredCertifications: this.selectedEvent.requiredCertifications || [],
        assignedStaffIds: this.selectedEvent.assignedStaffIds || [],
        camperGroupIds: [],
        programId: this.selectedEvent.programId,
        activityId: this.selectedEvent.activityId,
      };
      
      this.selectedEventId = null;
      this.showEventModal = true;
    },
    closeEventModal() {
      this.showEventModal = false;
      this.editingEventId = null;
      this.eventFormData = {
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        roomId: '',
        capacity: 20,
        type: 'activity',
        color: '#3B82F6',
        requiredCertifications: [],
        assignedStaffIds: [],
        camperGroupIds: [],
        programId: undefined,
        activityId: undefined,
      };
    },
    async saveEvent(formData: any) {
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      
      // Use selected date or existing event's date
      let eventDate = this.selectedDate;
      if (this.editingEventId) {
        const existingEvent = this.store.getEventById(this.editingEventId);
        if (existingEvent) {
          eventDate = new Date(existingEvent.startTime);
        }
      }
      
      const startTime = new Date(eventDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(eventDate);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      if (this.editingEventId) {
        // Update existing event
        const existingEvent = this.store.getEventById(this.editingEventId);
        if (existingEvent) {
          const updatedEvent: Event = {
            ...existingEvent,
            title: formData.title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            roomId: formData.roomId,
            capacity: formData.capacity,
            type: formData.type,
            color: formData.color,
            requiredCertifications: formData.requiredCertifications && formData.requiredCertifications.length > 0 ? formData.requiredCertifications : undefined,
            assignedStaffIds: formData.assignedStaffIds || [],
            programId: formData.programId,
            activityId: formData.activityId,
          };
          
          await this.store.updateEvent(updatedEvent);
          this.toast.success('Event updated successfully');
        }
      } else {
        // Create new event
        const event: Event = {
          id: `event-${Date.now()}`,
          title: formData.title,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          roomId: formData.roomId,
          capacity: formData.capacity,
          type: formData.type,
          color: formData.color,
          requiredCertifications: formData.requiredCertifications && formData.requiredCertifications.length > 0 ? formData.requiredCertifications : undefined,
          enrolledCamperIds: [],
          assignedStaffIds: formData.assignedStaffIds || [],
          programId: formData.programId,
          activityId: formData.activityId,
        };
        
        await this.store.addEvent(event);
        
        // Enroll camper groups if any were selected
        if (formData.camperGroupIds && formData.camperGroupIds.length > 0) {
          const messages: string[] = [];
          
          // Enroll camper groups
          for (const groupId of formData.camperGroupIds) {
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
        } else {
          this.toast.success('Event created successfully');
        }
      }
      
      this.closeEventModal();
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
    unenrollCamperFromEvent(eventId: string, camperId: string) {
      const camper = this.store.getCamperById(camperId);
      const event = this.store.getEventById(eventId);
      this.confirmAction = {
        type: 'removeCamper',
        data: { eventId, camperId, camperName: `${camper?.firstName} ${camper?.lastName}`, eventName: event?.title }
      };
      this.showConfirmModal = true;
    }
  }
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
</style>

