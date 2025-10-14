<template>
  <div class="container">
    <div class="calendar-view">
      <ViewHeader title="Event Calendar">
        <template #actions>
          <button class="btn btn-primary" @click="openNewEventModal">+ Event</button>
        </template>
      </ViewHeader>

      <!-- Date Navigation and Filters -->
      <FilterBar
        :show-search="false"
        v-model:filter-event-type="filterEventType"
        v-model:filter-room="filterRoom"
        v-model:filter-program="filterProgram"
        v-model:filter-camper="filterCamper"
        v-model:filter-staff="filterStaff"
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
        @create-event="createEventAtHour"
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
      :editing-event-id="editingEventId || ''"
      :event-date="getEventFormDate()"
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
import { generateRecurrenceDates, type RecurrenceData } from '@/utils/recurrence';

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
        eventDate: format(new Date(), 'yyyy-MM-dd'),
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
      filterCamper: '',
      filterStaff: '',
      sleepingRoomToAssign: ''
    };
  },
  mounted() {
    this.handleEventIdFromQuery();
  },
  watch: {
    '$route.query.eventId': {
      handler() {
        this.handleEventIdFromQuery();
      }
    }
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
          placeholder: 'Filter by Program',
          options: this.store.programs.map(program => ({
            label: program.name,
            value: program.id,
          })),
        },
        {
          model: 'filterEventType',
          value: this.filterEventType,
          placeholder: 'Filter by Type',
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
          placeholder: 'Filter by Room',
          options: this.store.rooms.map(room => ({
            label: room.name,
            value: room.id,
          })),
        },
        {
          model: 'filterCamper',
          value: this.filterCamper,
          placeholder: 'Filter by Camper',
          options: this.store.campers
            .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
            .map(camper => ({
              label: `${camper.firstName} ${camper.lastName}`,
              value: camper.id,
            })),
        },
        {
          model: 'filterStaff',
          value: this.filterStaff,
          placeholder: 'Filter by Staff',
          options: this.store.staffMembers
            .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
            .map(staff => ({
              label: `${staff.firstName} ${staff.lastName}`,
              value: staff.id,
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

      // Camper filter
      if (this.filterCamper) {
        events = events.filter(event => 
          event.enrolledCamperIds && event.enrolledCamperIds.includes(this.filterCamper)
        );
      }

      // Staff filter
      if (this.filterStaff) {
        events = events.filter(event => 
          event.assignedStaffIds && event.assignedStaffIds.includes(this.filterStaff)
        );
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
    handleEventIdFromQuery() {
      const eventId = this.$route.query.eventId as string | undefined;
      if (eventId) {
        const event = this.store.getEventById(eventId);
        if (event) {
          // Set the selected date to the event's date
          this.selectedDate = new Date(event.startTime);
          // Select the event to open the detail modal
          this.selectedEventId = eventId;
          // Clear the query parameter to avoid reopening on page refresh
          this.$router.replace({ query: {} });
        }
      }
    },
    clearEventFilters() {
      this.filterProgram = '';
      this.filterEventType = '';
      this.filterRoom = '';
      this.filterCamper = '';
      this.filterStaff = '';
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
    openNewEventModal() {
      // Reset form data with the currently selected date
      this.eventFormData = {
        title: '',
        eventDate: format(this.selectedDate, 'yyyy-MM-dd'),
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
      this.showEventModal = true;
    },
    createEventAtHour(hour: number) {
      // Set the start time to the clicked hour
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      // Set the end time to one hour later
      const endHour = hour + 1;
      const endTime = `${String(endHour).padStart(2, '0')}:00`;
      
      // Reset form data and set the time and date
      this.eventFormData = {
        title: '',
        eventDate: format(this.selectedDate, 'yyyy-MM-dd'),
        startTime,
        endTime,
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
      
      // Open the modal
      this.showEventModal = true;
    },
    getEventFormDate(): Date {
      // If editing, use the event's date; otherwise use selected date
      if (this.editingEventId) {
        const event = this.store.getEventById(this.editingEventId);
        if (event) {
          return new Date(event.startTime);
        }
      }
      return this.selectedDate;
    },
    editEvent() {
      if (!this.selectedEvent) return;
      
      // Extract date and time from ISO date strings
      const startTime = new Date(this.selectedEvent.startTime);
      const endTime = new Date(this.selectedEvent.endTime);
      
      this.editingEventId = this.selectedEvent.id;
      this.eventFormData = {
        title: this.selectedEvent.title,
        eventDate: format(startTime, 'yyyy-MM-dd'),
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
        eventDate: format(new Date(), 'yyyy-MM-dd'),
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
    async saveEvent(data: any) {
      // Handle the new structure with formData and recurrence
      const formData = data.formData || data;
      const recurrence = data.recurrence || null;
      
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      
      // Use the date from the form
      const eventDate = new Date(formData.eventDate);
      
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
        // Create new event(s)
        if (recurrence && recurrence.enabled) {
          // Generate recurring events
          await this.createRecurringEvents(formData, recurrence, startTime, endTime);
        } else {
          // Create single event
          await this.createSingleEvent(formData, startTime, endTime);
        }
      }
      
      this.closeEventModal();
    },
    
    async createSingleEvent(formData: any, startTime: Date, endTime: Date) {
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
        await this.enrollCamperGroups(event.id, formData.camperGroupIds);
      } else {
        this.toast.success('Event created successfully');
      }
    },
    
    async createRecurringEvents(formData: any, recurrence: RecurrenceData, startTime: Date, endTime: Date) {
      try {
        // Generate all occurrence dates
        const occurrenceDates = generateRecurrenceDates(startTime, recurrence);
        
        if (occurrenceDates.length === 0) {
          this.toast.error('Failed to generate recurring events');
          return;
        }
        
        // Show loading toast for large batches
        if (occurrenceDates.length > 10) {
          this.toast.info(`Creating ${occurrenceDates.length} recurring events...`);
        }
        
        // Generate a unique recurrence ID for this series
        const recurrenceId = `recurrence-${Date.now()}`;
        const baseTimestamp = Date.now();
        
        // Calculate the duration in milliseconds
        const duration = endTime.getTime() - startTime.getTime();
        
        // Create all events in memory first (fast)
        const eventsToCreate: Event[] = [];
        
        for (let i = 0; i < occurrenceDates.length; i++) {
          const occurrenceStart = occurrenceDates[i];
          const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
          
          const event: Event = {
            id: `event-${baseTimestamp}-${i}`,
            title: formData.title,
            startTime: occurrenceStart.toISOString(),
            endTime: occurrenceEnd.toISOString(),
            roomId: formData.roomId,
            capacity: formData.capacity,
            type: formData.type,
            color: formData.color,
            requiredCertifications: formData.requiredCertifications && formData.requiredCertifications.length > 0 ? formData.requiredCertifications : undefined,
            enrolledCamperIds: [],
            assignedStaffIds: formData.assignedStaffIds || [],
            programId: formData.programId,
            activityId: formData.activityId,
            recurrenceId: recurrenceId,
            isRecurrenceParent: i === 0, // First event is the parent
          };
          
          eventsToCreate.push(event);
        }
        
        // Batch add all events at once (much faster)
        // Use batch method to add all events and run conflict detection only once
        await this.store.addEventsBatch(eventsToCreate);
        
        // Enroll camper groups for all events if any were selected
        if (formData.camperGroupIds && formData.camperGroupIds.length > 0) {
          // Batch enrollment operations
          const enrollmentPromises = eventsToCreate.map(event => 
            this.enrollCamperGroups(event.id, formData.camperGroupIds, true)
          );
          await Promise.all(enrollmentPromises);
        }
        
        this.toast.success(`Successfully created ${occurrenceDates.length} recurring events`);
      } catch (error: any) {
        this.toast.error('Failed to create recurring events', error.message);
      }
    },
    
    async enrollCamperGroups(eventId: string, groupIds: string[], silent: boolean = false) {
      const messages: string[] = [];
      
      for (const groupId of groupIds) {
        try {
          const result = await this.store.enrollCamperGroup(eventId, groupId);
          if (result.errors.length > 0) {
            messages.push(result.message);
          }
        } catch (error: any) {
          messages.push(error.message);
        }
      }
      
      if (!silent) {
        if (messages.length > 0) {
          this.toast.warning(
            'Event created with some enrollment issues',
            messages.join('\n')
          );
        } else {
          this.toast.success('Event created successfully');
        }
      }
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

