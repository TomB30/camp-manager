<template>
  <div class="labels-tab">
    <TabHeader
      title="Labels"
      description="Create and manage labels to categorize and filter entities throughout your camp system. Labels can be applied to campers, staff, events, programs, and more."
      action-text="Label"
      @action="showAddModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <FilterBar
      v-if="labelsStore.labels.length > 0"
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredLabels.length"
      :total-count="labelsStore.labels.length"
      @clear="clearFilters"
    />

    <EmptyState
      v-if="labelsStore.labels.length === 0"
      type="empty"
      title="No Labels Yet"
      message="Add your first label to start categorizing and organizing your camp entities."
      action-text="Label"
      @action="showAddModal = true"
      icon-name="Tag"
    />

    <div v-else class="labels-grid">
      <LabelCard
        v-for="label in filteredLabels"
        :key="label.meta.id"
        :label="label"
        @edit="editLabel"
        @delete="deleteLabelConfirm"
      />
    </div>

    <LabelFormModal
      v-if="showAddModal || showEditModal"
      :label-id="editingLabel?.meta.id"
      @close="closeModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      title="Delete Label"
      message="Are you sure you want to delete this label? It will be removed from all entities that use it."
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleDeleteLabel"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useLabelsStore } from "@/stores";
import type { Label } from "@/types";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import LabelCard from "@/components/cards/LabelCard.vue";
import LabelFormModal from "@/components/modals/LabelFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "LabelsTab",
  components: {
    Icon,
    TabHeader,
    LabelCard,
    LabelFormModal,
    ConfirmModal,
    FilterBar,
    EmptyState,
  },
  setup() {
    const labelsStore = useLabelsStore();
    const toast = useToast();
    return { labelsStore, toast };
  },
  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      showConfirmModal: false,
      editingLabel: null as Label | null,
      labelToDelete: null as Label | null,
      searchQuery: "",
    };
  },
  computed: {
    filteredLabels(): Label[] {
      let filtered = this.labelsStore.labels;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (label: Label) =>
            label.meta.name.toLowerCase().includes(query) ||
            (label.meta.description &&
              label.meta.description.toLowerCase().includes(query)),
        );
      }

      return [...filtered].sort((a, b) =>
        a.meta.name.localeCompare(b.meta.name),
      );
    },
  },
  methods: {
    editLabel(label: Label) {
      this.editingLabel = label;
      this.showEditModal = true;
    },

    deleteLabelConfirm(label: Label) {
      this.labelToDelete = label;
      this.showConfirmModal = true;
    },

    async handleDeleteLabel() {
      if (!this.labelToDelete) return;

      try {
        await this.labelsStore.deleteLabel(this.labelToDelete.meta.id);
        this.toast.success("Label deleted successfully");
        this.showConfirmModal = false;
        this.labelToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete label");
      }
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.editingLabel = null;
    },

    clearFilters() {
      this.searchQuery = "";
    },
  },
});
</script>

<style scoped>
.labels-tab {
  animation: slideIn 0.3s ease;
}

.labels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.labels-grid .empty-state {
  grid-column: 1 / -1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .labels-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
}
</style>
