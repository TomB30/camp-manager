<template>
  <div class="time-blocks-tab view">
    <LoadingState v-if="!isInitialized" message="Loading time blocks..." />
    <template v-else>
      <TabHeader
        title="Time Blocks"
        description="Manage time blocks for scheduling activities and events throughout your camp day."
        action-text="Time Block"
        @action="showModal = true"
      />

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        search-placeholder="Search by name..."
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="timeBlockColumns"
        :rows="timeBlocksData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchTimeBlocks();
        "
        @row-click="selectTimeBlock($event.meta.id)"
      >
        <template #item="{ item }">
          <TimeBlockCard
            :time-block="item"
            @click="selectTimeBlock(item.meta.id)"
          >
            <template #icon>
              <Icon name="Clock" :size="24" :stroke-width="2" />
            </template>
          </TimeBlockCard>
        </template>

        <template #cell-name="{ item }">
          <div class="time-block-name-content">
            <div class="time-block-icon-sm" :style="{ background: '#8b5cf6' }">
              <Icon name="Clock" :size="18" :stroke-width="2" />
            </div>
            <div class="time-block-name">{{ item.meta.name }}</div>
          </div>
        </template>

        <template #empty>
          <EmptyState
            icon-name="Clock"
            title="No time blocks configured"
            message="Add your first time block to start organizing your daily schedule."
            action-text="Time Block"
            @action="showModal = true"
          />
        </template>
      </ServerTable>

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
import { useTimeBlocksStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { TimeBlock } from "@/generated/api";
import { isBackendEnabled } from "@/config/dataSource";
import TimeBlockCard from "@/components/cards/TimeBlockCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import TimeBlockDetailModal from "@/components/modals/TimeBlockDetailModal.vue";
import TimeBlockFormModal from "@/components/modals/TimeBlockFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import Icon from "@/components/Icon.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingState from "@/components/LoadingState.vue";
import { useToast } from "@/composables/useToast";
import { tableUtils } from "@/utils/tableUtils";

export default defineComponent({
  name: "TimeBlocksTab",
  components: {
    TimeBlockCard,
    FilterBar,
    ConfirmModal,
    ServerTable,
    ViewToggle,
    TimeBlockDetailModal,
    TimeBlockFormModal,
    EmptyState,
    Icon,
    TabHeader,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("timeBlocks", {
        searchQuery: "",
        viewMode: "grid" as "grid" | "table",
        pagination: {
          offset: 0,
          limit: 20,
          total: 0,
          sortBy: undefined,
          sortOrder: "asc" as "asc" | "desc",
        },
      });

    const timeBlocksStore = useTimeBlocksStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      timeBlocksStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      timeBlocksData: [] as TimeBlock[],
      showModal: false,
      showConfirmModal: false,
      editingTimeBlockId: null as string | null,
      selectedTimeBlockId: null as string | null,
      confirmAction: null as (() => void) | null,
      timeBlockColumns: [
        tableUtils.newTableColumn({
          name: "name",
          label: "Name",
          field: (row: TimeBlock) => row.meta.name,
          sortable: true,
        }),
        tableUtils.newTableColumn({
          name: "description",
          label: "Description",
          field: (row: TimeBlock) => row.meta.description,
        }),
        tableUtils.newTableColumn({
          name: "startTime",
          label: "Start Time",
          field: (row: TimeBlock) => row.spec.startTime,
          sortable: true,
          format: (value: string) => this.formatTime(value),
        }),
        tableUtils.newTableColumn({
          name: "endTime",
          label: "End Time",
          field: (row: TimeBlock) => row.spec.endTime,
          sortable: true,
          format: (value: string) => this.formatTime(value),
        }),
      ],
    };
  },
  computed: {
    selectedTimeBlock(): TimeBlock | null {
      if (!this.selectedTimeBlockId) return null;
      return (
        this.timeBlocksData.find(
          (tb) => tb.meta.id === this.selectedTimeBlockId,
        ) || null
      );
    },
  },
  methods: {
    async fetchTimeBlocks(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.timeBlocksStore.loadTimeBlocks();
        this.timeBlocksData = Array.isArray(response)
          ? response
          : response.items;
      } else {
        try {
          this.loading = true;
          const response = await this.timeBlocksStore.loadTimeBlocksPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.timeBlocksData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch time blocks:", error);
          this.timeBlocksData = [];
        } finally {
          this.loading = false;
        }
      }
    },

    clearFilters() {
      this.updateFilters({
        searchQuery: "",
        pagination: {
          ...this.filters.pagination,
          offset: 0,
        },
      });
    },

    selectTimeBlock(timeBlockId: string) {
      this.selectedTimeBlockId = timeBlockId;
    },

    formatTime(time: string): string {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    },

    calculateDuration(startTime: string, endTime: string): string {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      const durationMinutes = endTotalMinutes - startTotalMinutes;

      if (durationMinutes < 60) {
        return `${durationMinutes}m`;
      }

      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      if (minutes === 0) {
        return `${hours}h`;
      }

      return `${hours}h ${minutes}m`;
    },

    editTimeBlock() {
      if (!this.selectedTimeBlock) return;
      this.editingTimeBlockId = this.selectedTimeBlock.meta.id;
      this.selectedTimeBlockId = null;
      this.showModal = true;
    },

    deleteTimeBlockConfirm() {
      if (!this.selectedTimeBlockId) return;

      this.confirmAction = async () => {
        if (this.selectedTimeBlockId) {
          await this.timeBlocksStore.deleteTimeBlock(this.selectedTimeBlockId);
          await this.fetchTimeBlocks();
          this.toast.success("Time block deleted successfully");
          this.selectedTimeBlockId = null;
        }
      };
      this.showConfirmModal = true;
    },

    async handleConfirmAction() {
      if (this.confirmAction) {
        await this.confirmAction();
      }
      this.showConfirmModal = false;
      this.confirmAction = null;
    },

    handleCancelConfirm() {
      this.showConfirmModal = false;
      this.confirmAction = null;
    },

    closeModal() {
      this.showModal = false;
      this.editingTimeBlockId = null;
      this.fetchTimeBlocks();
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchTimeBlocks();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchTimeBlocks();
    },
  },
});
</script>

<style scoped lang="scss">
.time-block-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-block-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.time-block-name {
  font-weight: 500;
  color: var(--text-primary);
}
</style>
