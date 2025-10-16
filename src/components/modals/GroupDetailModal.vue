<template>
  <BaseModal
    :show="show"
    :title="group?.name || ''"
    :subtitle="group?.description"
    modal-class="modal-large"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="group">
        <div class="detail-section">
          <div class="detail-label">Filter Criteria</div>
          <div class="group-filters">
            <span v-if="group.filters.gender" class="filter-tag">
              <strong>Gender:</strong> {{ formatGender(group.filters.gender) }}
            </span>
            <span v-if="group.filters.ageMin !== undefined || group.filters.ageMax !== undefined" class="filter-tag">
              <strong>Age:</strong> {{ formatAgeRange(group.filters.ageMin, group.filters.ageMax) }}
            </span>
            <span v-if="group.filters.hasAllergies !== undefined" class="filter-tag">
              <strong>Allergies:</strong> {{ group.filters.hasAllergies ? 'Has allergies' : 'No allergies' }}
            </span>
            <span v-if="!hasAnyFilters(group.filters)" class="text-secondary">
              No filters applied (all campers)
            </span>
          </div>
        </div>

        <div v-if="group.familyGroupIds && group.familyGroupIds.length > 0" class="detail-section">
          <div class="detail-label">Included Family Groups</div>
          <slot name="family-groups-list">
            <div class="group-filters">
              <span 
                v-for="familyGroupId in group.familyGroupIds" 
                :key="familyGroupId" 
                class="filter-tag"
              >
                {{ getFamilyGroupName(familyGroupId) }}
              </span>
            </div>
          </slot>
        </div>

        <div v-if="group.labelIds && group.labelIds.length > 0" class="detail-section">
          <div class="detail-label">Labels</div>
          <div class="labels-container">
            <span 
              v-for="labelId in group.labelIds" 
              :key="labelId"
              class="label-badge"
              :style="{ background: getLabelColor(labelId) }"
            >
              {{ getLabelName(labelId) }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">
            Matching Campers ({{ campers.length }})
          </div>
          <slot name="campers-list">
            <div class="text-secondary">No campers match the current filter criteria.</div>
          </slot>
        </div>

        <div class="detail-section">
          <div class="detail-label">Metadata</div>
          <div class="text-sm text-secondary">
            <div v-if="group.createdAt">Created: {{ formatDate(group.createdAt) }}</div>
            <div v-if="group.updatedAt">Last Updated: {{ formatDate(group.updatedAt) }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Group</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { Camper } from '@/types';
import type { CamperGroup, CamperGroupFilter } from '@/types';
import { format } from 'date-fns';
import { useLabelsStore, useColorsStore, useFamilyGroupsStore } from '@/stores';

export default defineComponent({
  name: 'GroupDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    group: {
      type: Object as PropType<CamperGroup | null>,
      default: null
    },
    campers: {
      type: Array as PropType<Camper[]>,
      default: () => []
    }
  },
  emits: ['close', 'edit', 'delete'],
  computed: {
    labelsStore() {
      return useLabelsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    familyGroupsStore() {
      return useFamilyGroupsStore();
    },
  },
  methods: {
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    formatAgeRange(min?: number, max?: number): string {
      if (min !== undefined && max !== undefined) {
        return `${min}-${max} years`;
      } else if (min !== undefined) {
        return `${min}+ years`;
      } else if (max !== undefined) {
        return `Up to ${max} years`;
      }
      return 'Any age';
    },
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), 'MMMM d, yyyy h:mm a');
    },
    hasAnyFilters(filters: CamperGroupFilter): boolean {
      return !!(
        filters.ageMin !== undefined ||
        filters.ageMax !== undefined ||
        filters.gender ||
        filters.hasAllergies !== undefined
      );
    },
    getFamilyGroupName(familyGroupId: string): string {
      const familyGroup = this.familyGroupsStore.getFamilyGroupById(familyGroupId);
      return familyGroup ? familyGroup.name : 'Unknown Family Group';
    },
    getLabelName(labelId: string): string {
      const label = this.labelsStore.getLabelById(labelId);
      return label ? label.name : 'Unknown Label';
    },
    getLabelColor(labelId: string): string {
      const label = this.labelsStore.getLabelById(labelId);
      if (label?.colorId) {
        const color = this.colorsStore.getColorById(label.colorId);
        return color?.hexValue || '#6366F1';
      }
      return '#6366F1';
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
  margin-bottom: 0.75rem;
}

.group-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
  font-size: 0.875rem;
}

.filter-tag strong {
  color: var(--text-secondary);
  font-weight: 500;
}

.labels-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.label-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  border-radius: 9999px;
  white-space: nowrap;
}

.modal-large {
  max-width: 700px;
}
</style>

