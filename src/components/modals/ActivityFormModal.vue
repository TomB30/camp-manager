<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Activity' : 'Create New Activity'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Activity Name</label>
          <input 
            v-model="localFormData.name" 
            type="text" 
            class="form-input" 
            placeholder="e.g., Wakeboarding, Pottery"
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="localFormData.description"
            class="form-textarea"
            rows="3"
            placeholder="Describe this activity..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Duration (minutes)</label>
          <input 
            v-model.number="localFormData.durationMinutes" 
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
            v-model="localFormData.defaultRoomId"
            :options="roomOptions"
            placeholder="Select a default location"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Default Capacity (Optional)</label>
          <input 
            v-model.number="localFormData.defaultCapacity" 
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
                v-model.number="localFormData.minStaff" 
                type="number" 
                class="form-input" 
                min="0"
                placeholder="Min"
              />
            </div>
            <div>
              <label class="form-label text-xs">Maximum Staff</label>
              <input 
                v-model.number="localFormData.maxStaff" 
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

        <div class="form-group">
          <label class="form-label">Color</label>
          <ColorPicker v-model="localFormData.color" />
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Save Changes' : 'Create Activity' }}
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useCampStore } from '@/stores/campStore';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import SelectionList from '@/components/SelectionList.vue';
import type { Activity } from '@/types/api';

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
  name: 'ActivityFormModal',
  components: {
    BaseModal,
    Autocomplete,
    ColorPicker,
    SelectionList,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    activity: {
      type: Object as PropType<Activity | null>,
      default: null,
    },
    programId: {
      type: String,
      default: null,
    },
    programIds: {
      type: Array as PropType<string[]>,
      default: null,
    },
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: {
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
    isEditing() {
      return !!this.activity;
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
      if (this.activity) {
        this.localFormData = {
          name: this.activity.name,
          description: this.activity.description || '',
          durationMinutes: this.activity.durationMinutes,
          defaultRoomId: this.activity.defaultRoomId || '',
          requiredCertifications: this.activity.requiredCertifications ? [...this.activity.requiredCertifications] : [],
          minStaff: this.activity.minStaff || 0,
          maxStaff: this.activity.maxStaff || 0,
          defaultCapacity: this.activity.defaultCapacity || 0,
          color: this.activity.color || '#6366F1',
        };
        // Convert certification names to IDs for the SelectionList
        this.selectedCertificationIds = this.getCertificationIdsFromNames(
          this.activity.requiredCertifications || []
        );
      } else {
        this.localFormData = {
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
      }
    },
    getCertificationIdsFromNames(names: string[]): string[] {
      return names
        .map(name => {
          const cert = this.store.certifications.find(c => c.name === name);
          return cert ? cert.id : '';
        })
        .filter(id => id !== '');
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map(id => {
          const cert = this.store.getCertificationById(id);
          return cert ? cert.name : '';
        })
        .filter(name => name !== '');
    },
    handleSave() {
      // Determine programIds for the activity
      let activityProgramIds: string[];
      
      if (this.activity) {
        // Editing existing activity - keep its current programIds
        activityProgramIds = this.activity.programIds;
      } else if (this.programIds && this.programIds.length > 0) {
        // Creating new activity with specified programIds
        activityProgramIds = this.programIds;
      } else if (this.programId) {
        // Creating new activity with single programId
        activityProgramIds = [this.programId];
      } else {
        console.error('programId or programIds is required for new activities');
        return;
      }

      const now = new Date().toISOString();
      
      // Convert selected certification IDs to names
      const certifications = this.getCertificationNamesFromIds(this.selectedCertificationIds);
      
      const activityData: Activity = {
        id: this.activity?.id || crypto.randomUUID(),
        name: this.localFormData.name,
        description: this.localFormData.description || undefined,
        programIds: activityProgramIds,
        durationMinutes: this.localFormData.durationMinutes,
        defaultRoomId: this.localFormData.defaultRoomId || undefined,
        requiredCertifications: certifications.length > 0 ? certifications : undefined,
        minStaff: this.localFormData.minStaff || undefined,
        maxStaff: this.localFormData.maxStaff || undefined,
        defaultCapacity: this.localFormData.defaultCapacity || undefined,
        color: this.localFormData.color || undefined,
        createdAt: this.activity?.createdAt || now,
        updatedAt: now,
      };

      this.$emit('save', activityData);
    },
  },
});
</script>

<style scoped>
.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>

