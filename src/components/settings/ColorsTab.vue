<template>
  <div class="colors-tab">
    <TabHeader
      title="Color Palette"
      description="Manage the colors available throughout your camp system. These colors will be used in events, programs, groups, and more."
      action-text="Color"
      @action="showAddModal = true"
    >
      <template #action-icon>
        <Plus :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-if="colorsStore.colors.length > 0"
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredColors.length"
      :total-count="colorsStore.colors.length"
      @clear="clearFilters"
    />

    <!-- Empty State -->
    <EmptyState
      v-if="colorsStore.colors.length === 0"
      type="empty"
      title="No Colors Yet"
      message="Add your first color to start customizing your camp's color palette."
      action-text="+ Color"
      @action="showAddModal = true"
    >
      <template #icon>
        <Palette :size="64" stroke-width="1.5" />
      </template>
    </EmptyState>

    <!-- Colors Grid -->
    <div v-else class="colors-grid">
      <ColorCard
        v-for="color in filteredColors"
        :key="color.id"
        :color="color"
        @edit="editColor"
        @delete="deleteColorConfirm"
      />
    </div>

    <!-- Add/Edit Color Modal -->
    <ColorFormModal
      :show="showAddModal || showEditModal"
      :is-editing="!!editingColor"
      :form-data="formData"
      @close="closeModal"
      @save="saveColor"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      title="Delete Color"
      message="Are you sure you want to delete this color?"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleDeleteColor"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useColorsStore } from '@/stores';
import type { CampColor } from '@/types';
import { Plus, Palette } from 'lucide-vue-next';
import TabHeader from '@/components/settings/TabHeader.vue';
import ColorCard from '@/components/cards/ColorCard.vue';
import ColorFormModal from '@/components/modals/ColorFormModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar from '@/components/FilterBar.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useToast } from '@/composables/useToast';

export default defineComponent({
  name: 'ColorsTab',
  components: {
    Plus,
    Palette,
    TabHeader,
    ColorCard,
    ColorFormModal,
    ConfirmModal,
    FilterBar,
    EmptyState,
  },
  setup() {
    const colorsStore = useColorsStore();
    const toast = useToast();
    return { colorsStore, toast };
  },
  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      showConfirmModal: false,
      editingColor: null as CampColor | null,
      colorToDelete: null as CampColor | null,
      searchQuery: '',
      formData: {
        name: '',
        hexValue: '#3B82F6',
      },
    };
  },
  computed: {
    filteredColors(): CampColor[] {
      let filtered = this.colorsStore.colors;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter((color) =>
          color.name.toLowerCase().includes(query) ||
          color.hexValue.toLowerCase().includes(query)
        );
      }

      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    editColor(color: CampColor) {
      this.editingColor = color;
      this.formData = {
        name: color.name,
        hexValue: color.hexValue,
      };
      this.showEditModal = true;
    },

    deleteColorConfirm(color: CampColor) {
      this.colorToDelete = color;
      this.showConfirmModal = true;
    },

    async handleDeleteColor() {
      if (!this.colorToDelete) return;
      
      try {
        await this.colorsStore.deleteColor(this.colorToDelete.id);
        this.toast.success('Color deleted successfully');
        this.showConfirmModal = false;
        this.colorToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to delete color');
      }
    },

    async saveColor(data: { name: string; hexValue: string }) {
      try {
        if (this.editingColor) {
          // Update existing
          await this.colorsStore.updateColor({
            ...this.editingColor,
            name: data.name,
            hexValue: data.hexValue,
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Color updated successfully');
        } else {
          // Create new
          await this.colorsStore.addColor({
            id: crypto.randomUUID(),
            name: data.name,
            hexValue: data.hexValue,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Color added successfully');
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save color');
      }
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.editingColor = null;
      this.formData = {
        name: '',
        hexValue: '#3B82F6',
      };
    },

    clearFilters() {
      this.searchQuery = '';
    },
  },
});
</script>

<style scoped>
.colors-tab {
  animation: slideIn 0.3s ease;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.colors-grid .empty-state {
  grid-column: 1 / -1;
}

.color-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-input-group .form-control {
  flex: 1;
}

.color-picker-input {
  width: 60px;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  padding: 4px;
  background: white;
}

.color-preview-large {
  height: 100px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--border-light);
}

.preview-label {
  color: white;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 1.125rem;
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
  .colors-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
}
</style>

