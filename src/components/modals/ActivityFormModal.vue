<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Activity' : 'Create New Activity'"
    @close="$emit('close')"
  >
    <template #body>
      <ActivityForm
        v-model="localFormData"
        v-model:selected-certification-ids="selectedCertificationIds"
        v-model:is-custom-duration="isCustomDuration"
        :room-options="roomOptions"
        :certifications="store.certifications"
        @submit="handleSave"
      />
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
import ActivityForm, { type ActivityFormData } from '@/components/ActivityForm.vue';
import { type AutocompleteOption } from '@/components/Autocomplete.vue';
import type { Activity } from '@/types/api';

export default defineComponent({
  name: 'ActivityFormModal',
  components: {
    BaseModal,
    ActivityForm,
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
        defaultLocationId: '',
        requiredCertifications: [],
        minStaff: 0,
        maxStaff: 0,
        defaultCapacity: 0,
        color: '#6366F1',
      } as ActivityFormData,
      selectedCertificationIds: [] as string[],
      isCustomDuration: false,
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
      return this.store.locations.map(room => ({
        value: room.id,
        label: `${room.name} (${room.type})`,
      }));
    },
    presetDurations(): number[] {
      return [30, 60, 90, 120, 180, 240, 480];
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
          defaultLocationId: this.activity.defaultLocationId || '',
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
        // Check if duration matches any preset
        this.isCustomDuration = !this.presetDurations.includes(this.activity!.durationMinutes);
      } else {
        this.localFormData = {
          name: '',
          description: '',
          durationMinutes: 60,
          defaultLocationId: '',
          requiredCertifications: [],
          minStaff: 0,
          maxStaff: 0,
          defaultCapacity: 0,
          color: '#6366F1',
        };
        this.selectedCertificationIds = [];
        this.isCustomDuration = false;
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
        defaultLocationId: this.localFormData.defaultLocationId || undefined,
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


