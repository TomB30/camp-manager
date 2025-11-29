<template>
  <div class="sessions-tab view">
    <LoadingState v-if="!isInitialized" message="Loading sessions..." />
    <template v-else>
      <TabHeader
        title="Camp Sessions"
        description="Define the time periods (weeks, months, or custom durations) that campers can register for at your camp."
        action-text="Session"
        @action="showFormModal = true"
      />

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        search-placeholder="Search by name..."
        @clear="clearFilters"
      >
        <template #filters>
          <div class="row q-gutter-x-sm items-center">
            <BaseInput
              v-model="filters.startDate"
              type="date"
              clearable
              label="Filter by Start Date"
              @update:model-value="
                updateFilter('startDate', $event);
                fetchSessions();
              "
            />
            <BaseInput
              v-model="filters.endDate"
              type="date"
              clearable
              label="Filter by End Date"
              @update:model-value="
                updateFilter('endDate', $event);
                fetchSessions();
              "
            />
          </div>
        </template>
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="sessionColumns"
        :rows="sessionsData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchSessions();
        "
        @row-click="selectSession($event.meta.id)"
      >
        <template #item="{ item }">
          <SessionCard :session="item" @click="selectSession(item.meta.id)" />
        </template>

        <template #empty>
          <EmptyState
            type="empty"
            title="No Sessions Yet"
            message="Add your first session to define the registration periods for your camp."
            action-text="Session"
            @action="showFormModal = true"
            icon-name="CalendarDays"
          />
        </template>
      </ServerTable>

      <SessionDetailModal
        v-if="!!selectedSession"
        :session="selectedSession"
        @close="selectedSessionId = null"
        @edit="editSessionFromDetail"
        @delete="deleteSessionConfirm"
      />

      <SessionFormModal
        v-if="showFormModal"
        :session-id="editingSession?.meta.id"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Session"
        message="Are you sure you want to delete this session?"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleDeleteSession"
        @cancel="showConfirmModal = false"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useSessionsStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { Session } from "@/generated/api";
import { isBackendEnabled } from "@/config/dataSource";
import TabHeader from "@/components/settings/TabHeader.vue";
import SessionCard from "@/components/cards/SessionCard.vue";
import SessionDetailModal from "@/components/modals/SessionDetailModal.vue";
import SessionFormModal from "@/components/modals/SessionFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";
import LoadingState from "@/components/LoadingState.vue";
import { tableUtils } from "@/utils/tableUtils";

export default defineComponent({
  name: "SessionsTab",
  components: {
    TabHeader,
    SessionCard,
    SessionDetailModal,
    SessionFormModal,
    ConfirmModal,
    FilterBar,
    ServerTable,
    ViewToggle,
    EmptyState,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("sessions", {
        searchQuery: "",
        startDate: "",
        endDate: "",
        viewMode: "grid" as "grid" | "table",
        pagination: {
          offset: 0,
          limit: 20,
          total: 0,
          sortBy: undefined,
          sortOrder: "asc" as "asc" | "desc",
        },
      });

    const sessionsStore = useSessionsStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      sessionsStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      sessionsData: [] as Session[],
      showFormModal: false,
      showConfirmModal: false,
      editingSession: null as Session | null,
      selectedSessionId: null as string | null,
      sessionToDelete: null as Session | null,
      sessionColumns: [
        tableUtils.newTableColumn({
          name: "name",
          label: "Name",
          field: (row: Session) => row.meta.name,
          sortable: true,
        }),
        tableUtils.newTableColumn({
          name: "description",
          label: "Description",
          field: (row: Session) => row.meta.description,
          format: (value: string | undefined) => value || "No description",
          style:
            "max-width: 350px; padding-right: 10px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",
        }),
        tableUtils.newTableColumn({
          name: "startDate",
          label: "Start Date",
          field: (row: Session) => row.spec.startDate,
          sortable: true,
          format: (value: string) => new Date(value).toLocaleDateString(),
        }),
        tableUtils.newTableColumn({
          name: "endDate",
          label: "End Date",
          field: (row: Session) => row.spec.endDate,
          sortable: true,
          format: (value: string) => new Date(value).toLocaleDateString(),
        }),
      ],
    };
  },
  computed: {
    selectedSession(): Session | null {
      if (!this.selectedSessionId) return null;
      return (
        this.sessionsData.find((s) => s.meta.id === this.selectedSessionId) ||
        null
      );
    },
  },
  methods: {
    async fetchSessions(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.sessionsStore.loadSessions();
        this.sessionsData = Array.isArray(response) ? response : response;
      } else {
        try {
          const response = await this.sessionsStore.loadSessionsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
            filterBy: this.buildFilterBy(),
          });

          this.sessionsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch sessions:", error);
          this.sessionsData = [];
        }
      }
    },

    buildFilterBy(): string[] {
      const filterBy = [];
      if (this.filters.startDate) {
        filterBy.push(`startDate==${this.filters.startDate}`);
      }
      if (this.filters.endDate) {
        filterBy.push(`endDate==${this.filters.endDate}`);
      }
      return filterBy;
    },

    clearFilters(): void {
      this.updateFilters({
        searchQuery: "",
        pagination: {
          ...this.filters.pagination,
          offset: 0,
        },
      });
    },

    selectSession(sessionId: string): void {
      this.selectedSessionId = sessionId;
    },

    editSessionFromDetail(session: Session): void {
      this.selectedSessionId = null;
      this.editSession(session);
    },

    editSession(session: Session): void {
      this.editingSession = session;
      this.showFormModal = true;
    },

    deleteSessionConfirm(id: string): void {
      const session = this.sessionsData.find((s) => s.meta.id === id);
      if (session) {
        this.sessionToDelete = session;
        this.selectedSessionId = null;
        this.showConfirmModal = true;
      }
    },

    async handleDeleteSession(): Promise<void> {
      if (!this.sessionToDelete) return;

      try {
        await this.sessionsStore.deleteSession(this.sessionToDelete.meta.id);
        await this.fetchSessions();
        this.toast.success("Session deleted successfully");
        this.showConfirmModal = false;
        this.sessionToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete session");
      }
    },

    closeModal(): void {
      this.showFormModal = false;
      this.editingSession = null;
      this.fetchSessions();
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchSessions();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchSessions();
    },
  },
});
</script>

<style scoped>
.sessions-tab {
  animation: slideIn 0.3s ease;
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
