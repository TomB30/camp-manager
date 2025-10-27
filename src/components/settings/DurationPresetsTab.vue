<template>
  <div class="duration-presets-tab">
    <TabHeader
      title="Duration Presets"
      description="Configure preset durations for quick selection when creating activities and events."
      action-text="Duration Preset"
      @action="showFormModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <FilterBar
      v-if="durationPresetsStore.durationPresets.length > 0"
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredPresets.length"
      :total-count="durationPresetsStore.durationPresets.length"
      @clear="clearFilters"
    />

    <EmptyState
      v-if="durationPresetsStore.durationPresets.length === 0"
      type="empty"
      title="No Duration Presets Yet"
      message="Add your first duration preset to quickly create activities and events with standard durations."
      action-text="Duration Preset"
      @action="showFormModal = true"
      icon-name="Timer"
    />

    <div v-else class="presets-list">
      <DurationPresetCard
        v-for="preset in filteredPresets"
        :key="preset.id"
        :duration-preset="preset"
        @click="selectPreset"
      />
    </div>

    <DurationPresetDetailModal
      v-if="!!selectedPreset"
      :duration-preset="selectedPreset"
      @close="selectedPresetId = null"
      @edit="editPresetFromDetail"
      @delete="deletePresetConfirm"
    />

    <DurationPresetFormModal
      v-if="showFormModal"
      :preset-id="editingPreset?.id"
      @close="closeModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      title="Delete Duration Preset"
      message="Are you sure you want to delete this duration preset?"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleDeletePreset"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useDurationPresetsStore } from "@/stores";
import type { DurationPreset } from "@/types";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import DurationPresetCard from "@/components/cards/DurationPresetCard.vue";
import DurationPresetDetailModal from "@/components/modals/DurationPresetDetailModal.vue";
import DurationPresetFormModal from "@/components/modals/DurationPresetFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "DurationPresetsTab",
  components: {
    Icon,
    TabHeader,
    DurationPresetCard,
    DurationPresetDetailModal,
    DurationPresetFormModal,
    ConfirmModal,
    FilterBar,
    EmptyState,
  },
  setup() {
    const durationPresetsStore = useDurationPresetsStore();
    const toast = useToast();
    return { durationPresetsStore, toast };
  },
  data() {
    return {
      showFormModal: false,
      showConfirmModal: false,
      selectedPresetId: null as string | null,
      editingPreset: null as DurationPreset | null,
      presetToDelete: null as string | null,
      searchQuery: "",
    };
  },
  computed: {
    selectedPreset(): DurationPreset | null {
      if (!this.selectedPresetId) return null;
      return (
        this.durationPresetsStore.getDurationPresetById(
          this.selectedPresetId,
        ) || null
      );
    },
    filteredPresets(): DurationPreset[] {
      let presets = this.durationPresetsStore.sortedDurationPresets;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        presets = presets.filter(
          (preset) =>
            preset.name.toLowerCase().includes(query) ||
            preset.description?.toLowerCase().includes(query),
        );
      }

      return presets;
    },
  },
  methods: {
    selectPreset(presetId: string) {
      this.selectedPresetId = presetId;
    },
    editPresetFromDetail(preset: DurationPreset) {
      this.editingPreset = preset;
      this.selectedPresetId = null;
      this.showFormModal = true;
    },
    deletePresetConfirm(presetId: string) {
      this.presetToDelete = presetId;
      this.selectedPresetId = null;
      this.showConfirmModal = true;
    },
    async handleDeletePreset() {
      if (!this.presetToDelete) return;

      try {
        await this.durationPresetsStore.deleteDurationPreset(
          this.presetToDelete,
        );
        this.toast.success("Duration preset deleted successfully");
        this.showConfirmModal = false;
        this.presetToDelete = null;
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to delete duration preset",
        );
      }
    },
    closeModal() {
      this.showFormModal = false;
      this.editingPreset = null;
    },
    clearFilters() {
      this.searchQuery = "";
    },
  },
});
</script>

<style scoped>
.duration-presets-tab {
  width: 100%;
}

.presets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .presets-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

