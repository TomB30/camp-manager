<template>
  <div class="time-blocks-tab view">
    <LoadingState v-if="loading" message="Loading time blocks..." />
    <template v-else>
      <TabHeader
        title="Time Blocks"
        description="Manage time blocks for scheduling activities and events throughout your camp day."
        action-text="Time Block"
        @action="showModal = true"
      />

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        search-placeholder="Search by time block name..."
        :filtered-count="filteredTimeBlocks.length"
        :total-count="timeBlocksStore.timeBlocks.length"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Empty State -->
      <EmptyState
        v-if="timeBlocksStore.timeBlocks.length === 0"
        icon-name="Clock"
        title="No time blocks configured"
        message="Add your first time block to start organizing your daily schedule."
        action-text="Time Block"
        @action="showModal = true"
      />

      <!-- Grid View -->
      <transition-group
        v-else-if="viewMode === 'grid'"
        name="list"
        tag="div"
        class="time-blocks-grid transition-wrapper"
      >
        <TimeBlockCard
          v-for="timeBlock in filteredTimeBlocks"
          :key="timeBlock.meta.id"
          :time-block="timeBlock"
          @click="selectTimeBlock(timeBlock.meta.id)"
        >
          <template #icon>
            <Icon name="Clock" :size="24" :stroke-width="2" />
          </template>
        </TimeBlockCard>
      </transition-group>

      <!-- Table View -->
      <DataTable
        v-else
        :columns="timeBlockColumns"
        :data="filteredTimeBlocks"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="time-block-name-content">
            <div class="time-block-icon-sm" :style="{ background: '#8b5cf6' }">
              <Icon name="Clock" :size="18" :stroke-width="2" />
            </div>
            <div class="time-block-name">{{ item.meta.name }}</div>
          </div>
        </template>

        <template #cell-startTime="{ item }">
          <span>{{ formatTime(item.spec.startTime) }}</span>
        </template>

        <template #cell-endTime="{ item }">
          <span>{{ formatTime(item.spec.endTime) }}</span>
        </template>

        <template #cell-duration="{ item }">
          <span class="badge badge-success badge-sm">
            {{ calculateDuration(item.spec.startTime, item.spec.endTime) }}
          </span>
        </template>

        <template #cell-actions="{ item }">
          <BaseButton
            outline
            color="grey-8"
            size="sm"
            @click="selectTimeBlock(item.meta.id)"
            label="View Details"
          />
        </template>
      </DataTable>

      <TimeBlockDetailModal
        v-if="!!selectedTimeBlockId"
        :time-block="selectedTimeBlock"
        @close="selectedTimeBlockId = null"
        @edit="editTimeBlock"
        @delete="deleteTimeBlockConfirm"
      />

      <TimeBlockFormModal
        v-if="showModal"
        :time-block-id="editingTimeBlockId || undefined"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Time Block"
        message="Are you sure you want to delete this time block?"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmAction"
        @cancel="handleCancelConfirm"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// Stores
import { useTimeBlocksStore } from "@/stores";
// Types
import type { TimeBlock } from "@/generated/api";
// Components
import TimeBlockCard from "@/components/cards/TimeBlockCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import TimeBlockDetailModal from "@/components/modals/TimeBlockDetailModal.vue";
import TimeBlockFormModal from "@/components/modals/TimeBlockFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import Icon from "@/components/Icon.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingState from "@/components/LoadingState.vue";
// Composables
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "TimeBlocksTab",
  components: {
    TimeBlockCard,
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    TimeBlockDetailModal,
    TimeBlockFormModal,
    EmptyState,
    Icon,
    TabHeader,
    LoadingState,
  },
  setup() {
    const timeBlocksStore = useTimeBlocksStore();
    const toast = useToast();
    return { timeBlocksStore, toast };
  },
  data() {
    return {
      loading: false,
      showModal: false,
      showConfirmModal: false,
      editingTimeBlockId: null as string | null,
      selectedTimeBlockId: null as string | null,
      searchQuery: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      confirmAction: null as (() => void) | null,
      timeBlockColumns: [
        { key: "name", label: "Time Block Name", sortable: true },
        { key: "startTime", label: "Start Time", sortable: true },
        { key: "endTime", label: "End Time", sortable: true },
        { key: "duration", label: "Duration" },
        { key: "actions", label: "", width: "120px" },
      ],
    };
  },
  async created() {
    this.loading = true;
    try {
      await this.timeBlocksStore.loadTimeBlocks();
    } finally {
      this.loading = false;
    }
  },
  computed: {
    filteredTimeBlocks(): TimeBlock[] {
      const timeBlocks = this.timeBlocksStore.timeBlocks;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return timeBlocks.filter((timeBlock: TimeBlock) =>
          timeBlock.meta.name.toLowerCase().includes(query)
        );
      }

      return timeBlocks;
    },
    selectedTimeBlock(): TimeBlock | null {
      if (!this.selectedTimeBlockId) return null;
      return (
        this.timeBlocksStore.getTimeBlockById(this.selectedTimeBlockId) || null
      );
    },
  },
  methods: {
    selectTimeBlock(id: string) {
      this.selectedTimeBlockId = id;
    },
    editTimeBlock(timeBlock: TimeBlock) {
      this.editingTimeBlockId = timeBlock.meta.id;
      this.selectedTimeBlockId = null;
      this.showModal = true;
    },
    deleteTimeBlockConfirm(id: string) {
      this.confirmAction = () => this.deleteTimeBlock(id);
      this.showConfirmModal = true;
      this.selectedTimeBlockId = null;
    },
    async deleteTimeBlock(id: string) {
      try {
        await this.timeBlocksStore.deleteTimeBlock(id);
        this.toast.success("Time block deleted successfully");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete time block");
      }
    },
    closeModal() {
      this.showModal = false;
      this.editingTimeBlockId = null;
    },
    clearFilters() {
      this.searchQuery = "";
    },
    handleConfirmAction() {
      if (this.confirmAction) {
        this.confirmAction();
        this.confirmAction = null;
      }
      this.showConfirmModal = false;
    },
    handleCancelConfirm() {
      this.confirmAction = null;
      this.showConfirmModal = false;
    },
    formatTime(timeString: string): string {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },
    calculateDuration(startTime: string, endTime: string): string {
      const start = this.parseTime(startTime);
      const end = this.parseTime(endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours === 0) {
        return `${mins}m`;
      } else if (mins === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${mins}m`;
    },
    parseTime(timeString: string): Date {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
  },
});
</script>

<style scoped>
.time-blocks-tab {
  animation: slideIn 0.3s ease;
}

.time-blocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.5rem;
}

.time-blocks-grid .empty-state {
  grid-column: 1 / -1;
}

.time-block-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-block-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.time-block-name {
  font-weight: 500;
  color: var(--text-primary);
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
</style>
