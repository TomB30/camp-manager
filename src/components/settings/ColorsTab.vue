<template>
  <div class="colors-tab">
    <TabHeader
      title="Color Palette"
      description="Manage the colors available for programs and events. Set a default color for events not created from activity templates."
      action-text="Color"
      @action="showFormModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <FilterBar
      v-if="colorsStore.colors.length > 0"
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredColors.length"
      :total-count="colorsStore.colors.length"
      @clear="clearFilters"
    />

    <EmptyState
      v-if="colorsStore.colors.length === 0"
      type="empty"
      title="No Colors Yet"
      message="Add your first color to start customizing your camp's color palette."
      action-text="Color"
      @action="showFormModal = true"
      icon-name="Palette"
    />

    <div v-else class="colors-grid">
      <ColorCard
        v-for="color in filteredColors"
        :key="color.id"
        :color="color"
        @edit="editColor"
        @delete="deleteColorConfirm"
      />
    </div>

    <ColorFormModal
      v-if="showFormModal"
      :color-id="editingColor?.id"
      @close="closeModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
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
import { defineComponent } from "vue";
// Stores
import { useColorsStore } from "@/stores";
// Types
import type { Color } from "@/types";
// Components
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import ColorCard from "@/components/cards/ColorCard.vue";
import ColorFormModal from "@/components/modals/ColorFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import EmptyState from "@/components/EmptyState.vue";
// Composables
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ColorsTab",
  components: {
    Icon,
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
      showFormModal: false as boolean,
      showConfirmModal: false as boolean,
      editingColor: null as Color | null,
      colorToDelete: null as Color | null,
      searchQuery: "" as string,
    };
  },
  computed: {
    filteredColors(): Color[] {
      let filtered = this.colorsStore.colors;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (color) =>
            color.name.toLowerCase().includes(query) ||
            color.hexValue.toLowerCase().includes(query),
        );
      }

      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    editColor(color: Color) {
      this.editingColor = color;
      this.showFormModal = true;
    },
    deleteColorConfirm(color: Color) {
      this.colorToDelete = color;
      this.showConfirmModal = true;
    },
    async handleDeleteColor() {
      if (!this.colorToDelete) return;

      try {
        await this.colorsStore.deleteColor(this.colorToDelete.id);
        this.toast.success("Color deleted successfully");
        this.showConfirmModal = false;
        this.colorToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete color");
      }
    },
    closeModal() {
      this.showFormModal = false;
      this.editingColor = null;
    },
    clearFilters() {
      this.searchQuery = "";
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
