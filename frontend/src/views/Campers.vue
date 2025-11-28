<template>
  <div class="view">
    <LoadingState v-if="!isInitialized" message="Loading campers..." />
    <template v-else>
      <TabHeader
        title="Campers"
        description="Manage your campers and their registrations, allergies, and sessions."
        action-text="Camper"
      >
        <template v-slot:actions>
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item clickable v-close-popup @click="showModal = true">
                <q-item-section>From Scratch</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="showCSVModal = true">
                <q-item-section>From CSV</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </template>
      </TabHeader>

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        search-placeholder="Search by name..."
        @clear="clearFilters"
      >
        <template #filters>
          <div class="row q-gutter-x-sm items-center">
            <BaseInput
              v-model="filters.minAge"
              type="number"
              clearable
              label="Minimum Age"
              :min="0"
              :max="100"
              style="width: 150px"
              @update:model-value="
                updateFilter('minAge', $event);
                fetchCampers();
              "
            />
            <BaseSelect
              v-model="filters.gender"
              :options="genderOptions"
              @update:model-value="
                updateFilter('gender', $event);
                fetchCampers();
              "
              label="Filter by Gender"
            />
            <BaseSelect
              v-model="filters.sessionId"
              :options="sessionOptions"
              @update:model-value="
                updateFilter('sessionId', $event);
                fetchCampers();
              "
              label="Filter by Session"
            />
            <BaseSelect
              v-model="filters.housingGroupId"
              :options="housingGroupOptions"
              @update:model-value="
                updateFilter('housingGroupId', $event);
                fetchCampers();
              "
              label="Filter by Housing"
            />
          </div>
        </template>
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="camperColumns"
        :rows="campersData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchCampers();
        "
        @row-click="selectCamper"
      >
        <template #item="{ item }">
          <CamperCard
            :camper="item"
            :formatted-gender="formatGender(item.spec.gender)"
            :session-name="getSessionName(item.spec.sessionId)"
            @click="selectCamper(item.meta.id)"
          />
        </template>

        <template #cell-name="{ item }">
          <div class="camper-name-content">
            <AvatarInitials
              :first-name="item.meta.name.split(' ')[0]"
              :last-name="item.meta.name.split(' ').slice(1).join(' ')"
              size="sm"
            />
            <div class="camper-fullname">
              {{ item.meta.name }}
            </div>
          </div>
        </template>

        <template #empty>
          <EmptyState
            type="empty"
            title="No Campers Yet"
            message="Add your first camper to start managing registrations and camp activities."
            action-text="Camper"
            @action="showModal = true"
            icon-name="UsersRound"
          />
        </template>
      </ServerTable>

      <CamperDetailModal
        v-if="!!selectedCamperId"
        :camper="selectedCamper"
        @close="selectedCamperId = null"
        @edit="editCamper"
        @delete="deleteCamperConfirm"
      />

      <CamperFormModal
        v-if="showModal"
        :camper-id="editingCamperId || undefined"
        @close="closeModal"
      />

      <CamperCSVModal
        v-if="showCSVModal"
        @close="showCSVModal = false"
        @imported="handleImportSuccess"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Camper"
        :message="`Are you sure you want to delete ${camperToDelete?.name}?`"
        details="This action cannot be undone. The camper will be removed from all events and their housing assignment."
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmDelete"
        @cancel="handleCancelDelete"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCampersStore, useGroupsStore, useSessionsStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { Camper } from "@/generated/api";
import type { QTableColumn } from "quasar";
import AvatarInitials from "@/components/AvatarInitials.vue";
import CamperCard from "@/components/cards/CamperCard.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import CamperDetailModal from "@/components/modals/CamperDetailModal.vue";
import CamperFormModal from "@/components/modals/CamperFormModal.vue";
import CamperCSVModal from "@/components/modals/CamperCSVModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import Icon from "@/components/Icon.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { dateUtils } from "@/utils/dateUtils";
import LoadingState from "@/components/LoadingState.vue";
import { isBackendEnabled } from "@/config/dataSource";
import BaseSelect from "@/components/common/BaseSelect.vue";

export default defineComponent({
  name: "Campers",
  components: {
    AvatarInitials,
    CamperCard,
    ConfirmModal,
    FilterBar,
    ServerTable,
    ViewToggle,
    EmptyState,
    CamperDetailModal,
    CamperFormModal,
    CamperCSVModal,
    TabHeader,
    Icon,
    BaseButton,
    LoadingState,
    BaseSelect,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("campers", {
        searchQuery: "",
        minAge: "",
        maxAge: "",
        gender: "",
        sessionId: "",
        housingGroupId: "",
        viewMode: "grid" as "grid" | "table",
        pagination: {
          offset: 0,
          limit: 20,
          total: 0,
          sortBy: "name" as "name" | "birthday" | "gender" | "sessionId",
          sortOrder: "asc" as "asc" | "desc",
        },
      });

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
    };
  },
  data() {
    return {
      loading: false,
      campersData: [] as Camper[],
      selectedCamperId: null as string | null,
      showModal: false,
      showCSVModal: false,
      editingCamperId: null as string | null,
      showConfirmModal: false,
      camperToDelete: null as { id: string; name: string } | null,
      camperColumns: [
        {
          name: "name",
          label: "Name",
          field: (row: Camper) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "birthday",
          label: "Age",
          field: (row: Camper) => row.spec.birthday,
          align: "left" as const,
          sortable: true,
          format: (value: string) => this.calculateAge(value) + " Years Old",
        },
        {
          name: "gender",
          label: "Gender",
          field: (row: Camper) => row.spec.gender,
          align: "left" as const,
          sortable: true,
          format: (value: string) => this.formatGender(value),
        },
        {
          name: "sessionId",
          label: "Session",
          field: (row: Camper) => row.spec.sessionId,
          align: "left" as const,
          format: (value: string) => this.getSessionName(value),
          sortable: true,
        },
      ] as QTableColumn[],
    };
  },
  async created() {
    await Promise.all([
      this.campersStore.loadCampers(),
      this.sessionsStore.loadSessions(),
      this.groupsStore.loadGroups(),
    ]);
  },
  computed: {
    genderOptions() {
      return [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ];
    },
    sessionOptions() {
      return this.sessionsStore.sessions.map((s) => ({
        label: s.meta.name,
        value: s.meta.id,
      }));
    },
    housingGroupOptions() {
      return this.groupsStore.groups
        .filter((g) => g.spec.housingRoomId)
        .map((h) => ({ label: h.meta.name, value: h.meta.id }));
    },
    groupsStore() {
      return useGroupsStore();
    },
    campersStore() {
      return useCampersStore();
    },
    sessionsStore() {
      return useSessionsStore();
    },
    selectedCamper(): Camper | null {
      if (!this.selectedCamperId) return null;
      return (
        this.campersData.find((c) => c.meta.id === this.selectedCamperId) ||
        null
      );
    },
  },
  methods: {
    async fetchCampers(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        this.campersData = await this.campersStore.loadCampers();
      } else {
        try {
          const response = await this.campersStore.loadCampersPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
            filterBy: this.buildFilterBy(),
          });

          this.campersData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch campers:", error);
          this.campersData = [];
        }
      }
    },
    buildFilterBy(): string[] {
      const filterBy = [];
      if (this.filters.minAge) {
        const dateOfMinAge = new Date(
          new Date().setFullYear(
            new Date().getFullYear() - Number(this.filters.minAge),
          ),
        );
        filterBy.push(`birthday<=${dateOfMinAge.toISOString()}`);
      }
      if (this.filters.maxAge) {
        const dateOfMaxAge = new Date(
          new Date().setFullYear(
            new Date().getFullYear() - Number(this.filters.maxAge),
          ),
        );
        filterBy.push(`birthday>=${dateOfMaxAge.toISOString()}`);
      }
      if (this.filters.gender) {
        filterBy.push(`gender==${this.filters.gender}`);
      }
      if (this.filters.sessionId) {
        filterBy.push(`sessionId==${this.filters.sessionId}`);
      }
      if (this.filters.housingGroupId) {
        filterBy.push(`housingGroupId==${this.filters.housingGroupId}`);
      }
      return filterBy;
    },
    calculateAge(birthday: string): number {
      return birthday ? dateUtils.calculateAge(birthday) : 0;
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
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    getSessionName(sessionId: string | undefined): string {
      if (!sessionId) return "No session";
      const session = this.sessionsStore.sessions.find(
        (s) => s.meta.id === sessionId,
      );
      return session?.meta.name || "Unknown Session";
    },
    selectCamper(camper: Camper): void {
      this.selectedCamperId = camper.meta.id;
    },
    editCamper(): void {
      if (!this.selectedCamper) return;

      this.editingCamperId = this.selectedCamper.meta.id;
      this.selectedCamperId = null;
      this.showModal = true;
    },
    deleteCamperConfirm(): void {
      if (!this.selectedCamperId) return;
      const camper = this.campersStore.getCamperById(this.selectedCamperId);
      if (!camper) return;

      this.camperToDelete = {
        id: this.selectedCamperId,
        name: `${camper.meta.name.split(" ")[0]} ${camper.meta.name.split(" ").slice(1).join(" ")}`,
      };
      this.showConfirmModal = true;
    },
    async handleConfirmDelete(): Promise<void> {
      if (!this.camperToDelete) return;

      await this.campersStore.deleteCamper(this.camperToDelete.id);
      await this.fetchCampers();
      this.selectedCamperId = null;
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    handleCancelDelete(): void {
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    closeModal(): void {
      this.showModal = false;
      this.editingCamperId = null;
    },
    async handleImportSuccess(): Promise<void> {
      // Reload campers after successful import
      await this.fetchCampers();
      this.showCSVModal = false;
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchCampers();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchCampers();
    },
  },
});
</script>

<style scoped lang="scss">
.camper-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.camper-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.camper-fullname {
  font-weight: 500;
  color: var(--text-primary);
}
</style>
