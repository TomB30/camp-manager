<template>
  <div class="cabins-tab">
    <TabHeader
      title="Housing"
      description="Manage all sleeping accommodations where campers and family groups will stay during their time at camp."
      action-text="Room"
      @action="showModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredRooms.length"
      :total-count="housingRoomsStore.housingRooms.length"
      @clear="clearFilters"
    >
      <template #prepend>
        <ViewToggle v-model="viewMode" />
      </template>
    </FilterBar>

    <!-- Empty State -->
    <EmptyState
      v-if="housingRoomsStore.housingRooms.length === 0"
      icon-name="Bed"
      title="No housing configured"
      message="Add your first room to start managing sleeping accommodations for campers."
      action-text="Room"
      @action="showModal = true"
    />

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="rooms-grid">
      <HousingRoomCard
        v-for="room in filteredRooms"
        :key="room.meta.id"
        :room="room"
        :groups="getGroupsForRoom(room.meta.id)"
        @click="selectRoom(room.meta.id)"
      />
    </div>

    <!-- Table View -->
    <DataTable
      v-else
      :columns="roomColumns"
      :data="filteredRooms"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      row-key="id"
    >
      <template #cell-name="{ item }">
        <div class="cabin-name-content">
          <div class="cabin-icon-sm">
            <Icon name="Bed" :size="18" :stroke-width="2" />
          </div>
          <div class="cabin-name">{{ item.meta.name }}</div>
        </div>
      </template>

      <template #cell-beds="{ item }">
        <span class="badge badge-primary badge-sm">{{ item.beds }} beds</span>
      </template>

      <template #cell-location="{ item }">
        <span v-if="item.areaId">
          {{ areasStore.getAreaById(item.areaId)?.meta.name || "Unknown" }}
        </span>
        <span v-else>—</span>
      </template>

      <template #cell-groups="{ item }">
        <div
          v-if="getGroupsForRoom(item.meta.id).length > 0"
          class="flex gap-1 flex-wrap"
        >
          <span
            v-for="group in getGroupsForRoom(item.meta.id)"
            :key="group.meta.id"
            class="badge badge-success badge-sm"
          >
            {{ group.meta.name }}
          </span>
        </div>
        <span v-else class="text-caption">None</span>
      </template>

      <template #cell-actions="{ item }">
        <BaseButton
          outline
          color="grey-8"
          size="sm"
          @click="selectRoom(item.meta.id)"
          label="View Details"
        />
      </template>
    </DataTable>

    <HousingRoomDetailModal
      v-if="!!selectedRoomId"
      :room="selectedRoom"
      :groups="selectedRoomGroups"
      @close="selectedRoomId = null"
      @edit="editRoom"
      @delete="deleteRoomConfirm"
      @view-group="viewGroup"
    />

    <HousingRoomFormModal
      v-if="showModal"
      :room-id="editingRoomId || undefined"
      @close="closeModal"
    />
    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :details="confirmModalDetails"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useGroupsStore,
  useHousingRoomsStore,
  useSessionsStore,
} from "@/stores";
import type { Group, HousingRoom } from "@/generated/api";
import HousingRoomCard from "@/components/cards/HousingRoomCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import HousingRoomDetailModal from "@/components/modals/HousingRoomDetailModal.vue";
import HousingRoomFormModal from "@/components/modals/HousingRoomFormModal.vue";
import EmptyState from "@/components/EmptyState.vue";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import { useToast } from "@/composables/useToast";
import { useAreasStore } from "@/stores";

export default defineComponent({
  name: "HousingTab",
  components: {
    HousingRoomCard,
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    HousingRoomDetailModal,
    HousingRoomFormModal,
    EmptyState,
    TabHeader,
    Icon,
  },
  setup() {
    const housingRoomsStore = useHousingRoomsStore();
    const areasStore = useAreasStore();
    const sessionsStore = useSessionsStore();
    const toast = useToast();
    const groupsStore = useGroupsStore();
    return { housingRoomsStore, areasStore, sessionsStore, toast, groupsStore };
  },
  data() {
    return {
      selectedRoomId: null as string | null,
      showModal: false,
      editingRoomId: null as string | null,
      showConfirmModal: false,
      confirmModalTitle: "",
      confirmModalMessage: "",
      confirmModalDetails: "",
      confirmAction: null as (() => void) | null,
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      roomColumns: [
        { key: "name", label: "Room Name", width: "250px" },
        { key: "beds", label: "Beds", width: "100px" },
        { key: "location", label: "Area", width: "250px" },
        { key: "groups", label: "Family Groups", width: "250px" },
        { key: "actions", label: "Actions", width: "140px" },
      ],
    };
  },
  computed: {
    selectedRoom(): HousingRoom | null {
      if (!this.selectedRoomId) return null;
      return (
        this.housingRoomsStore.getHousingRoomById(this.selectedRoomId) || null
      );
    },
    filteredRooms(): HousingRoom[] {
      let rooms: HousingRoom[] = this.housingRoomsStore.housingRooms;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        rooms = rooms.filter((room: HousingRoom) => {
          const areaName = room.spec.areaId
            ? this.areasStore.getAreaById(room.spec.areaId)?.meta.name
            : undefined;
          return (
            room.meta.name.toLowerCase().includes(query) ||
            (areaName && areaName.toLowerCase().includes(query))
          );
        });
      }

      return rooms;
    },
    selectedRoomGroups(): Array<any> {
      if (!this.selectedRoomId) return [];
      return this.getGroupsForRoom(this.selectedRoomId).map((g: Group) => {
        const session = this.sessionsStore.sessions.find(
          (s) => s.meta.id === g.spec.sessionId,
        );
        return {
          id: g.meta.id,
          name: g.meta.name,
          description: g.meta.description,
          camperCount: this.groupsStore.getCampersInGroup(g.meta.id).length,
          staffCount: g.spec.staffIds?.length || 0,
          sessionId: g.spec.sessionId,
          sessionName: session?.meta.name || "Unknown Session",
          sessionDateRange: session
            ? `${new Date(session.spec.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - ${new Date(session.spec.endDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )}`
            : "Unknown",
        };
      });
    },
  },
  methods: {
    viewGroup(groupId: string): void {
      this.$router.push(`/groups?id=${groupId}`);
    },
    clearFilters(): void {
      this.searchQuery = "";
    },
    getGroupsForRoom(housingRoomId: string): Group[] {
      return this.groupsStore
        .getGroupsByType({ hasHousing: true, hasSession: true })
        .filter((g) => g.spec.housingRoomId === housingRoomId);
    },
    selectRoom(housingRoomId: string): void {
      this.selectedRoomId = housingRoomId;
    },
    editRoom(): void {
      if (!this.selectedRoom) return;

      this.editingRoomId = this.selectedRoom.meta.id;

      this.selectedRoomId = null;
      this.showModal = true;
    },
    deleteRoomConfirm(): void {
      if (!this.selectedRoomId) return;

      const groupCount = this.getGroupsForRoom(this.selectedRoomId).length;

      this.confirmModalTitle = "Delete Room";
      this.confirmModalMessage = "Are you sure you want to delete this room?";
      this.confirmModalDetails =
        groupCount > 0
          ? `This room has ${groupCount} group(s) assigned. You will need to reassign them to another room.`
          : "";

      this.confirmAction = async () => {
        if (this.selectedRoomId) {
          try {
            await this.housingRoomsStore.deleteHousingRoom(this.selectedRoomId);
            this.toast.success("Room deleted successfully");
            this.selectedRoomId = null;
          } catch (error: any) {
            this.toast.error(error.message || "Failed to delete room");
          }
        }
      };

      this.showConfirmModal = true;
    },
    async handleConfirmAction(): Promise<void> {
      if (this.confirmAction) {
        await this.confirmAction();
      }
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    handleCancelConfirm(): void {
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    closeModal(): void {
      this.showModal = false;
      this.editingRoomId = null;
    },
  },
});
</script>

<style scoped>
.cabins-tab {
  animation: slideIn 0.3s ease;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.rooms-grid .empty-state {
  grid-column: 1 / -1;
}

.cabin-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cabin-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cabin-name {
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

@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
