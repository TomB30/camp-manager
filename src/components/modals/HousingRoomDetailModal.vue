<template>
  <BaseModal
    :show="show"
    :title="room?.name || ''"
    modal-class="modal-lg"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="room">
        <div class="detail-section">
          <div class="detail-label">Beds</div>
          <div>
            <span class="badge badge-primary">{{ room.beds }} beds</span>
          </div>
        </div>

        <div v-if="room.areaId" class="detail-section">
          <div class="detail-label">Area</div>
          <div>{{ getAreaName(room.areaId) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Family Groups</div>
          <div v-if="familyGroups.length > 0">
            <div class="groups-list">
              <div 
                v-for="familyGroup in familyGroups"
                :key="familyGroup.id"
                class="group-assignment-item"
              >
                <div class="group-info">
                  <div class="font-medium">
                    {{ familyGroup.name }}
                  </div>
                  <div class="text-xs text-secondary">
                    {{ familyGroup.camperCount }} campers
                    <span v-if="familyGroup.staffCount > 0">
                      • {{ familyGroup.staffCount }} staff
                    </span>
                  </div>
                  <div class="text-xs group-dates">
                    📅 {{ familyGroup.sessionName }} ({{ familyGroup.sessionDateRange }})
                  </div>
                  <div v-if="familyGroup.description" class="text-xs text-secondary mt-1">
                    {{ familyGroup.description }}
                  </div>
                </div>
                <button 
                  class="btn btn-sm btn-secondary"
                  @click="$emit('view-family-group', familyGroup.id)"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-secondary">No family groups assigned to this room</div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Room</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { HousingRoom } from '@/types';
import { useCampStore } from '@/stores/campStore';

interface FamilyGroupInfo {
  id: string;
  name: string;
  description?: string;
  camperCount: number;
  staffCount: number;
  sessionId: string;
  sessionName: string;
  sessionDateRange: string;
}

export default defineComponent({
  name: 'HousingRoomDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    room: {
      type: Object as PropType<HousingRoom | null>,
      default: null
    },
    familyGroups: {
      type: Array as PropType<FamilyGroupInfo[]>,
      default: () => []
    }
  },
  emits: ['close', 'edit', 'delete', 'view-family-group'],
  setup() {
    const store = useCampStore();
    return { store };
  },
  methods: {
    getAreaName(areaId: string): string {
      const area = this.store.getAreaById(areaId);
      return area?.name || 'Unknown';
    }
  }
});
</script>

<style scoped>
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-assignment-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
}

.group-info {
  flex: 1;
}

.group-dates {
  margin-top: 0.375rem;
  color: var(--text-primary);
  font-weight: 500;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>

