<template>
  <BaseModal
    :show="show"
    :title="event?.title || ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="event">
        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Time</div>
          <div>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Room</div>
          <div>{{ getRoomName(event.roomId) }}</div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Capacity</div>
          <div>
            {{ event.enrolledCamperIds?.length || 0 }}/{{ event.capacity }}
            <span 
              v-if="(event.enrolledCamperIds?.length || 0) >= event.capacity"
              class="badge badge-error ml-2"
            >
              Full
            </span>
          </div>
        </div>

        <div class="mb-3">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-secondary">Enrolled Campers</div>
          </div>

          <!-- Quick Assign Group Section -->
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

          <!-- Enrolled Campers List (with drag and drop support) -->
          <div 
            class="enrolled-campers drop-zone"
            :class="{ 'drag-over': isDragOver }"
            @drop="onDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
          >
            <div
              v-for="camperId in event.enrolledCamperIds"
              :key="camperId"
              class="enrolled-camper draggable"
              :draggable="true"
              @dragstart="onDragStart($event, camperId)"
              @dragend="onDragEnd"
            >
              <div class="camper-info">
                <div class="font-medium">
                  {{ getCamperName(camperId) }}
                </div>
              </div>
              <button 
                class="btn btn-sm btn-error"
                @click="unenrollCamper(camperId)"
              >
                Remove
              </button>
            </div>
            <div v-if="!event.enrolledCamperIds?.length" class="empty-state">
              <p class="text-secondary text-sm">No campers enrolled. Drag and drop to enroll.</p>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Assigned Staff</div>
          <div v-if="event.assignedStaffIds?.length" class="flex flex-col gap-1">
            <span v-for="staffId in event.assignedStaffIds" :key="staffId" class="badge badge-primary">
              {{ getStaffName(staffId) }}
            </span>
          </div>
          <div v-else class="text-secondary">No staff assigned</div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Event</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { format } from 'date-fns';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete from '@/components/Autocomplete.vue';
import { useCampStore } from '@/stores/campStore';
import { useToastStore } from '@/stores/toastStore';
import type { Event } from '@/types/api';

export default defineComponent({
  name: 'EventDetailModal',
  components: {
    BaseModal,
    Autocomplete,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    event: {
      type: Object as PropType<Event | null>,
      default: null,
    },
  },
  emits: ['close', 'edit', 'delete', 'unenroll'],
  data() {
    return {
      groupToAssign: '',
      isDragOver: false,
      draggedCamperId: null as string | null,
      draggedFromEventId: null as string | null,
    };
  },
  computed: {
    store() {
      return useCampStore();
    },
    toast() {
      return useToastStore();
    },
    groupAssignOptions() {
      return this.store.camperGroups.map(group => ({
        label: `${group.name} (${this.getGroupCamperCount(group.id)} campers)`,
        value: group.id
      }));
    },
  },
  methods: {
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
    getGroupCamperCount(groupId: string): number {
      return this.store.getCampersInGroup(groupId).length;
    },
    async assignGroup() {
      if (!this.groupToAssign || !this.event) return;
      
      try {
        const result = await this.store.enrollCamperGroup(this.event.id, this.groupToAssign);
        
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
    },
    onDragStart(event: DragEvent, camperId: string) {
      this.draggedCamperId = camperId;
      this.draggedFromEventId = this.event?.id || null;
      event.dataTransfer!.effectAllowed = 'move';
      // Store data for cross-component drag
      event.dataTransfer!.setData('camperId', camperId);
      event.dataTransfer!.setData('fromEventId', this.event?.id || '');
    },
    onDragEnd() {
      this.draggedCamperId = null;
      this.draggedFromEventId = null;
      this.isDragOver = false;
    },
    async onDrop(event: DragEvent) {
      event.preventDefault();
      this.isDragOver = false;
      
      if (!this.event) return;
      
      // Try to get camper from internal drag or from dataTransfer
      const camperId = this.draggedCamperId || event.dataTransfer?.getData('camperId');
      const fromEventId = this.draggedFromEventId || event.dataTransfer?.getData('fromEventId');
      
      if (!camperId) return;
      
      try {
        if (fromEventId && fromEventId !== this.event.id) {
          // Moving from one event to another
          await this.store.moveCamper(fromEventId, this.event.id, camperId);
        } else if (!fromEventId || fromEventId !== this.event.id) {
          // Enrolling from the campers list
          await this.store.enrollCamper(this.event.id, camperId);
        }
      } catch (error: any) {
        this.toast.error('Failed to move camper', error.message);
      }
      
      this.draggedCamperId = null;
      this.draggedFromEventId = null;
    },
    unenrollCamper(camperId: string) {
      if (!this.event) return;
      this.$emit('unenroll', this.event.id, camperId);
    },
  },
});
</script>

<style scoped>
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.bg-background {
  background: var(--background);
}
</style>

