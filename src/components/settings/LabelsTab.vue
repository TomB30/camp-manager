<template>
  <div class="labels-tab">
    <TabHeader
      title="Labels"
      description="Create and manage labels to categorize and filter entities throughout your camp system. Labels can be applied to campers, staff, events, programs, and more."
      action-text="Label"
      @action="showAddModal = true"
    >
      <template #action-icon>
        <Plus :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-if="store.labels.length > 0"
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredLabels.length"
      :total-count="store.labels.length"
      @clear="clearFilters"
    />

    <!-- Empty State -->
    <EmptyState
      v-if="store.labels.length === 0"
      type="empty"
      title="No Labels Yet"
      message="Add your first label to start categorizing and organizing your camp entities."
      action-text="+ Label"
      @action="showAddModal = true"
    >
      <template #icon>
        <Tag :size="64" stroke-width="1.5" />
      </template>
    </EmptyState>

    <!-- Labels Grid -->
    <div v-else class="labels-grid">
      <LabelCard
        v-for="label in filteredLabels"
        :key="label.id"
        :label="label"
        @edit="editLabel"
        @delete="deleteLabelConfirm"
      />
    </div>

    <!-- Add/Edit Label Modal -->
    <LabelFormModal
      :show="showAddModal || showEditModal"
      :is-editing="!!editingLabel"
      :form-data="formData"
      @close="closeModal"
      @save="saveLabel"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showConfirmModal"
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
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { Label } from '@/types';
import { Plus, Tag } from 'lucide-vue-next';
import TabHeader from '@/components/settings/TabHeader.vue';
import LabelCard from '@/components/cards/LabelCard.vue';
import LabelFormModal from '@/components/modals/LabelFormModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar from '@/components/FilterBar.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useToast } from '@/composables/useToast';

export default defineComponent({
  name: 'LabelsTab',
  components: {
    Plus,
    Tag,
    TabHeader,
    LabelCard,
    LabelFormModal,
    ConfirmModal,
    FilterBar,
    EmptyState,
  },
  setup() {
    const store = useCampStore();
    const toast = useToast();
    return { store, toast };
  },
  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      showConfirmModal: false,
      editingLabel: null as Label | null,
      labelToDelete: null as Label | null,
      searchQuery: '',
      formData: {
        name: '',
        description: '',
        colorId: '',
      },
    };
  },
  computed: {
    filteredLabels(): Label[] {
      let filtered = this.store.labels;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter((label) =>
          label.name.toLowerCase().includes(query) ||
          (label.description && label.description.toLowerCase().includes(query))
        );
      }

      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    editLabel(label: Label) {
      this.editingLabel = label;
      this.formData = {
        name: label.name,
        description: label.description || '',
        colorId: label.colorId || '',
      };
      this.showEditModal = true;
    },

    deleteLabelConfirm(label: Label) {
      this.labelToDelete = label;
      this.showConfirmModal = true;
    },

    async handleDeleteLabel() {
      if (!this.labelToDelete) return;
      
      try {
        await this.store.deleteLabel(this.labelToDelete.id);
        this.toast.success('Label deleted successfully');
        this.showConfirmModal = false;
        this.labelToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to delete label');
      }
    },

    async saveLabel(data: { name: string; description?: string; colorId?: string }) {
      try {
        if (this.editingLabel) {
          // Update existing
          await this.store.updateLabel({
            ...this.editingLabel,
            name: data.name,
            description: data.description,
            colorId: data.colorId || undefined,
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Label updated successfully');
        } else {
          // Create new
          await this.store.addLabel({
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description,
            colorId: data.colorId || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Label added successfully');
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save label');
      }
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.editingLabel = null;
      this.formData = {
        name: '',
        description: '',
        colorId: '',
      };
    },

    clearFilters() {
      this.searchQuery = '';
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

