<template>
  <BaseModal
    :show="show"
    title="Add Activity to Program"
    @close="$emit('close')"
  >
    <template #body>
      <div class="selector-content">
        <div class="selector-options">
          <button
            class="selector-option"
            :class="{ active: mode === 'create' }"
            @click="mode = 'create'"
          >
            <div class="option-icon">
              <Plus :size="24" />
            </div>
            <div class="option-content">
              <h3>Create New Activity</h3>
              <p>Create a brand new activity for this program</p>
            </div>
          </button>

          <button
            class="selector-option"
            :class="{ active: mode === 'existing' }"
            @click="mode = 'existing'"
          >
            <div class="option-icon">
              <ListPlus :size="24" />
            </div>
            <div class="option-content">
              <h3>Add Existing Activity</h3>
              <p>Add an activity from another program</p>
            </div>
          </button>
        </div>

        <!-- Create New Activity Form -->
        <div v-if="mode === 'create'" class="activity-form">
          <form @submit.prevent="handleCreateNew">
            <div class="form-group">
              <label class="form-label">Activity Name</label>
              <input 
                v-model="formData.name" 
                type="text" 
                class="form-input" 
                placeholder="e.g., Wakeboarding, Pottery"
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                rows="3"
                placeholder="Describe this activity..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Duration (minutes)</label>
              <input 
                v-model.number="formData.durationMinutes" 
                type="number" 
                class="form-input" 
                min="1"
                placeholder="e.g., 60, 120"
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Default Location (Optional)</label>
              <Autocomplete
                v-model="formData.defaultRoomId"
                :options="roomOptions"
                placeholder="Select a default location"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Default Capacity (Optional)</label>
              <input 
                v-model.number="formData.defaultCapacity" 
                type="number" 
                class="form-input" 
                min="1"
                placeholder="Maximum number of campers"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Staff Requirements</label>
              <div class="grid grid-cols-2">
                <div>
                  <label class="form-label text-xs">Minimum Staff</label>
                  <input 
                    v-model.number="formData.minStaff" 
                    type="number" 
                    class="form-input" 
                    min="0"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label class="form-label text-xs">Maximum Staff</label>
                  <input 
                    v-model.number="formData.maxStaff" 
                    type="number" 
                    class="form-input" 
                    min="0"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Required Certifications (Optional)</label>
              <SelectionList
                v-model="selectedCertificationIds"
                :items="store.certifications"
                item-type="certification"
                placeholder="Select a certification..."
                empty-text="No certifications required"
                add-button-text="Add"
                mode="multiple"
                :get-label-fn="(cert) => cert.name"
                :get-initials-fn="(cert) => cert.name.substring(0, 2).toUpperCase()"
                :get-options-fn="(cert) => ({ label: cert.name, value: cert.id })"
              />
              <p class="form-help-text">Staff assigned to events using this activity will need these certifications</p>
            </div>

            <div class="form-group mb-2">
              <label class="form-label">Color</label>
              <ColorPicker v-model="formData.color" />
            </div>
          </form>
        </div>

        <!-- Existing Activities List -->
        <div v-if="mode === 'existing'" class="existing-activities">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              class="form-input"
              placeholder="Search activities..."
            />
          </div>

          <div v-if="availableActivities.length === 0" class="empty-message">
            <p v-if="searchQuery">No activities match your search.</p>
            <p v-else>No activities available to add. All existing activities are already in this program.</p>
          </div>

          <div v-else class="activities-list">
            <div
              v-for="activity in availableActivities"
              :key="activity.id"
              class="activity-item"
              :class="{ selected: selectedActivityId === activity.id }"
              @click="selectActivity(activity.id)"
            >
              <div class="activity-info">
                <div class="activity-header">
                  <h4>{{ activity.name }}</h4>
                  <span class="activity-duration">{{ activity.durationMinutes }} min</span>
                </div>
                <p v-if="activity.description" class="activity-description">
                  {{ activity.description }}
                </p>
                <div class="activity-programs">
                  <span
                    v-for="programId in activity.programIds"
                    :key="programId"
                    class="program-badge"
                  >
                    {{ getProgramName(programId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button
        v-if="mode === 'create'"
        class="btn btn-primary"
        @click="handleCreateNew"
      >
        Create New Activity
      </button>
      <button
        v-if="mode === 'existing'"
        class="btn btn-primary"
        :disabled="!selectedActivityId"
        @click="handleAddExisting"
      >
        Add Selected Activity
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { Activity } from '@/types/api';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import SelectionList from '@/components/SelectionList.vue';
import { Plus, ListPlus } from 'lucide-vue-next';

interface ActivityFormData {
  name: string;
  description: string;
  durationMinutes: number;
  defaultRoomId: string;
  requiredCertifications: string[];
  minStaff: number;
  maxStaff: number;
  defaultCapacity: number;
  color: string;
}

export default defineComponent({
  name: 'ActivitySelectorModal',
  components: {
    BaseModal,
    Autocomplete,
    ColorPicker,
    SelectionList,
    Plus,
    ListPlus,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    programId: {
      type: String,
      required: true,
    },
  },
  emits: ['close', 'create-new', 'add-existing'],
  data() {
    return {
      mode: 'create' as 'create' | 'existing',
      selectedActivityId: null as string | null,
      searchQuery: '',
      formData: {
        name: '',
        description: '',
        durationMinutes: 60,
        defaultRoomId: '',
        requiredCertifications: [],
        minStaff: 0,
        maxStaff: 0,
        defaultCapacity: 0,
        color: '#6366F1',
      } as ActivityFormData,
      selectedCertificationIds: [] as string[],
    };
  },
  computed: {
    store() {
      return useCampStore();
    },
    programActivities() {
      return this.store.getActivitiesInProgram(this.programId);
    },
    programActivityIds() {
      return new Set(this.programActivities.map(a => a.id));
    },
    filteredActivities(): Activity[] {
      // Get all activities not in this program
      const activities = this.store.activities.filter(
        a => !a.programIds.includes(this.programId)
      );

      // Apply search filter
      if (!this.searchQuery.trim()) {
        return activities;
      }

      const query = this.searchQuery.toLowerCase().trim();
      return activities.filter(
        activity =>
          activity.name.toLowerCase().includes(query) ||
          (activity.description && activity.description.toLowerCase().includes(query))
      );
    },
    availableActivities(): Activity[] {
      return this.filteredActivities;
    },
    roomOptions(): AutocompleteOption[] {
      return this.store.rooms.map(room => ({
        value: room.id,
        label: `${room.name} (${room.type})`,
      }));
    },
  },
  watch: {
    show(newValue) {
      if (newValue) {
        this.resetForm();
      }
    },
  },
  methods: {
    resetForm() {
      this.mode = 'create';
      this.selectedActivityId = null;
      this.searchQuery = '';
      this.formData = {
        name: '',
        description: '',
        durationMinutes: 60,
        defaultRoomId: '',
        requiredCertifications: [],
        minStaff: 0,
        maxStaff: 0,
        defaultCapacity: 0,
        color: '#6366F1',
      };
      this.selectedCertificationIds = [];
    },
    selectActivity(activityId: string) {
      this.selectedActivityId = activityId;
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map(id => {
          const cert = this.store.getCertificationById(id);
          return cert ? cert.name : '';
        })
        .filter(name => name !== '');
    },
    handleCreateNew() {
      const now = new Date().toISOString();
      
      // Convert selected certification IDs to names
      const certifications = this.getCertificationNamesFromIds(this.selectedCertificationIds);
      
      const activityData: Activity = {
        id: crypto.randomUUID(),
        name: this.formData.name,
        description: this.formData.description || undefined,
        programIds: [this.programId],
        durationMinutes: this.formData.durationMinutes,
        defaultRoomId: this.formData.defaultRoomId || undefined,
        requiredCertifications: certifications.length > 0 ? certifications : undefined,
        minStaff: this.formData.minStaff || undefined,
        maxStaff: this.formData.maxStaff || undefined,
        defaultCapacity: this.formData.defaultCapacity || undefined,
        color: this.formData.color || undefined,
        createdAt: now,
        updatedAt: now,
      };

      this.$emit('create-new', activityData);
      this.$emit('close');
    },
    handleAddExisting() {
      if (this.selectedActivityId) {
        this.$emit('add-existing', this.selectedActivityId);
        this.$emit('close');
      }
    },
    getProgramName(programId: string): string {
      const program = this.store.getProgramById(programId);
      return program?.name || 'Unknown Program';
    },
  },
});
</script>

<style scoped>
.selector-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.selector-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.selector-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.selector-option:hover {
  border-color: var(--accent-color);
  background: var(--surface-secondary);
}

.selector-option.active {
  border-color: var(--accent-color);
}

.option-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--surface-secondary);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.selector-option.active .option-icon {
  background: var(--accent-color);
  color: white;
}

.option-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.option-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.existing-activities {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  margin-bottom: 0.5rem;
}

.activities-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  padding: 1rem;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--accent-color);
  background: var(--surface-secondary);
}

.activity-item.selected {
  border-color: var(--accent-color);
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.activity-header h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.activity-duration {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.activity-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.activity-programs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.program-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-message p {
  margin: 0;
}

.activity-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden; /* Prevent horizontal overflow */
}

.activity-form .form-group:last-child {
  margin: 6px;
}

.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.text-xs {
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .selector-options {
    grid-template-columns: 1fr;
  }

  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>

