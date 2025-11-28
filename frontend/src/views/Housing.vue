<template>
  <div class="cabins-tab view">
    <LoadingState v-if="!isInitialized" message="Loading housing..." />
    <template v-else>
      <TabHeader
        title="Housing"
        description="Manage all sleeping accommodations where campers and family groups will stay during their time at camp."
        action-text="Room"
        @action="showModal = true"
      />

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
        :columns="roomColumns"
        :rows="housingRoomsData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchHousingRooms();
        "
        @row-click="selectRoom"
      >
        <template #item="{ item }">
          <HousingRoomCard
            :room="item"
            :groups="getGroupsForRoom(item.meta.id)"
            @click="selectRoom(item)"
          />
        </template>

        <template #empty>
          <EmptyState
            icon-name="Bed"
            title="No housing configured"
            message="Add your first room to start managing sleeping accommodations for campers."
            action-text="Room"
            @action="showModal = true"
          />
        </template>
      </ServerTable>

      <HousingRoomDetailModal
        v-if="!!selectedRoomId"
        :room="selectedRoom"
        :groups="selectedRoomGroups"
        @close="selectedRoomId = null"
        @edit="editRoom"
        @delete="deleteRoomConfirm"
      />

      <HousingRoomFormModal
        v-if="showModal"
        :room-id="editingRoomId || undefined"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Housing Room"
        message="Are you sure you want to delete this housing room?"
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
import { useHousingRoomsStore, useGroupsStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { HousingRoom, Group } from "@/generated/api";
import type { QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
import HousingRoomCard from "@/components/cards/HousingRoomCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import HousingRoomDetailModal from "@/components/modals/HousingRoomDetailModal.vue";
import HousingRoomFormModal from "@/components/modals/HousingRoomFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingState from "@/components/LoadingState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "CabinsTab",
  components: {
    HousingRoomCard,
    FilterBar,
    ConfirmModal,
    ServerTable,
    ViewToggle,
    HousingRoomDetailModal,
    HousingRoomFormModal,
    EmptyState,
    TabHeader,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } = usePageFilters("housing", {
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

    const housingRoomsStore = useHousingRoomsStore();
    const groupsStore = useGroupsStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      housingRoomsStore,
      groupsStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      housingRoomsData: [] as HousingRoom[],
      showModal: false,
      showConfirmModal: false,
      editingRoomId: null as string | null,
      selectedRoomId: null as string | null,
      confirmAction: null as (() => void) | null,
      roomColumns: [
        {
          name: "name",
          label: "Room Name",
          field: (row: HousingRoom) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "beds",
          label: "Capacity",
          field: (row: HousingRoom) => row.spec.beds,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "bathroom",
          label: "Bathroom",
          field: (row: HousingRoom) => row.spec.bathroom,
          align: "left" as const,
          format: (value: string | undefined) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "-",
        }
      ] as QTableColumn[],
    };
  },
  async created() {
    await this.groupsStore.loadGroups();
  },
  computed: {
    selectedRoom(): HousingRoom | null {
      if (!this.selectedRoomId) return null;
      return (
        this.housingRoomsData.find((r) => r.meta.id === this.selectedRoomId) ||
        null
      );
    },
    selectedRoomGroups(): Group[] {
      if (!this.selectedRoomId) return [];
      return this.getGroupsForRoom(this.selectedRoomId);
    },
  },
  methods: {
    async fetchHousingRooms(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.housingRoomsStore.loadHousingRooms();
        this.housingRoomsData = Array.isArray(response) ? response : response.items;
      } else {
        try {
          const response = await this.housingRoomsStore.loadHousingRoomsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.housingRoomsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch housing rooms:", error);
          this.housingRoomsData = [];
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

    selectRoom(room: HousingRoom) {
      this.selectedRoomId = room.meta.id;
    },

    getGroupsForRoom(roomId: string): Group[] {
      return this.groupsStore.groups.filter(
        (g) => g.spec.housingRoomId === roomId
      );
    },

    editRoom(room: HousingRoom) {
      this.editingRoomId = room.meta.id;
      this.selectedRoomId = null;
      this.showModal = true;
    },

    deleteRoomConfirm() {
      if (!this.selectedRoomId) return;

      this.confirmAction = async () => {
        if (this.selectedRoomId) {
          await this.housingRoomsStore.deleteHousingRoom(this.selectedRoomId);
          await this.fetchHousingRooms();
          this.toast.success("Housing room deleted successfully");
          this.selectedRoomId = null;
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
      this.editingRoomId = null;
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchHousingRooms();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchHousingRooms();
    },
  },
});
</script>
